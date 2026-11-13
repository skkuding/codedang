//go:build linux

package main

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"

	"golang.org/x/sys/unix"
)

var (
	errInvalid  = errors.New("invalid request")
	errCapacity = errors.New("cache or FD capacity exhausted")
)

type bundleSource interface {
	open(context.Context, pin) (io.ReadCloser, error)
}

type cacheEntry struct {
	pin      pin
	manifest manifest
	lastUsed time.Time
	loading  chan struct{}
	err      error
}

type cache struct {
	root      string
	source    bundleSource
	high, low int64
	loadSlot  chan struct{}
	ctx       context.Context
	mu        sync.Mutex
	loads     sync.WaitGroup
	entries   map[string]*cacheEntry
	downloads map[string]int
	pending   int
}

func newCache(ctx context.Context, root string, source bundleSource, high, low int64) (*cache, error) {
	if low <= 0 || high <= low {
		return nil, errors.New("watermarks must satisfy 0 < low < high")
	}
	c := &cache{
		root: root, source: source, high: high, low: low, ctx: ctx,
		loadSlot: make(chan struct{}, 1), entries: make(map[string]*cacheEntry),
		downloads: make(map[string]int),
	}
	dirs, err := os.ReadDir(root)
	if err != nil {
		return nil, err
	}
	for _, dir := range dirs {
		path := filepath.Join(root, dir.Name())
		if strings.HasPrefix(dir.Name(), ".stage-") || strings.HasPrefix(dir.Name(), ".evict-") {
			if err := os.RemoveAll(path); err != nil {
				return nil, err
			}
			continue
		}
		if !dir.IsDir() || !identifier.MatchString(dir.Name()) {
			continue
		}
		entry, err := readEntry(path, dir.Name())
		if err != nil {
			log.Printf("discarding cache entry %s: %v", dir.Name(), err)
			if err := os.RemoveAll(path); err != nil {
				return nil, err
			}
			continue
		}
		c.entries[dir.Name()] = entry
	}
	return c, nil
}

func readEntry(path, version string) (*cacheEntry, error) {
	raw, err := os.Open(filepath.Join(path, "receipt.json"))
	if err != nil {
		return nil, err
	}
	data, readErr := io.ReadAll(io.LimitReader(raw, maxManifest+1))
	if err := errors.Join(readErr, raw.Close()); err != nil {
		return nil, err
	}
	var saved receipt
	if len(data) > maxManifest || json.Unmarshal(data, &saved) != nil || !saved.Pin.valid() || saved.Pin.Version != version {
		return nil, errors.New("invalid receipt")
	}
	if err := saved.Manifest.validate(version); err != nil {
		return nil, err
	}
	for _, expected := range saved.Manifest.files() {
		file, err := openReadonly(filepath.Join(path, expected.name))
		if err != nil {
			return nil, err
		}
		if err := errors.Join(verifyFile(file, expected.blob), file.Close()); err != nil {
			return nil, err
		}
	}
	info, err := os.Stat(path)
	if err != nil {
		return nil, err
	}
	return &cacheEntry{pin: saved.Pin, manifest: saved.Manifest, lastUsed: info.ModTime()}, nil
}

func openReadonly(path string) (*os.File, error) {
	fd, err := unix.Open(path, unix.O_RDONLY|unix.O_CLOEXEC|unix.O_NOFOLLOW|unix.O_NONBLOCK, 0)
	if err != nil {
		return nil, err
	}
	file := os.NewFile(uintptr(fd), path)
	info, err := file.Stat()
	if err != nil || !info.Mode().IsRegular() {
		file.Close()
		return nil, errors.Join(err, errors.New("cache path is not a regular file"))
	}
	return file, nil
}

type acquired struct {
	ids   []string
	files []*os.File
}

func (a acquired) close() {
	for _, file := range a.files {
		file.Close()
	}
}

