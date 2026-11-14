package loader

import (
	"context"
	"fmt"
	"io"
	"os"
	"strconv"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

type S3reader struct {
	client *s3.Client
	bucket string
}

func NewS3DataSource(bucket string) (*S3reader, error) {
	endpoint := os.Getenv("MINIO_ENDPOINT_URL")
	if endpoint != "" {
		// When running with MinIO, static env credentials are used.
		// Clearing profile variables prevents AWS SDK from failing on missing shared profiles (e.g. root env).
		_ = os.Unsetenv("AWS_PROFILE")
		_ = os.Unsetenv("AWS_DEFAULT_PROFILE")
	}

	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("ap-northeast-2"))
	if err != nil {
		return nil, fmt.Errorf("failed to load AWS config: %w", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		// endpoint is only needed when using MinIO
		// For AWS S3, this environment variable should be empty
		if endpoint != "" {
			o.UsePathStyle = true
			o.BaseEndpoint = &endpoint
		}
	})

	// Check if bucket exists
	_, err = client.HeadBucket(context.TODO(), &s3.HeadBucketInput{
		Bucket: aws.String(bucket),
	})
	if err != nil {
		return nil, fmt.Errorf("cannot access S3 bucket <%s>: %w", bucket, err)
	}
	return &S3reader{client: client, bucket: bucket}, nil
}

func (s *S3reader) Get(problemId string) ([]ElementOut, error) {
	output, err := s.client.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
		Bucket: aws.String(s.bucket),
		Prefix: aws.String(problemId + "/"),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list objects: %w", err)
	}

	// Assume that the directory structure of the S3 bucket is as follows:
	// <problemId>/
	//   ├── <testcaseId>.in
	//   ├── <testcaseId>.out
	//   └── ...
	//
	// Since ElementOut contains input and output both, we need to read both at the same time
	// and return them as a single element. For this, we will parse file names and get the list
	// of testcaseIds.
	var testcaseIds []string
	for _, obj := range output.Contents {
		if obj.Key != nil {
			// filename: <problemId>/<testcaseId>.in
			fileName := *obj.Key
			if len(fileName) > 3 && fileName[len(fileName)-3:] == ".in" {
				id := fileName[len(problemId)+1 : len(fileName)-3]
				testcaseIds = append(testcaseIds, id)
			}
		}
	}

	if len(testcaseIds) == 0 {
		return nil, fmt.Errorf("no testcases found for problemId: %s", problemId)
	}

	resultChan := make(chan ElementOut, len(testcaseIds))
	errChan := make(chan error, len(testcaseIds))

	// Process each testcase in a goroutine
	for _, id := range testcaseIds {
		go func(id string) {
			inKey := problemId + "/" + id + ".in"
			outKey := problemId + "/" + id + ".out"

			outputInFile, err := s.client.GetObject(context.TODO(), &s3.GetObjectInput{
				Bucket: aws.String(s.bucket),
				Key:    aws.String(inKey),
			})
			if err != nil {
				errChan <- err
				return
			}
			defer outputInFile.Body.Close()

			outputOutFile, err := s.client.GetObject(context.TODO(), &s3.GetObjectInput{
				Bucket: aws.String(s.bucket),
				Key:    aws.String(outKey),
			})
			if err != nil {
				errChan <- err
				return
			}
			defer outputOutFile.Body.Close()

			bodyIn, err := io.ReadAll(outputInFile.Body)
			if err != nil {
				errChan <- err
				return
			}

			bodyOut, err := io.ReadAll(outputOutFile.Body)
			if err != nil {
				errChan <- err
				return
			}

			idInt, err := strconv.Atoi(id)
			if err != nil {
				errChan <- fmt.Errorf("failed to convert id to int: %w", err)
				return
			}

			outputInTags, err := s.client.GetObjectTagging(context.TODO(), &s3.GetObjectTaggingInput{
				Bucket: aws.String(s.bucket),
				Key:    aws.String(inKey),
			})
			if err != nil {
				errChan <- fmt.Errorf("failed to get tags for %s: %w", inKey, err)
				return
			}

			isHidden := false
			for _, tag := range outputInTags.TagSet {
				if *tag.Key == "hidden" && *tag.Value == "true" {
					isHidden = true
					break
				}
			}

			resultChan <- ElementOut{
				Id:     idInt,
				In:     string(bodyIn),
				Out:    string(bodyOut),
				Hidden: isHidden,
			}
		}(id)
	}

	var results []ElementOut
	var errs []error

	for range testcaseIds {
		select {
		case elem := <-resultChan:
			results = append(results, elem)
		case err := <-errChan:
			errs = append(errs, err)
		}
	}

	if len(errs) > 0 {
		return nil, fmt.Errorf("errors occurred while processing testcases: %v", errs)
	}

	return results, nil
}

