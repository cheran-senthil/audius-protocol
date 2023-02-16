package rpcz

import (
	"log"
	"os"
	"testing"

	"comms.audius.co/discovery/config"
	"comms.audius.co/discovery/db"
	"github.com/nats-io/nats.go"
)

var (
	jsc           nats.JetStreamContext
	testValidator *Validator
)

// this runs before all tests (not a per-test setup / teardown)
func TestMain(m *testing.M) {
	discoveryConfig := config.GetDiscoveryConfig()
	config.Init(discoveryConfig.Keys)

	// setup
	os.Setenv("audius_db_url", "postgresql://postgres:postgres@localhost:5454/comtest?sslmode=disable")
	err := db.Dial()
	if err != nil {
		log.Fatal(err)
	}

	// connect to NATS and create JetStream Context
	nc, err := nats.Connect(nats.DefaultURL)
	if err != nil {
		log.Fatal(err)
	}
	jsc, err = nc.JetStream(nats.PublishAsyncMaxPending(256))
	if err != nil {
		log.Fatal(err)
	}

	// create streams
	_, err = jsc.CreateKeyValue(&nats.KeyValueConfig{
		Bucket:    config.RateLimitRulesBucketName,
		Replicas:  config.NatsReplicaCount,
		Placement: config.DiscoveryPlacement(),
	})
	if err != nil {
		log.Fatalf("failed to create rate limit kv %v", err)
	}

	// setup test validator
	limiter, err := NewRateLimiter(jsc)
	if err != nil {
		log.Fatal(err)
	}
	testValidator = &Validator{
		db:      db.Conn,
		limiter: limiter,
	}

	// run tests
	code := m.Run()

	// teardown
	db.Conn.Close()
	nc.Close()

	os.Exit(code)
}
