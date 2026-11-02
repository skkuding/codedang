// Command tc-cache-bench is a local TAS-3060 measurement tool, not an Iris service.
// From apps/iris:
//
//	go run ./example/tools/tc-cache-bench generate -out /tmp/tc-bench-fixtures
//	go run ./example/tools/tc-cache-bench measure -suite /tmp/tc-bench-fixtures/suite.json
//	  -object-root /tmp/tc-bench-fixtures/objects -cache-root /tmp/tc-bench-cache
//
// For MinIO/PV measurements omit -object-root, supply -bucket, and configure the
// same MINIO_ENDPOINT_URL/AWS credentials as Iris. Mount the PV at -cache-root.
// Only objects/ is uploaded separately. This tool never uploads or sends requests.
// Synthetic bytes measure loading only; they are not executable judging fixtures.
package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"

	"github.com/skkuding/codedang/apps/iris/src/loader"
)

type dataset struct {
	Name        string `json:"name"`
	SetID       string `json:"testcaseSetId"`
	ManifestKey string `json:"manifestKey"`
	RawBytes    int64  `json:"rawBytes"`
	BundleBytes int64  `json:"bundleBytes"`
}

func main() {
	ctx, cancel := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer cancel()
	if err := run(ctx, os.Args[1:]); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func run(ctx context.Context, args []string) error {
	if len(args) == 0 {
		return fmt.Errorf("usage: tc-cache-bench generate|measure [flags]")
	}
	flags := flag.NewFlagSet(args[0], flag.ContinueOnError)
	switch args[0] {
	case "generate":
		out := flags.String("out", "", "required new fixture directory; parent must exist")
		if err := flags.Parse(args[1:]); err != nil {
			return err
		}
		if *out == "" {
			return fmt.Errorf("-out is required")
		}
		if err := generate(ctx, *out, []int64{1 << 20, 10 << 20, 50 << 20}); err != nil {
			return err
		}
		fmt.Fprintln(os.Stderr, "Fixtures created:", *out)
		return nil
	case "measure":
		suitePath := flags.String("suite", "", "required suite.json path")
		cache := flags.String("cache-root", "", "required existing directory on target filesystem/PV")
		objectRoot := flags.String("object-root", "", "local object directory for smoke testing instead of S3")
		bucket := flags.String("bucket", "", "S3/MinIO bucket; required without -object-root")
		repeats := flags.Int("repeats", 5, "cold/warm pairs per dataset")
		if err := flags.Parse(args[1:]); err != nil {
			return err
		}
		if *suitePath == "" || *cache == "" || *repeats < 1 {
			return fmt.Errorf("suite, cache-root and positive repeats are required")
		}
		if (*objectRoot == "") == (*bucket == "") {
			return fmt.Errorf("specify exactly one of -object-root or -bucket")
		}
		data, err := os.ReadFile(*suitePath)
		if err != nil {
			return err
		}
		var suite []dataset
		if err := json.Unmarshal(data, &suite); err != nil {
			return err
		}
		var source loader.BundleSource
		mode := "s3"
		if *objectRoot != "" {
			root, err := os.OpenRoot(*objectRoot)
			if err != nil {
				return err
			}
			defer root.Close()
			source, mode = localSource{root}, "local-files"
		} else {
			source, err = loader.NewS3DataSource(*bucket)
			if err != nil {
				return err
			}
		}
		report, err := measure(ctx, suite, *cache, source, *repeats)
		if err != nil {
			return err
		}
		report.Source = mode
		encoder := json.NewEncoder(os.Stdout)
		encoder.SetIndent("", "  ")
		return encoder.Encode(report)
	default:
		return fmt.Errorf("unknown command %q", args[0])
	}
}
