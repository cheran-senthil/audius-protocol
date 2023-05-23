package server

import (
	"context"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"net/url"
	"time"

	"golang.org/x/exp/slog"
)

func (ss *MediorumServer) startBeamClients() {
	for _, peer := range ss.Config.Peers {
		if peer.Host == ss.Config.Self.Host {
			continue
		}
		go ss.startBeamClientForPeer(peer)
	}
}

func (ss *MediorumServer) startBeamClientForPeer(peer Peer) {
	for {
		time.Sleep(jitterSeconds(60, 90))

		result, err := ss.beamFromPeer(peer)
		if err != nil {
			log.Println("beam failed", peer.Host, err)
			time.Sleep(time.Minute * 10)
		} else if result.RowCount > 0 {
			log.Printf("beam OK %+v \n", result)
		}
	}
}

type beamResult struct {
	Host         string
	RowCount     int64
	InsertCount  int64
	DeleteCount  int64
	CursorBefore time.Time
	CursorAfter  time.Time
	Took         time.Duration
}

func (ss *MediorumServer) beamFromPeer(peer Peer) (*beamResult, error) {
	ctx := context.Background()
	client := http.Client{
		Timeout: 5 * time.Minute,
	}

	var cursorBefore time.Time
	ss.pgPool.QueryRow(ctx, `select updated_at from cid_cursor where host = $1`, peer.Host).Scan(&cursorBefore)

	endpoint := fmt.Sprintf("%s?after=%s", peer.ApiPath("internal/beam/files"), url.QueryEscape(cursorBefore.Format(time.RFC3339Nano)))
	startedAt := time.Now()
	logger := slog.With("beam_client", peer.Host)
	resp, err := client.Get(endpoint)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, errors.New(resp.Status)
	}

	// pgx COPY FROM
	conn, err := ss.pgPool.Acquire(ctx)
	if err != nil {
		logger.Warn(err.Error())
		return nil, err
	}
	defer conn.Release()

	conn.Exec(ctx, `create temp table cid_log_temp (like cid_log)`)

	copySql := `COPY cid_log_temp FROM STDIN`
	copys, err := conn.Conn().PgConn().CopyFrom(ctx, resp.Body, copySql)
	if err != nil {
		return nil, err
	}

	// inserts
	inserts, err := conn.Exec(ctx, `insert into cid_lookup (select multihash, $1 from cid_log_temp where is_deleted = false) on conflict do nothing;`, peer.Host)
	if err != nil {
		return nil, err
	}

	// deletes
	deletes, err := conn.Exec(ctx, `delete from cid_lookup where (multihash, host) in (select multihash, $1 from cid_log_temp where is_deleted = true)`, peer.Host)
	if err != nil {
		return nil, err
	}

	var cursorAfter time.Time
	conn.QueryRow(ctx, `select max(updated_at) from cid_log_temp`).Scan(&cursorAfter)
	if !cursorAfter.IsZero() {
		_, err := conn.Exec(ctx, `insert into cid_cursor values ($1, $2) on conflict (host) do update set updated_at = $2`, peer.Host, cursorAfter)
		fmt.Println("update cid_cursor", err)
	}

	conn.Exec(ctx, `drop table if exists cid_log_temp`)

	r := &beamResult{
		Host:         peer.Host,
		RowCount:     copys.RowsAffected(),
		InsertCount:  inserts.RowsAffected(),
		DeleteCount:  deletes.RowsAffected(),
		CursorBefore: cursorBefore,
		CursorAfter:  cursorAfter,
		Took:         time.Since(startedAt),
	}
	return r, nil
}

func jitterSeconds(min, n int) time.Duration {
	return time.Second * time.Duration(min+rand.Intn(n-min))
}
