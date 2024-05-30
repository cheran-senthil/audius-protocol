package server

import (
	"context"
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"os/exec"
	"runtime"
	"strconv"
	"strings"
	"time"

	"github.com/AudiusProject/audius-protocol/mediorum/cidutil"
	"github.com/AudiusProject/audius-protocol/mediorum/crudr"
	"gocloud.dev/gcerrors"
	"golang.org/x/exp/slices"
)

func (ss *MediorumServer) startAudioAnalyzer() {
	myHost := ss.Config.Self.Host
	work := make(chan *Upload)

	// use most cpus
	numWorkers := runtime.NumCPU() - 2
	if numWorkers < 2 {
		numWorkers = 2
	}

	// on boot... reset any of my wip jobs
	tx := ss.crud.DB.Model(Upload{}).
		Where(Upload{
			AudioAnalyzedBy: myHost,
			Status:          JobStatusBusyAudioAnalysis,
		}).
		Updates(Upload{Status: JobStatusAudioAnalysis})
	if tx.Error != nil {
		ss.logger.Warn("reset stuck audio analyses error" + tx.Error.Error())
	} else if tx.RowsAffected > 0 {
		ss.logger.Info("reset stuck audio analyses", "count", tx.RowsAffected)
	}

	// add a callback to crudr so we can consider audio analyses
	ss.crud.AddOpCallback(func(op *crudr.Op, records interface{}) {
		if op.Table != "uploads" || op.Action != crudr.ActionUpdate {
			return
		}

		uploads, ok := records.(*[]*Upload)
		if !ok {
			log.Printf("unexpected type in audio analysis callback %T", records)
			return
		}
		for _, upload := range *uploads {
			if upload.Status == JobStatusAudioAnalysis && upload.Template == "audio" {
				if upload.TranscodedMirrors == nil {
					ss.logger.Warn("missing full transcoded mp3 data in audio analysis job. skipping", "upload", upload.ID)
					continue
				}
				// only the first mirror transcodes
				if slices.Index(upload.TranscodedMirrors, myHost) == 0 {
					ss.logger.Info("got audio analysis job", "id", upload.ID)
					work <- upload
				}
			}
		}
	})

	// start workers
	for i := 0; i < numWorkers; i++ {
		go ss.startAudioAnalysisWorker(i, work)
	}

	// poll periodically for uploads that slipped thru the cracks.
	// mark uploads with timed out analyses as done
	for {
		time.Sleep(time.Second * 10)
		ss.findMissedAnalysisJobs(work, myHost)
	}
}

func (ss *MediorumServer) findMissedAnalysisJobs(work chan *Upload, myHost string) {
	uploads := []*Upload{}
	ss.crud.DB.Where("status in ?", []string{JobStatusAudioAnalysis, JobStatusBusyAudioAnalysis}).Find(&uploads)

	for _, upload := range uploads {
		mirrors := upload.Mirrors

		myIdx := slices.Index(mirrors, myHost)
		if myIdx == -1 {
			continue
		}
		myRank := myIdx + 1

		logger := ss.logger.With("upload_id", upload.ID, "upload_status", upload.Status, "my_rank", myRank)

		// allow a 1 minute timeout period for audio analysis.
		// upload.AudioAnalyzedAt is set in transcode.go after successfully transcoding a new audio upload,
		// or by the /uploads/:id/analyze endpoint when triggering a re-analysis.
		if time.Since(upload.AudioAnalyzedAt) > time.Minute {
			// mark analysis as timed out and the upload as done.
			// failed or timed out analyses do not block uploads.
			ss.logger.Warn("audio analysis timed out", "upload", upload.ID)

			upload.AudioAnalysisStatus = JobStatusTimeout
			upload.Status = JobStatusDone
			ss.crud.Update(upload)
		}

		// this is already handled by a callback and there's a chance this job gets enqueued twice
		if myRank == 1 && upload.Status == JobStatusAudioAnalysis {
			logger.Info("my upload's audio analysis not started")
			work <- upload
			continue
		}

		// determine if #1 rank worker dropped ball
		timedOut := false
		neverStarted := false

		// for #2 rank worker:
		if myRank == 2 {
			// no recent update?
			timedOut = upload.Status == JobStatusBusyAudioAnalysis &&
				time.Since(upload.AudioAnalyzedAt) > time.Second*20

			// never started?
			neverStarted = upload.Status == JobStatusAudioAnalysis &&
				time.Since(upload.AudioAnalyzedAt) > time.Second*20
		}

		// for #3 rank worker:
		if myRank == 3 {
			// no recent update?
			timedOut = upload.Status == JobStatusBusyAudioAnalysis &&
				time.Since(upload.AudioAnalyzedAt) > time.Second*40

			// never started?
			neverStarted = upload.Status == JobStatusAudioAnalysis &&
				time.Since(upload.AudioAnalyzedAt) > time.Second*40
		}

		if timedOut {
			logger.Info("audio analysis timed out... starting")
			work <- upload
		} else if neverStarted {
			logger.Info("audio analysis never started")
			work <- upload
		}
	}
}

func (ss *MediorumServer) startAudioAnalysisWorker(n int, work chan *Upload) {
	for upload := range work {
		ss.logger.Debug("analyzing audio", "upload", upload.ID)
		err := ss.analyzeAudio(upload)
		if err != nil {
			ss.logger.Warn("audio analysis failed", "upload", upload, "err", err)
		} else {
			ss.logger.Info("audio analysis done", "upload", upload.ID)
		}
	}
}

