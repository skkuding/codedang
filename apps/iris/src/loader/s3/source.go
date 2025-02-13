package s3

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/skkuding/codedang/apps/iris/src/loader"
)

type s3DataSource struct {
	client *s3.Client
	bucket string
}

func NewS3DataSource(bucket string) *s3DataSource {
	var client *s3.Client
	// endpoint := os.Getenv("TESTCASE_ENDPOINT_URL")
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
	// check if bucket exists
	_, err := client.HeadBucket(context.TODO(), &s3.HeadBucketInput{
		Bucket: aws.String(bucket),
	})
	if err != nil {
		panic(fmt.Sprintf("Cannot access S3 bucket <%s>: %s", bucket, err.Error()))
	}
	return &s3DataSource{client: client, bucket: bucket}
}

func (s *s3DataSource) Get(problemId string) ([]loader.Element, error) {
	listOutput, err := s.client.ListObjectsV2(context.TODO(), &s3.ListObjectsV2Input{
		Bucket: aws.String(s.bucket),
		Prefix: aws.String(problemId),
	})
	if err != nil {
		return nil, fmt.Errorf("failed to list objects for problemId %s: %w", problemId, err)
	}

	var result []loader.Element

	for _, item := range listOutput.Contents {
		res, err := s.client.GetObject(context.TODO(), &s3.GetObjectInput{
			Bucket: aws.String(s.bucket),
			Key:    item.Key,
		})
		if err != nil {
			return nil, fmt.Errorf("failed to get object %s: %w", *item.Key, err)
		}
		defer res.Body.Close()

		body, err := io.ReadAll(res.Body)
		if err != nil {
			return nil, fmt.Errorf("failed to read object %s: %w", *item.Key, err)
		}

		var element loader.Element
		if err := json.Unmarshal(body, &element); err != nil {
			return nil, fmt.Errorf("failed to unmarshal JSON from %s: %w", *item.Key, err)
		}

		result = append(result, element)
	}

	if len(result) == 0 {
		return nil, fmt.Errorf("no testcases found for problemId: %s, %d", problemId, len(listOutput.Contents))
	}

	return result, nil
}
