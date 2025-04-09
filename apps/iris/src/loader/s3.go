package loader

import (
	"context"
	"fmt"
	"io"
	"os"
	"strconv"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3reader struct {
	client *s3.Client
	bucket string
}

func NewS3DataSource(bucket string) *S3reader {
	var client *s3.Client
	endpoint := os.Getenv("STORAGE_BUCKET_ENDPOINT_URL")
	if endpoint == "" {
		// Connect to AWS S3
		client = s3.New(s3.Options{Region: "ap-northeast-2"})
	} else {
		// Connect to MinIO (non-production)
		accessKey := os.Getenv("TESTCASE_ACCESS_KEY")
		secretKey := os.Getenv("TESTCASE_SECRET_KEY")
		cred := credentials.NewStaticCredentialsProvider(accessKey, secretKey, "")
		client = s3.New(s3.Options{
			Region:       "ap-northeast-2",
			BaseEndpoint: &endpoint,
			UsePathStyle: true,
			Credentials:  cred,
		})
	}
	// Check if bucket exists
	_, err := client.HeadBucket(context.TODO(), &s3.HeadBucketInput{
		Bucket: aws.String(bucket),
	})
	if err != nil {
		panic(fmt.Sprintf("Cannot access S3 bucket <%s>: %s", bucket, err.Error()))
	}
	return &S3reader{client: client, bucket: bucket}
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

	result := make([]Element, len(testcaseIds))
	for index, id := range testcaseIds {
		inKey := problemId + "/" + id + ".in"
		outKey := problemId + "/" + id + ".out"

		outputInFile, err := s.client.GetObject(context.TODO(), &s3.GetObjectInput{
			Bucket: aws.String(s.bucket),
			Key:    aws.String(inKey),
		})
		if err != nil {
			return nil, err
		}
		defer outputInFile.Body.Close()

		outputOutFile, err := s.client.GetObject(context.TODO(), &s3.GetObjectInput{
			Bucket: aws.String(s.bucket),
			Key:    aws.String(outKey),
		})
		if err != nil {
			return nil, err
		}
		defer outputOutFile.Body.Close()

		bodyIn, err := io.ReadAll(outputInFile.Body)
		if err != nil {
			return nil, err
		}

		bodyOut, err := io.ReadAll(outputOutFile.Body)
		if err != nil {
			return nil, err
		}

		idInt, err := strconv.Atoi(id)
		if err != nil {
			return nil, fmt.Errorf("failed to convert id to int: %w", err)
		}

		outputInTags, err := s.client.GetObjectTagging(context.TODO(), &s3.GetObjectTaggingInput{
			Bucket: aws.String(s.bucket),
			Key:    aws.String(inKey),
		})
		if err != nil {
			return nil, fmt.Errorf("failed to get tags for %s: %w", inKey, err)
		}

		// Assume that `hidden` tag is used to mark the testcase as hidden,
		// instead of reading from database.
		isHidden := false
		for _, tag := range outputInTags.TagSet {
			if *tag.Key == "hidden" && *tag.Value == "true" {
				isHidden = true
				break
			}
		}

		result[index] = Element{
			Id:     idInt,
			In:     string(bodyIn),
			Out:    string(bodyOut),
			Hidden: isHidden,
		}
	}

	return result, nil
}
