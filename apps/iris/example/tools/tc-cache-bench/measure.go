package main

import (
	"context"
	"crypto/sha256"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"runtime"
	"sort"
	"strings"
	"time"

	"github.com/skkuding/codedang/apps/iris/src/loader"
	"github.com/skkuding/codedang/apps/iris/src/service/testcase"
)

type localSource struct{ root *os.Root }

func (s localSource) OpenObject(_ context.Context, key string) (io.ReadCloser, error) {
	return s.root.Open(filepath.FromSlash(key))
}

type traffic struct {
	ObjectOpens     int   `json:"objectOpens"`
	BodyBytes       int64 `json:"bodyBytes"`
	BundleOpens     int   `json:"bundleOpens"`
	BundleBodyBytes int64 `json:"bundleBodyBytes"`
}

type countedSource struct {
	source  loader.BundleSource
	traffic traffic
}

func (s *countedSource) OpenObject(ctx context.Context, key string) (io.ReadCloser, error) {
	body, err := s.source.OpenObject(ctx, key)
	if err != nil {
		return nil, err
	}
	s.traffic.ObjectOpens++
	bundle := strings.HasSuffix(key, ".tar.zst")
	if bundle {
		s.traffic.BundleOpens++
	}
	return &countedBody{ReadCloser: body, traffic: &s.traffic, bundle: bundle}, nil
}

type countedBody struct {
	io.ReadCloser
	traffic *traffic
	bundle  bool
}

func (b *countedBody) Read(p []byte) (int, error) {
	n, err := b.ReadCloser.Read(p)
	b.traffic.BodyBytes += int64(n)
	if b.bundle {
		b.traffic.BundleBodyBytes += int64(n)
	}
	return n, err
}

type sample struct {
	Milliseconds float64 `json:"milliseconds"`
	Traffic      traffic `json:"traffic"`
}
type pair struct {
	Trial int    `json:"trial"`
	Cold  sample `json:"cold"`
	Warm  sample `json:"warm"`
}
type summary struct {
	Min    float64 `json:"minMs"`
	Median float64 `json:"medianMs"`
	Max    float64 `json:"maxMs"`
}
type datasetResult struct {
	Dataset dataset `json:"dataset"`
	Pairs   []pair  `json:"pairs"`
	Cold    summary `json:"cold"`
	Warm    summary `json:"warm"`
}
type report struct {
	Source         string          `json:"source"`
	GoVersion      string          `json:"goVersion"`
	Platform       string          `json:"platform"`
	StartedAt      string          `json:"startedAt"`
	CacheDirectory string          `json:"cacheDirectory"`
	Notes          []string        `json:"notes"`
	Results        []datasetResult `json:"results"`
}

