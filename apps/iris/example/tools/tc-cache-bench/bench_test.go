package main

import (
	"context"
	"encoding/json"
	"os"
	"path/filepath"
	"reflect"
	"strings"
	"testing"

	"github.com/skkuding/codedang/apps/iris/src/loader"
)

func fixtures(t *testing.T) (string, []dataset) {
	t.Helper()
	dir := filepath.Join(t.TempDir(), "fixtures")
	if err := generate(context.Background(), dir, []int64{64 * 1024}); err != nil {
		t.Fatal(err)
	}
	data, err := os.ReadFile(filepath.Join(dir, "suite.json"))
	if err != nil {
		t.Fatal(err)
	}
	var suite []dataset
	if err := json.Unmarshal(data, &suite); err != nil {
		t.Fatal(err)
	}
	return dir, suite
}

func manifestFor(t *testing.T, dir string, d dataset) *loader.Manifest {
	t.Helper()
	data, err := os.ReadFile(filepath.Join(dir, "objects", filepath.FromSlash(d.ManifestKey)))
	if err != nil {
		t.Fatal(err)
	}
	m, err := loader.ParseManifest(data)
	if err != nil {
		t.Fatal(err)
	}
	return m
}

func TestMeasureRealLoaderColdWarmPairs(t *testing.T) {
	dir, suite := fixtures(t)
	root, err := os.OpenRoot(filepath.Join(dir, "objects"))
	if err != nil {
		t.Fatal(err)
	}
	defer root.Close()
	cache := t.TempDir()
	result, err := measure(context.Background(), suite, cache, localSource{root}, 2)
	if err != nil {
		t.Fatal(err)
	}
	if len(result.Results) != 2 {
		t.Fatal("expected repeat and random datasets")
	}
	for _, item := range result.Results {
		if len(item.Pairs) != 2 {
			t.Fatal("expected two trials")
		}
		for _, pair := range item.Pairs {
			if pair.Cold.Traffic.BundleOpens != 2 || pair.Warm.Traffic.ObjectOpens != 0 || pair.Warm.Traffic.BodyBytes != 0 {
				t.Fatalf("wrong traffic: %+v", pair)
			}
		}
	}
	// A second invocation must start cold despite the retained previous caches.
	again, err := measure(context.Background(), suite, cache, localSource{root}, 1)
	if err != nil {
		t.Fatal(err)
	}
	if again.CacheDirectory == result.CacheDirectory {
		t.Fatal("cache directory reused")
	}
	if suite[0].BundleBytes >= suite[1].BundleBytes {
		t.Fatal("repeat data should compress better than random bytes")
	}
}

func TestFixturesDeterministicAndRefuseOverwrite(t *testing.T) {
	a, as := fixtures(t)
	b, bs := fixtures(t)
	for i := range as {
		am, bm := manifestFor(t, a, as[i]), manifestFor(t, b, bs[i])
		for j := range am.Bundles {
			if am.Bundles[j].Checksum != bm.Bundles[j].Checksum {
				t.Fatal("bundle bytes changed across runs")
			}
		}
		if as[i].SetID == bs[i].SetID {
			t.Fatal("version ID reused")
		}
	}
	if err := generate(context.Background(), a, []int64{1024}); err == nil {
		t.Fatal("existing fixtures overwritten")
	}
}

func TestMeasurementRejectsCorruptedBundle(t *testing.T) {
	dir, suite := fixtures(t)
	m := manifestFor(t, dir, suite[0])
	if err := os.WriteFile(filepath.Join(dir, "objects", filepath.FromSlash(m.Bundles[0].ObjectKey)), []byte("corrupt"), 0600); err != nil {
		t.Fatal(err)
	}
	root, err := os.OpenRoot(filepath.Join(dir, "objects"))
	if err != nil {
		t.Fatal(err)
	}
	defer root.Close()
	result, err := measure(context.Background(), suite, t.TempDir(), localSource{root}, 1)
	if err == nil || !strings.Contains(err.Error(), "checksum mismatch") || result != nil {
		t.Fatalf("invalid measurement reported as success: %v", err)
	}
}

func TestSummary(t *testing.T) {
	if got := summarize([]float64{9, 1, 3, 5, 2}); !reflect.DeepEqual(got, summary{Min: 1, Median: 3, Max: 9}) {
		t.Fatal(got)
	}
	if got := summarize([]float64{8, 2}); got.Median != 5 {
		t.Fatal(got)
	}
}
