package cache

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/redis/go-redis/v9"
)

type cache struct {
	ctx    context.Context
	client redis.Client
}

func NewCache(ctx context.Context) *cache {
	host := os.Getenv("REDIS_HOST")
	port := os.Getenv("REDIS_PORT")
	rdb := redis.NewClient(&redis.Options{
		Addr:     host + ":" + port,
		Password: "",
		DB:       0,
	})
	return &cache{ctx, *rdb}
}

func (c *cache) Get(key string) ([]byte, error) {
	val, err := c.client.Get(c.ctx, key).Bytes()
	if err != nil {
		return nil, fmt.Errorf("failed to get key: %w", err)
	} else if err == redis.Nil {
		return nil, fmt.Errorf("key does not exist")
	}
	return val, nil
}

func (c *cache) Set(key string, value interface{}) error {
	err := c.client.Set(c.ctx, key, value, time.Hour*24).Err()
	if err != nil {
		return fmt.Errorf("failed to set key: %w", err)
	}
	return nil
}

func (c *cache) Evict(key string) error {
	_, err := c.client.Del(c.ctx, key).Result()
	if err != nil {
		return fmt.Errorf("failed to evict key: %w", err)
	}
	return nil
}

func (c *cache) IsExist(key string) (bool, error) {
	val, err := c.client.Exists(c.ctx, key).Result()
	if val > 0 {
		return true, nil
	}
	if err != nil {
		return false, fmt.Errorf("failed to check existance: %w", err)
	}
	return false, nil
}
