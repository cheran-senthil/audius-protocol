package server

import (
	"mediorum/cidutil"
	"net/http"
	"os"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestServeImage(t *testing.T) {
	f, err := os.Open("testdata/claudius.jpg")
	assert.NoError(t, err)

	cid, err := cidutil.ComputeFileCID(f)
	assert.NoError(t, err)
	assert.Equal(t, "baeaaaiqseanfsacci4oa4svwgvcr3sq7kt2bduosa3j4qkvpncwpm4su7axjg", cid)

	f.Seek(0, 0)

	s1, s2 := testNetwork[0], testNetwork[1]

	s2.replicateToMyBucket(cid, f)

	// the first time it will go get the orig + generate a resized version
	// the x-dynamic-resize-ok header should be set
	{
		resp, err := http.Get(s1.Config.Self.Host + "/content/" + cid + "/150x150.jpg")
		assert.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		assert.NotEmpty(t, resp.Header.Get("x-dynamic-resize-ok"))
	}

	// the second time it should have the variant on disk
	{
		resp, err := http.Get(s1.Config.Self.Host + "/content/" + cid + "/150x150.jpg")
		assert.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		assert.Empty(t, resp.Header.Get("x-dynamic-resize-ok"))
	}

	// it should also have the orig
	{
		resp, err := http.Get(s1.Config.Self.Host + "/content/" + cid + "/original.jpg")
		assert.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		assert.Empty(t, resp.Header.Get("x-dynamic-resize-ok"))
	}

	// some alternate URLs we need to support??
	{
		resp, err := http.Get(s1.Config.Self.Host + "/content/" + cid)
		assert.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		assert.Empty(t, resp.Header.Get("x-dynamic-resize-ok"))
	}

	// some alternate URLs we need to support??
	{
		resp, err := http.Get(s1.Config.Self.Host + "/content/" + cid + ".jpg")
		assert.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
		assert.Empty(t, resp.Header.Get("x-dynamic-resize-ok"))
	}

	// test with some Qm URLs
	{
		qmKey := "QmQSGUjVkSfGBJCU4dcPn3LC17ikQXbfikGbFUAzL5rcXt/150x150.jpg"
		s2.replicateToMyBucket(qmKey, f)

		resp, err := http.Get(s1.Config.Self.Host + "/content/" + qmKey)
		assert.NoError(t, err)
		assert.Equal(t, 200, resp.StatusCode)
	}

}