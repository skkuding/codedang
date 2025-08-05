package loader

import (
	"bytes"
	"context"
	"fmt"

	//"io"
	"os"
	//"strconv"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type S3reader struct {
	client *s3.Client
	bucket string
}

func NewS3DataSource(bucket string) (*S3reader, error) {
	var client *s3.Client
	endpoint := os.Getenv("STORAGE_BUCKET_ENDPOINT_URL")
	if endpoint == "" {
		// Connect to AWS S3
		// Use `LoadDefaultConfig` in case of loading credentials from environment variables
		cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion("ap-northeast-2"))
		if err != nil {
			return nil, fmt.Errorf("failed to load AWS config: %w", err)
		}
		client = s3.NewFromConfig(cfg)
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
		return nil, fmt.Errorf("cannot access S3 bucket <%s>: %w", bucket, err)
	}
	return &S3reader{client: client, bucket: bucket}, nil
}

func (s *S3reader) Save(data []byte, fileName string) error {
  input := &s3.PutObjectInput{
    Bucket: &s.bucket,
    Key: &fileName,
    Body: bytes.NewReader(data),
  }

  _, err := s.client.PutObject(context.TODO(), input)

  if err != nil {
    return fmt.Errorf("cannot write in S3 bucket: %w", err)
  }

  return nil
}
