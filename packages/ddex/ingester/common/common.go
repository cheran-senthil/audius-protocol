package common

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"os"
	"path/filepath"
	"slices"
	"time"

	"ingester/constants"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func MustGetChoreography() constants.DDEXChoreography {
	choreography := os.Getenv("DDEX_CHOREOGRAPHY")
	if choreography == "" {
		log.Fatal("Missing required env var: DDEX_CHOREOGRAPHY")
	}
	if choreography != string(constants.ERNReleaseByRelease) && choreography != string(constants.ERNBatched) {
		log.Fatalf("Invalid value for DDEX_CHOREOGRAPHY: %s", choreography)
	}
	return constants.DDEXChoreography(choreography)
}

type Ingester struct {
	DDEXChoreography  constants.DDEXChoreography
	Ctx               context.Context
	MongoClient       *mongo.Client
	S3Client          *s3.S3
	S3Downloader      *s3manager.Downloader
	S3Uploader        *s3manager.Uploader
	Bucket            string
	CrawlerCursorColl *mongo.Collection
	BatchesColl       *mongo.Collection
	ReleasesColl      *mongo.Collection
	UsersColl         *mongo.Collection
	Logger            *slog.Logger
}

func NewIngester(ctx context.Context) *Ingester {
	s3, s3Session := InitS3Client(slog.Default())
	mongoClient := InitMongoClient(ctx, slog.Default())

	return &Ingester{
		DDEXChoreography:  MustGetChoreography(),
		S3Client:          s3,
		S3Downloader:      s3manager.NewDownloader(s3Session),
		S3Uploader:        s3manager.NewUploader(s3Session),
		MongoClient:       mongoClient,
		Bucket:            MustGetenv("AWS_BUCKET_RAW"),
		CrawlerCursorColl: mongoClient.Database("ddex").Collection("crawler_cursor"),
		BatchesColl:       mongoClient.Database("ddex").Collection("batches"),
		ReleasesColl:      mongoClient.Database("ddex").Collection("releases"),
		UsersColl:         mongoClient.Database("ddex").Collection("users"),
		Ctx:               ctx,
		Logger:            slog.Default(),
	}
}

func (i *Ingester) UpsertBatch(r *Batch) (*mongo.UpdateResult, error) {
	filter := bson.M{"_id": r.BatchID}
	opts := options.Replace().SetUpsert(true)
	return i.BatchesColl.ReplaceOne(i.Ctx, filter, r, opts)
}

func (i *Ingester) UpsertRelease(r *Release) (*mongo.UpdateResult, error) {
	filter := bson.M{"_id": r.ReleaseID}
	opts := options.Replace().SetUpsert(true)
	return i.ReleasesColl.ReplaceOne(i.Ctx, filter, r, opts)
}

func (i *Ingester) UploadDirectory(dirPath, baseDir string) (string, error) {
	entries, err := os.ReadDir(dirPath)
	if err != nil {
		return "", fmt.Errorf("failed to read directory '%s': %w", dirPath, err)
	}

	for _, entry := range entries {
		if slices.Contains(constants.SkipFiles, entry.Name()) {
			continue
		}

		fullPath := filepath.Join(dirPath, entry.Name())
		if entry.IsDir() {
			_, err = i.UploadDirectory(fullPath, filepath.Join(baseDir, entry.Name()))
		} else {
			_, err = i.UploadFile(fullPath, baseDir, entry.Name())
		}
		if err != nil {
			return "", err
		}
	}

	return baseDir, nil
}

func (i *Ingester) UploadFile(filePath, baseDir, fileName string) (string, error) {
	if slices.Contains(constants.SkipFiles, fileName) {
		return "", nil
	}

	file, err := os.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to open file '%s': %w", filePath, err)
	}
	defer file.Close()

	s3Key := filepath.Join(baseDir, fileName)

	_, err = i.S3Uploader.Upload(&s3manager.UploadInput{
		Bucket: aws.String(i.Bucket),
		Key:    aws.String(s3Key),
		Body:   file,
	})
	if err != nil {
		return "", fmt.Errorf("failed to upload '%s' to S3: %w", filePath, err)
	}

	return s3Key, nil
}

func InitMongoClient(ctx context.Context, logger *slog.Logger) *mongo.Client {
	mongoUrl := os.Getenv("DDEX_MONGODB_URL")
	logger.Info("Connecting to mongo...")
	if mongoUrl == "" {
		mongoUrl = "mongodb://mongo:mongo@localhost:27017/ddex?authSource=admin&replicaSet=rs0"
	}
	client, err := mongo.Connect(ctx, options.Client().ApplyURI(mongoUrl))
	if err != nil {
		panic(err)
	}
	return client
}

func InitS3Client(logger *slog.Logger) (*s3.S3, *session.Session) {
	awsRegion := MustGetenv("AWS_REGION")
	awsKey := MustGetenv("AWS_ACCESS_KEY_ID")
	awsSecret := MustGetenv("AWS_SECRET_ACCESS_KEY")
	conf := &aws.Config{
		Region:      aws.String(awsRegion),
		Credentials: credentials.NewStaticCredentials(awsKey, awsSecret, ""),
	}
	if os.Getenv("AWS_ENDPOINT") != "" {
		conf.Endpoint = aws.String(os.Getenv("AWS_ENDPOINT"))
		conf.S3ForcePathStyle = aws.Bool(true)
	}
	sess, err := session.NewSession(conf)
	if err != nil {
		panic(err)
	}
	logger.Info("Connected to s3")
	return s3.New(sess), sess
}

func MustGetenv(key string) string {
	val := os.Getenv(key)
	if val == "" {
		log.Println("Missing required env variable:", key, "sleeping...")
		// If config is incorrect, sleep a bit to prevent container from restarting constantly
		time.Sleep(time.Hour)
		log.Fatal("Missing required env variable:", key)
	}
	return val
}