func (c *cache) acquire(ctx context.Context, p pin, ids []string) (acquired, error) {
	if !p.valid() || len(ids) > maxCases {
		return acquired{}, fmt.Errorf("%w: invalid version, SHA-256, or testcase count", errInvalid)
	}
	seen := make(map[string]bool, len(ids))
	for _, id := range ids {
		if !identifier.MatchString(id) || seen[id] {
			return acquired{}, fmt.Errorf("%w: invalid or duplicate testcase ID %q", errInvalid, id)
		}
		seen[id] = true
	}
	for {
		if err := ctx.Err(); err != nil {
			return acquired{}, err
		}
		c.mu.Lock()
		entry := c.entries[p.Version]
		if entry == nil {
			if c.pending >= maxConnections {
				c.mu.Unlock()
				return acquired{}, fmt.Errorf("%w: too many pending version loads", errCapacity)
			}
			c.pending++
			entry = &cacheEntry{pin: p, loading: make(chan struct{})}
			c.entries[p.Version] = entry
			c.loads.Add(1)
			go c.load(entry)
		}
		if entry.loading != nil {
			// Concurrent requests for the version share the outcome of this load.
			done := entry.loading
			c.mu.Unlock()
			select {
			case <-ctx.Done():
				return acquired{}, ctx.Err()
			case <-done:
				if entry.err != nil {
					return acquired{}, entry.err
				}
			}
			continue
		}
		if entry.pin != p {
			c.mu.Unlock()
			return acquired{}, fmt.Errorf("%w: checksum conflicts with cached version %s", errInvalid, p.Version)
		}
		result, err := c.openSet(entry, ids)
		if err == nil {
			entry.lastUsed = time.Now()
		}
		if errors.Is(err, os.ErrNotExist) {
			evictErr := c.evictLocked(entry)
			c.mu.Unlock()
			if evictErr != nil {
				return acquired{}, evictErr
			}
			continue
		}
		c.mu.Unlock()
		return result, err
	}
}

// The caller holds c.mu from the first open until the complete set is pinned.
func (c *cache) openSet(entry *cacheEntry, ids []string) (acquired, error) {
	known := make(map[string]bool, len(entry.manifest.Cases))
	for _, tc := range entry.manifest.Cases {
		known[tc.ID] = true
	}
	if len(ids) == 0 {
		for _, tc := range entry.manifest.Cases {
			ids = append(ids, tc.ID)
		}
	}
	for _, id := range ids {
		if !known[id] {
			return acquired{}, fmt.Errorf("%w: unknown testcase ID %q", errInvalid, id)
		}
	}
	result := acquired{ids: ids, files: make([]*os.File, 0, 2*len(ids))}
	for _, id := range ids {
		for _, suffix := range []string{".in", ".out"} {
			file, err := openReadonly(filepath.Join(c.root, entry.pin.Version, id+suffix))
			if err != nil {
				result.close()
				if errors.Is(err, unix.EMFILE) || errors.Is(err, unix.ENFILE) {
					return acquired{}, errors.Join(errCapacity, err)
				}
				return acquired{}, err
			}
			result.files = append(result.files, file)
		}
	}
	return result, nil
}

func (c *cache) load(entry *cacheEntry) {
	defer c.loads.Done()
	ctx, cancel := context.WithTimeout(c.ctx, 30*time.Second)
	defer cancel()
	var m manifest
	var err error
	select {
	case c.loadSlot <- struct{}{}:
		defer func() { <-c.loadSlot }()
		m, err = c.install(ctx, entry.pin)
	case <-ctx.Done():
		err = ctx.Err()
	}

	c.mu.Lock()
	defer c.mu.Unlock()
	c.pending--
	entry.err = err
	if err != nil {
		delete(c.entries, entry.pin.Version)
		log.Printf("load %s: %v", entry.pin.Version, err)
	} else {
		entry.manifest = m
		entry.lastUsed = time.Now()
	}
	close(entry.loading)
	entry.loading = nil
}

func (c *cache) install(ctx context.Context, p pin) (manifest, error) {
	c.mu.Lock()
	c.downloads[p.Version]++
	c.mu.Unlock()
	log.Printf("download %s", p.objectKey())

	body, err := c.source.open(ctx, p)
	if err != nil {
		return manifest{}, fmt.Errorf("fetch exact version %s: %w", p.Version, err)
	}
	defer body.Close()
	archive, err := os.CreateTemp("", "tc-bundle-*")
	if err != nil {
		return manifest{}, err
	}
	// Unlink the spool immediately. Only this manager's open file can retain it.
	defer archive.Close()
	if err := os.Remove(archive.Name()); err != nil {
		return manifest{}, err
	}
	hash := sha256.New()
	n, err := io.Copy(io.MultiWriter(archive, hash), io.LimitReader(body, maxBundle+1))
	if err != nil {
		return manifest{}, err
	}
	if n > maxBundle || fmt.Sprintf("%x", hash.Sum(nil)) != p.SHA256 {
		return manifest{}, fmt.Errorf("bundle size or SHA-256 mismatch for %s", p.Version)
	}
	if _, err := archive.Seek(0, io.SeekStart); err != nil {
		return manifest{}, err
	}
	stage, err := os.MkdirTemp(c.root, ".stage-")
	if err != nil {
		return manifest{}, err
	}
	defer os.RemoveAll(stage)
	m, err := unpackBundle(archive, p, stage, c.reserve)
	if err != nil {
		return manifest{}, err
	}
	if err := writeJSON(filepath.Join(stage, "receipt.json"), receipt{p, m}); err != nil {
		return manifest{}, err
	}
	return m, os.Rename(stage, filepath.Join(c.root, p.Version))
}

