package s3

import (
	"context"
	"fmt"
	"io"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type s3DataSource struct {
	client *s3.Client
	bucket string
}

func NewS3DataSource(bucket string) *s3DataSource {
	var client *s3.Client
	endpoint := os.Getenv("TESTCASE_ENDPOINT_URL")
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

func (s *s3DataSource) Get(id string) ([]byte, error) {
	key := id + ".json"
	res, err := s.client.GetObject(context.TODO(), &s3.GetObjectInput{
		Bucket: aws.String(s.bucket),
		Key:    aws.String(key),
	})
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()
	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}
	return body, nil
}
