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

func (s *S3reader) Save(data []byte, fileName string) error {
  input := &s3.PutObjectInput{
    Bucket: &s.bucket,
    Key: &fileName,
    Body: bytes.NewReader(data),
  }

  _, err := s.client.PutObject(context.TODO(), input)

  if err != nil {
    return fmt.Errorf("cannot write in bucket: %w", err)
  }

  return nil
}