func measure(ctx context.Context, suite []dataset, cacheRoot string, source loader.BundleSource, repeats int) (*report, error) {
	if len(suite) == 0 || repeats < 1 || source == nil {
		return nil, fmt.Errorf("suite, source and positive repeats are required")
	}
	for _, d := range suite {
		if d.SetID == "" || d.ManifestKey == "" || d.RawBytes <= 0 || d.BundleBytes <= 0 {
			return nil, fmt.Errorf("invalid dataset %q", d.Name)
		}
	}
	// A fresh directory per invocation and trial ensures a miss without deleting
	// any existing cache. Retain all files, including on failure, for inspection.
	dir, err := os.MkdirTemp(cacheRoot, "tc-bench-*")
	if err != nil {
		return nil, err
	}
	fmt.Fprintln(os.Stderr, "Benchmark cache (retained):", dir)
	result := &report{GoVersion: runtime.Version(), Platform: runtime.GOOS + "/" + runtime.GOARCH, StartedAt: time.Now().UTC().Format(time.RFC3339), CacheDirectory: dir, Notes: []string{
		"Sequential cold/warm pairs; cold means empty TC cache, not cold OS/MinIO caches.",
		"Timer covers GetVersionedTestcase including manifest fetch, download, checksum, extraction and file reads; excludes source initialization, validation of results and compilation/judging.",
		"Counts are successful logical object opens and body bytes read, not HTTP attempts, headers or wire traffic. SDK retries are not separately counted.",
		"Cache files are retained. Synthetic local measurements do not predict production S3 latency.",
	}}
	for i, d := range suite {
		item := datasetResult{Dataset: d}
		for trial := 1; trial <= repeats; trial++ {
			root := filepath.Join(dir, fmt.Sprintf("dataset-%d-trial-%d", i, trial))
			cold, coldHash, err := load(ctx, root, source, d)
			if err != nil {
				return nil, fmt.Errorf("%s trial %d cold: %w", d.Name, trial, err)
			}
			warm, warmHash, err := load(ctx, root, source, d)
			if err != nil {
				return nil, fmt.Errorf("%s trial %d warm: %w", d.Name, trial, err)
			}
			if coldHash != warmHash {
				return nil, fmt.Errorf("%s: cached content differs", d.Name)
			}
			if cold.Traffic.ObjectOpens != 3 || cold.Traffic.BundleOpens != 2 || cold.Traffic.BundleBodyBytes != d.BundleBytes || warm.Traffic.ObjectOpens != 1 || warm.Traffic.BundleOpens != 0 || cold.Traffic.BodyBytes-cold.Traffic.BundleBodyBytes != warm.Traffic.BodyBytes {
				return nil, fmt.Errorf("%s: unexpected cold/warm object traffic", d.Name)
			}
			item.Pairs = append(item.Pairs, pair{Trial: trial, Cold: cold, Warm: warm})
			fmt.Fprintf(os.Stderr, "%s %d/%d: cold %.3f ms, warm %.3f ms\n", d.Name, trial, repeats, cold.Milliseconds, warm.Milliseconds)
		}
		var coldTimes, warmTimes []float64
		for _, pair := range item.Pairs {
			coldTimes = append(coldTimes, pair.Cold.Milliseconds)
			warmTimes = append(warmTimes, pair.Warm.Milliseconds)
		}
		item.Cold, item.Warm = summarize(coldTimes), summarize(warmTimes)
		result.Results = append(result.Results, item)
	}
	return result, nil
}

func load(ctx context.Context, root string, source loader.BundleSource, d dataset) (sample, [32]byte, error) {
	counted := &countedSource{source: source}
	start := time.Now()
	tcs, err := testcase.GetVersionedTestcase(ctx, root, counted, d.SetID, d.ManifestKey, testcase.ALL)
	elapsed := time.Since(start)
	if err != nil {
		return sample{}, [32]byte{}, err
	}
	// Content checks deliberately stay outside the timed loading interval.
	if len(tcs.Elements) != 2 || tcs.Elements[0].Hidden || !tcs.Elements[1].Hidden {
		return sample{}, [32]byte{}, fmt.Errorf("expected public and hidden TC")
	}
	var size int64
	hash := sha256.New()
	for _, tc := range tcs.Elements {
		size += int64(len(tc.In) + len(tc.Out))
		fmt.Fprintf(hash, "%d:%d:%d:", tc.Id, len(tc.In), len(tc.Out))
		io.WriteString(hash, tc.In)
		io.WriteString(hash, tc.Out)
	}
	if size != d.RawBytes {
		return sample{}, [32]byte{}, fmt.Errorf("raw bytes: got %d, expected %d", size, d.RawBytes)
	}
	var digest [32]byte
	copy(digest[:], hash.Sum(nil))
	return sample{Milliseconds: float64(elapsed) / float64(time.Millisecond), Traffic: counted.traffic}, digest, nil
}

func summarize(values []float64) summary {
	sort.Float64s(values)
	n := len(values)
	median := values[n/2]
	if n%2 == 0 {
		median = (values[n/2-1] + values[n/2]) / 2
	}
	return summary{Min: values[0], Median: median, Max: values[n-1]}
}
