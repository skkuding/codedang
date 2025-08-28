package loader

import (
	"context"
	"fmt"
	"io"
	"os"
	"strconv"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3reader struct {
	client *s3.Client
	bucket string
}

func NewS3DataSource(bucket string) (*S3reader, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("ap-northeast-2"))
	if err != nil {
		return nil, fmt.Errorf("failed to load AWS config: %w", err)
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		// endpoint is only needed when using MinIO
		// For AWS S3, this environment variable should be empty
		endpoint := os.Getenv("MINIO_ENDPOINT_URL")
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

func (s *S3reader) Get(problemId string) ([]Element, error) {
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
	// Since `Element` contains input and output both, we need to read both at the same time
	// and return them as a single Element. For this, we will parse file names and get the list
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

	resultChan := make(chan Element, len(testcaseIds))
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

			resultChan <- Element{
				Id:     idInt,
				In:     string(bodyIn),
				Out:    string(bodyOut),
				Hidden: isHidden,
			}
		}(id)
	}

	var results []Element
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