type fsUsage struct {
	UsedBytes      int64 `json:"usedBytes"`
	AvailableBytes int64 `json:"availableBytes"`
	block          int64
}

func usage(path string) (fsUsage, error) {
	var s unix.Statfs_t
	if err := unix.Statfs(path, &s); err != nil {
		return fsUsage{}, err
	}
	block := int64(s.Frsize)
	if block <= 0 {
		block = int64(s.Bsize)
	}
	return fsUsage{int64(s.Blocks-s.Bfree) * block, int64(s.Bavail) * block, block}, nil
}

func (c *cache) reserve(m manifest) error {
	c.mu.Lock()
	defer c.mu.Unlock()
	current, err := usage(c.root)
	if err != nil {
		return err
	}
	round := func(size int64) int64 { return ((size + current.block - 1) / current.block) * current.block }
	metadata, err := json.Marshal(receipt{pin{m.Version, strings.Repeat("0", 64)}, m})
	if err != nil {
		return err
	}
	needed := round(int64(len(metadata))+1) + 4*current.block
	for _, file := range m.files() {
		needed += round(file.Size)
	}
	if needed > c.high {
		return fmt.Errorf("%w: artifact needs %d bytes above the %d-byte high watermark", errCapacity, needed, c.high)
	}
	if current.UsedBytes+needed <= c.high && needed <= current.AvailableBytes {
		return nil
	}
	candidates := make([]*cacheEntry, 0, len(c.entries))
	for _, entry := range c.entries {
		if entry.loading == nil {
			candidates = append(candidates, entry)
		}
	}
	sort.Slice(candidates, func(i, j int) bool { return candidates[i].lastUsed.Before(candidates[j].lastUsed) })
	for _, entry := range candidates {
		if current.UsedBytes <= c.low && current.UsedBytes+needed <= c.high && current.AvailableBytes >= needed {
			break
		}
		if err := c.evictLocked(entry); err != nil {
			return err
		}
		current, err = usage(c.root)
		if err != nil {
			return err
		}
	}
	if current.UsedBytes+needed > c.high || current.AvailableBytes < needed {
		return fmt.Errorf("%w: need %d bytes with %d used and %d available", errCapacity, needed, current.UsedBytes, current.AvailableBytes)
	}
	return nil
}

// Rename while holding c.mu to exclude opens and leave a recoverable tombstone
// if removal is interrupted. Existing readers already hold their own FDs.
func (c *cache) evictLocked(entry *cacheEntry) error {
	tombstone, err := os.MkdirTemp(c.root, ".evict-")
	if err != nil {
		return err
	}
	defer os.RemoveAll(tombstone)
	if err := os.Rename(filepath.Join(c.root, entry.pin.Version), filepath.Join(tombstone, "artifact")); err != nil && !errors.Is(err, os.ErrNotExist) {
		return err
	}
	delete(c.entries, entry.pin.Version)
	log.Printf("evict %s", entry.pin.Version)
	return os.RemoveAll(tombstone)
}

type cacheStats struct {
	fsUsage
	Ready     []string       `json:"ready"`
	Downloads map[string]int `json:"downloads"`
}

func (c *cache) stats() (cacheStats, error) {
	c.mu.Lock()
	defer c.mu.Unlock()
	usage, err := usage(c.root)
	stats := cacheStats{fsUsage: usage, Ready: make([]string, 0), Downloads: make(map[string]int, len(c.downloads))}
	for version, entry := range c.entries {
		if entry.loading == nil {
			stats.Ready = append(stats.Ready, version)
		}
	}
	for version, count := range c.downloads {
		stats.Downloads[version] = count
	}
	sort.Strings(stats.Ready)
	return stats, err
}