// Put uploads a single testcase's .in/.out pair under <problemId>/<id>.in and
// <problemId>/<id>.out, tagging both objects with hidden=<true|false>. Get reads
// this same tag to determine ElementOut.Hidden, so the tag must always be set —
// the admin backend's testcase.service.ts::createTestcases follows the same convention.
func (s *S3reader) Put(ctx context.Context, problemId int, id int, element ElementIn) error {
	tagging := "hidden=false"
	if element.Hidden {
		tagging = "hidden=true"
	}

	type upload struct {
		key  string
		body string
	}
	uploads := []upload{
		{key: fmt.Sprintf("%d/%d.in", problemId, id), body: element.In},
		{key: fmt.Sprintf("%d/%d.out", problemId, id), body: element.Out},
	}

	// Same goroutine + buffered channel pattern as Get above.
	errChan := make(chan error, len(uploads))
	for _, u := range uploads {
		go func(u upload) {
			_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
				Bucket:  aws.String(s.bucket),
				Key:     aws.String(u.key),
				Body:    strings.NewReader(u.body),
				Tagging: aws.String(tagging),
			})
			errChan <- err
		}(u)
	}

	var errs []error
	for range uploads {
		if err := <-errChan; err != nil {
			errs = append(errs, err)
		}
	}
	if len(errs) > 0 {
		return fmt.Errorf("failed to upload testcase %d/%d: %v", problemId, id, errs)
	}
	return nil
}

// deleteObjectsBatchSize is the maximum number of keys S3 DeleteObjects accepts per request.
const deleteObjectsBatchSize = 1000

// Delete removes the <problemId>/<id>.in and <problemId>/<id>.out objects written by Put.
// Keys that do not exist are not an error, so it is safe to call for partially uploaded ids.
func (s *S3reader) Delete(ctx context.Context, problemId int, ids []int) error {
	objects := make([]types.ObjectIdentifier, 0, len(ids)*2)
	for _, id := range ids {
		for _, ext := range []string{"in", "out"} {
			objects = append(objects, types.ObjectIdentifier{
				Key: aws.String(fmt.Sprintf("%d/%d.%s", problemId, id, ext)),
			})
		}
	}

	var errs []error
	for start := 0; start < len(objects); start += deleteObjectsBatchSize {
		end := min(start+deleteObjectsBatchSize, len(objects))
		output, err := s.client.DeleteObjects(ctx, &s3.DeleteObjectsInput{
			Bucket: aws.String(s.bucket),
			Delete: &types.Delete{
				Objects: objects[start:end],
				Quiet:   aws.Bool(true),
			},
		})
		if err != nil {
			errs = append(errs, err)
			continue
		}
		for _, e := range output.Errors {
			errs = append(errs, fmt.Errorf("%s: %s", aws.ToString(e.Key), aws.ToString(e.Message)))
		}
	}
	if len(errs) > 0 {
		return fmt.Errorf("failed to delete testcases of problem %d: %v", problemId, errs)
	}
	return nil
}
