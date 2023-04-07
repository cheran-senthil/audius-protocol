package main

import (
	"fmt"
	"log"
	"mediorum/registrar"
	"mediorum/server"
	"os"
	"strings"
	"sync"
	"time"
)

func main() {
	preset := os.Getenv("MEDIORUM_ENV")

	switch preset {
	case "prod":
		startStagingOrProd(true)
	case "stage":
		startStagingOrProd(false)
	case "single":
		startDevInstance()
	default:
		startDevCluster()
	}
}

func startStagingOrProd(isProd bool) {
	g := registrar.NewGraphStaging()
	if isProd {
		g = registrar.NewGraphProd()
	}
	peers, err := g.Peers()
	if err != nil {
		panic(err)
	}

	creatorNodeEndpoint := mustGetenv("creatorNodeEndpoint")
	delegateOwnerWallet := mustGetenv("delegateOwnerWallet")
	privateKey := mustGetenv("delegatePrivateKey")

	config := server.MediorumConfig{
		Self: server.Peer{
			Host:   creatorNodeEndpoint,
			Wallet: delegateOwnerWallet,
		},
		ListenPort:        "1991",
		Peers:             peers,
		ReplicationFactor: 3,
		PrivateKey:        privateKey,
		Dir:               "/mediorum_data",
		PostgresDSN:       os.Getenv("dbUrl"),
		LegacyFSRoot:      getenvWithDefault("storagePath", "/file_storage"),
	}

	ss, err := server.New(config)
	if err != nil {
		log.Fatal(err)
	}

	// for prod: gradual rollout to a subset of hosts
	if isProd {
		hostSubset := []string{"audius.co", "cultur3stake.com"}
		shouldStart := false
		for _, tld := range hostSubset {
			if strings.Contains(config.Self.Host, tld) {
				shouldStart = true
			}
		}
		if !shouldStart {
			log.Println("shouldStart = false... sleeping")
			time.Sleep(time.Hour * 10000)
			log.Fatal("bye")
		}
	}

	ss.MustStart()
}

func mustGetenv(key string) string {
	val := os.Getenv(key)
	if val == "" {
		log.Fatal("missing required env variable: ", key)
	}
	return val
}

func getenvWithDefault(key string, fallback string) string {
	val := os.Getenv(key)
	if val == "" {
		return fallback
	}
	return val
}

func startDevInstance() {
	// synthetic network
	network := devNetwork(7)

	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("PORT env var required")
	}

	config := server.MediorumConfig{
		Self: server.Peer{
			Host:   "http://localhost:" + port,
			Wallet: "0xPort" + port,
		},
		Peers:             network,
		ReplicationFactor: 3,
		Dir:               fmt.Sprintf("/tmp/mediorum_dev_%s", port),
	}

	ss, err := server.New(config)
	if err != nil {
		log.Fatal(err)
	}

	ss.MustStart()
}

func startDevCluster() {
	network := devNetwork(5)
	wg := sync.WaitGroup{}

	for _, peer := range network {
		peer := peer
		config := server.MediorumConfig{
			Self:              peer,
			Peers:             network,
			ReplicationFactor: 3,
			Dir:               fmt.Sprintf("/tmp/mediorum_%s", peer.Wallet),
		}

		wg.Add(1)
		go func() {
			ss, err := server.New(config)
			if err != nil {
				log.Fatal(err)
			}

			ss.MustStart()
			wg.Done()
		}()
	}

	wg.Wait()
}

func devNetwork(n int) []server.Peer {
	network := []server.Peer{}
	for i := 1; i <= n; i++ {
		network = append(network, server.Peer{
			Host:   fmt.Sprintf("http://localhost:199%d", i),
			Wallet: fmt.Sprintf("0xWallet%d", i), // todo keypair stuff
		})
	}
	return network
}