func (ss *MediorumServer) analyzeAudio(upload *Upload) error {
	upload.AudioAnalyzedBy = ss.Config.Self.Host
	upload.Status = JobStatusBusyAudioAnalysis
	ss.crud.Update(upload)
	ctx := context.Background()

	onError := func(err error) error {
		upload.AudioAnalysisError = err.Error()
		upload.AudioAnalyzedAt = time.Now().UTC()
		upload.AudioAnalysisStatus = JobStatusError
		// failed analyses do not block uploads
		upload.Status = JobStatusDone
		ss.crud.Update(upload)
		return err
	}

	logger := ss.logger.With("upload", upload.ID)

	// pull transcoded file from bucket
	cid, exists := upload.TranscodeResults["320"]
	if !exists {
		err := errors.New("audio upload missing 320kbps cid")
		return onError(err)
	}

	// do not mark the audio analysis job as failed if this node cannot pull the file from its bucket
	// so that the next mirror may pick the job up
	logger = logger.With("cid", cid)
	key := cidutil.ShardCID(cid)
	attrs, err := ss.bucket.Attributes(ctx, key)
	if err != nil {
		if gcerrors.Code(err) == gcerrors.NotFound {
			return errors.New("failed to find audio file on node")
		} else {
			return err
		}
	}
	temp, err := os.CreateTemp("", "audioAnalysisTemp")
	if err != nil {
		logger.Error("failed to create temp file", "err", err)
		return err
	}
	r, err := ss.bucket.NewReader(ctx, key, nil)
	if err != nil {
		logger.Error("failed to read blob", "err", err)
		return err
	}
	defer r.Close()
	_, err = io.Copy(temp, r)
	if err != nil {
		logger.Error("failed to read blob content", "err", err)
		return err
	}
	temp.Sync()
	defer temp.Close()
	defer os.Remove(temp.Name())

	// convert the file to WAV for audio processing
	wavFile := temp.Name()
	// should always be audio/mpeg after transcoding
	if attrs.ContentType == "audio/mpeg" {
		inputFile := temp.Name()
		wavFile = temp.Name() + ".wav"
		defer os.Remove(wavFile)
		err = convertToWav(inputFile, wavFile)
		if err != nil {
			logger.Error("failed to convert MP3 to WAV", "err", err)
			return onError(fmt.Errorf("failed to convert MP3 to WAV: %w", err))
		}
	}

	// analyze BPM
	bpmFloat, err := ss.analyzeBPM(wavFile)
	if err != nil {
		logger.Error("failed to analyze BPM", "err", err)
		return onError(fmt.Errorf("failed to analyze BPM: %w", err))
	}
	bpm := strconv.FormatFloat(bpmFloat, 'f', 1, 64)

	upload.AudioAnalysisResults = map[string]string{
		"bpm": bpm,
	}
	upload.AudioAnalysisError = ""
	ss.crud.Update(upload)

	// analyze musical key
	musicalKey, err := ss.analyzeKey(wavFile)
	if err != nil {
		logger.Error("failed to analyze key", "err", err)
		return onError(fmt.Errorf("failed to analyze key: %w", err))
	}
	if musicalKey == "" || musicalKey == "Unknown" {
		err := fmt.Errorf("unexpected output: %s", musicalKey)
		logger.Error("failed to analyze key", "err", err)
		return onError(fmt.Errorf("failed to analyze key: %w", err))
	}
	upload.AudioAnalysisResults["key"] = musicalKey
	upload.AudioAnalysisError = ""

	// success
	upload.AudioAnalyzedAt = time.Now().UTC()
	upload.AudioAnalysisStatus = JobStatusDone
	upload.Status = JobStatusDone
	ss.crud.Update(upload)

	return nil
}

func (ss *MediorumServer) analyzeKey(filename string) (string, error) {
	cmd := exec.Command("/bin/analyze-key", filename)
	output, err := cmd.CombinedOutput()
	if err != nil {
		exitError, ok := err.(*exec.ExitError)
		if ok {
			return "", fmt.Errorf("command exited with status %d: %s", exitError.ExitCode(), string(output))
		}
		return "", fmt.Errorf("failed to execute command: %v", err)
	}
	formattedOutput := strings.ReplaceAll(string(output), "\n", "")
	return formattedOutput, nil
}

func (ss *MediorumServer) analyzeBPM(filename string) (float64, error) {
	cmd := exec.Command("aubio", "tempo", filename)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return 0, err
	}

	outputStr := string(output)
	lines := strings.Split(outputStr, "\n")
	for _, line := range lines {
		if strings.HasSuffix(line, "bpm") {
			parts := strings.Fields(line)
			if len(parts) > 1 {
				bpm, err := strconv.ParseFloat(parts[0], 64)
				if err != nil {
					return 0, err
				}
				return bpm, nil
			}
		}
	}

	return 0, fmt.Errorf("BPM not found in aubio output")
}

// converts an MP3 file to WAV format using ffmpeg
func convertToWav(inputFile, outputFile string) error {
	cmd := exec.Command("ffmpeg", "-i", inputFile, outputFile)
	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("failed to convert to WAV: %v, output: %s", err, string(output))
	}
	return nil
}