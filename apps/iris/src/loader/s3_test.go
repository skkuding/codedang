package loader

import (
	"archive/tar"
	"bytes"
	"context"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"testing"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type bundleTransport func(*http.Request) (*http.Response, error)

func (f bundleTransport) RoundTrip(req *http.Request) (*http.Response, error) { return f(req) }

func TestS3BundleDownload(t *testing.T) {
	data := makeBundle(t, []bundleEntry{
		{"1001.in", "1 2\n", tar.TypeReg},
		{"1001.out", "3\n", tar.TypeReg},
	})
	manifest := manifestForBundle(data)
	for _, status := range []int{http.StatusOK, http.StatusNotFound} {
		t.Run(http.StatusText(status), func(t *testing.T) {
			calls := 0
			// Use the real S3 SDK with an in-memory transport: no AWS credentials,
			// network, local Kubernetes cluster or running object store is required.
			client := s3.New(s3.Options{
				Region: "ap-northeast-2", Credentials: aws.AnonymousCredentials{},
				BaseEndpoint: aws.String("https://s3.example.test"), UsePathStyle: true,
				HTTPClient: &http.Client{Transport: bundleTransport(func(req *http.Request) (*http.Response, error) {
					calls++
					if req.Method != http.MethodGet || req.URL.Path != "/testcase/"+manifest.Bundles[0].ObjectKey || req.URL.Query().Has("list-type") {
						t.Fatalf("unexpected S3 request: %s %s", req.Method, req.URL)
					}
					body := data
					if status != http.StatusOK {
						body = []byte(`<Error><Code>NoSuchKey</Code></Error>`)
					}
					return &http.Response{StatusCode: status, Header: make(http.Header), Body: io.NopCloser(bytes.NewReader(body)), ContentLength: int64(len(body)), Request: req}, nil
				})},
			})
			source := &S3reader{client: client, bucket: "testcase"}
			root := t.TempDir()
			dir, err := InstallBundle(context.Background(), root, source, manifest, "public")
			if (err == nil) != (status == http.StatusOK) || calls != 1 {
				t.Fatalf("installation err=%v, S3 requests=%d", err, calls)
			}
			if status == http.StatusOK {
				got, err := os.ReadFile(filepath.Join(dir, "1001.out"))
				if err != nil || string(got) != "3\n" {
					t.Fatalf("downloaded output=%q err=%v", got, err)
				}
			}
			assertNoBundleStaging(t, root)
		})
	}
}
