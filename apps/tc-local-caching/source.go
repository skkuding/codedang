package main

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/aws/smithy-go"
)

type objectSource struct {
	client *s3.Client
	bucket string
}

func newObjectSource() (objectSource, error) {
	endpoint, bucket := os.Getenv("SILO_ENDPOINT"), os.Getenv("SILO_BUCKET")
	user, password := os.Getenv("SILO_ACCESS_KEY"), os.Getenv("SILO_SECRET_KEY")
	if endpoint == "" || bucket == "" || user == "" || password == "" {
		return objectSource{}, errors.New("SILO_ENDPOINT, SILO_BUCKET, SILO_ACCESS_KEY and SILO_SECRET_KEY are required")
	}
	client := s3.NewFromConfig(aws.Config{
		Region:           "us-east-1",
		RetryMaxAttempts: 1,
		Credentials: aws.CredentialsProviderFunc(func(context.Context) (aws.Credentials, error) {
			return aws.Credentials{AccessKeyID: user, SecretAccessKey: password}, nil
		}),
	}, func(options *s3.Options) {
		options.BaseEndpoint = aws.String(endpoint)
		options.UsePathStyle = true
	})
	return objectSource{client, bucket}, nil
}

func (s objectSource) open(ctx context.Context, p pin) (io.ReadCloser, error) {
	res, err := s.client.GetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(s.bucket), Key: aws.String(p.objectKey()),
	})
	if err != nil {
		return nil, err
	}
	return res.Body, nil
}

func (s objectSource) seed(ctx context.Context, pinsPath string) error {
	for {
		_, err := s.client.CreateBucket(ctx, &s3.CreateBucketInput{Bucket: aws.String(s.bucket)})
		var exists *types.BucketAlreadyOwnedByYou
		if err == nil || errors.As(err, &exists) {
			break
		}
		select {
		case <-ctx.Done():
			return fmt.Errorf("prepare Silo bucket: %w", err)
		case <-time.After(400 * time.Millisecond):
		}
	}
	versions, err := fixtures.ReadDir("fixtures")
	if err != nil {
		return err
	}
	pins := make(map[string]pin)
	for _, version := range versions {
		dir := "fixtures/" + version.Name()
		entries, err := fixtures.ReadDir(dir)
		if err != nil {
			return err
		}
		bodies := make(map[string][]byte, len(entries))
		for _, entry := range entries {
			bodies[entry.Name()], err = fixtures.ReadFile(dir + "/" + entry.Name())
			if err != nil {
				return err
			}
		}
		data, p, err := buildBundle(version.Name(), bodies)
		if err != nil {
			return err
		}
		if err := s.publish(ctx, p, data); err != nil {
			return err
		}
		pins[p.Version] = p
		fmt.Printf("seeded %s SHA-256 %s\n", p.objectKey(), p.SHA256)
	}
	tmp, err := os.CreateTemp(filepath.Dir(pinsPath), ".pins-*")
	if err != nil {
		return err
	}
	defer os.Remove(tmp.Name())
	if err := tmp.Close(); err != nil {
		return err
	}
	if err := writeJSON(tmp.Name(), pins); err != nil {
		return err
	}
	return os.Rename(tmp.Name(), pinsPath)
}

func (s objectSource) publish(ctx context.Context, p pin, data []byte) error {
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(s.bucket), Key: aws.String(p.objectKey()),
		Body: bytes.NewReader(data), IfNoneMatch: aws.String("*"),
		ContentType: aws.String("application/gzip"),
	})
	if err == nil {
		return nil
	}
	var apiErr smithy.APIError
	if !errors.As(err, &apiErr) || apiErr.ErrorCode() != "PreconditionFailed" {
		return fmt.Errorf("publish %s: %w", p.objectKey(), err)
	}
	body, err := s.open(ctx, p)
	if err != nil {
		return err
	}
	defer body.Close()
	if err := verifyFile(body, describe(data)); err != nil {
		return fmt.Errorf("version %s already exists with different bytes: %w", p.Version, err)
	}
	return nil
}
