//go:build linux

package main

import (
	"bufio"
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"os"
	"os/exec"
	"path/filepath"
	"slices"
	"strconv"
	"strings"
	"sync/atomic"
	"testing"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"golang.org/x/sys/unix"
)

func TestSiloCache(t *testing.T) {
	if os.Getenv("SILO_ENDPOINT") == "" {
		t.Skip("run the Compose verify service for the Silo integration")
	}
	ctx := t.Context()
	source, err := newObjectSource()
	check(t, err)
	suffix := strconv.FormatInt(time.Now().UnixNano(), 36)
	publish := func(name string, bodies map[string][]byte) pin {
		t.Helper()
		data, p, err := buildBundle(name+"-"+suffix, bodies)
		check(t, err)
		check(t, source.publish(ctx, p, data))
		t.Cleanup(func() {
			cleanup, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			_, err := source.client.DeleteObject(cleanup, &s3.DeleteObjectInput{
				Bucket: aws.String(source.bucket), Key: aws.String(p.objectKey()),
			})
			if err != nil {
				t.Errorf("delete temporary test object %s: %v", p.Version, err)
			}
		})
		return p
	}

	many := make(map[string][]byte)
	for i := 0; i < 130; i++ {
		id := fmt.Sprintf("c%03d", i)
		many[id+".in"] = []byte(fmt.Sprintf("%d\n", i))
		many[id+".out"] = []byte("ok\n")
	}
	multi := publish("multi", many)
	retry := publish("retry", map[string][]byte{"1.in": []byte("1 1\n"), "1.out": []byte("2\n")})
	changed, changedPin, err := buildBundle(retry.Version, map[string][]byte{
		"1.in": []byte("1 2\n"), "1.out": []byte("3\n"),
	})
	check(t, err)
	if err := source.publish(ctx, changedPin, changed); err == nil || !strings.Contains(err.Error(), "already exists with different bytes") {
		t.Fatalf("conditional upload did not reject replacement of %s: %v", retry.Version, err)
	}
	const largeSize = 7 << 19
	largeAData := bytes.Repeat([]byte{'a'}, largeSize)
	largeA := publish("large-a", map[string][]byte{"1.in": largeAData, "1.out": []byte("a\n")})
	largeB := publish("large-b", map[string][]byte{"1.in": bytes.Repeat([]byte{'b'}, largeSize), "1.out": []byte("b\n")})
	root, err := os.MkdirTemp("/test-cache", "run-")
	check(t, err)
	t.Cleanup(func() { os.RemoveAll(root) })
	socket := filepath.Join(t.TempDir(), "manager.sock")
	stop := launchManager(t, socket, root)

	first, second := launchPeer(t, socket, multi), launchPeer(t, socket, multi)
	first.ready(t)
	second.ready(t)
	multiStats, err := queryStats(ctx, socket)
	check(t, err)
	if multiStats.Downloads[multi.Version] != 1 {
		t.Fatalf("expected one download for two clients, stats: %+v", multiStats)
	}

	all, err := acquireFiles(ctx, socket, multi, nil)
	check(t, err)
	t.Cleanup(all.close)
	if len(all.files) != 260 || len(all.ids) != 130 {
		t.Fatalf("incomplete multi-packet response: %d descriptors", len(all.files))
	}
	for i, file := range all.files {
		fd, err := unix.FcntlInt(file.Fd(), unix.F_GETFD, 0)
		check(t, err)
		mode, err := unix.FcntlInt(file.Fd(), unix.F_GETFL, 0)
		check(t, err)
		if fd&unix.FD_CLOEXEC == 0 || mode&unix.O_ACCMODE != unix.O_RDONLY {
			t.Fatalf("FD %d is missing CLOEXEC or is writable", i)
		}
		suffix := []string{".in", ".out"}[i%2]
		check(t, verifyFile(file, describe(many[all.ids[i/2]+suffix])))
	}
	all.close()
	fdLimit := exec.Command(os.Args[0], "-test.run=^TestReceiverFDLimit$")
	fdLimit.Env = append(os.Environ(), "TC_TEST_SOCKET="+socket, "TC_TEST_VERSION="+multi.Version, "TC_TEST_SHA256="+multi.SHA256)
	output, err := fdLimit.CombinedOutput()
	if err != nil {
		t.Fatalf("client FD-limit test: %v\n%s", err, output)
	}

	wrong := retry
	wrong.SHA256 = strings.Repeat("0", 64)
	if result, err := acquireFiles(ctx, socket, wrong, nil); err == nil || len(result.files) != 0 || !strings.Contains(err.Error(), "SHA-256 mismatch") {
		result.close()
		t.Fatalf("checksum mismatch: files=%d err=%v", len(result.files), err)
	}
	valid, err := acquireFiles(ctx, socket, retry, nil)
	check(t, err)
	valid.close()
	retryStats, err := queryStats(ctx, socket)
	check(t, err)
	if retryStats.Downloads[retry.Version] != 2 {
		t.Fatalf("failed load should be retryable: %+v", retryStats)
	}

	a1, err := acquireFiles(ctx, socket, largeA, nil)
	check(t, err)
	t.Cleanup(a1.close)
	a2, err := acquireFiles(ctx, socket, largeA, nil)
	check(t, err)
	t.Cleanup(a2.close)
	requireCapacityError(t, socket, largeB)
	afterGC, err := queryStats(ctx, socket)
	check(t, err)
	if len(afterGC.Ready) != 0 || afterGC.UsedBytes < largeSize {
		t.Fatalf("GC should remove paths and retain open allocation: %+v", afterGC)
	}
	if _, err := os.Stat(filepath.Join(root, largeA.Version)); !errors.Is(err, os.ErrNotExist) {
		t.Fatalf("evicted version still has a path: %v", err)
	}
	first.finish(t)
	second.finish(t)

	check(t, os.Mkdir(filepath.Join(root, ".stage-abandoned"), 0o700))
	stop()
	stop = launchManager(t, socket, root)
	if _, err := os.Stat(filepath.Join(root, ".stage-abandoned")); !errors.Is(err, os.ErrNotExist) {
		t.Fatalf("abandoned staging path survived restart: %v", err)
	}
	requireCapacityError(t, socket, largeB)
	beforeClose, err := queryStats(ctx, socket)
	check(t, err)
	check(t, verifyFile(a1.files[0], describe(largeAData)))
	a1.close()
	check(t, verifyFile(a2.files[0], describe(largeAData)))
	a2.close()
	afterClose, err := queryStats(ctx, socket)
	check(t, err)
	if beforeClose.UsedBytes-afterClose.UsedBytes < largeSize {
		t.Fatalf("last close did not reclaim %d bytes: before=%+v after=%+v", largeSize, beforeClose, afterClose)
	}

	b, err := acquireFiles(ctx, socket, largeB, nil)
	check(t, err)
	b.close()
	stop()
	launchManager(t, socket, root)
	b, err = acquireFiles(ctx, socket, largeB, nil)
	check(t, err)
	b.close()
	warm, err := queryStats(ctx, socket)
	check(t, err)
	if !slices.Contains(warm.Ready, largeB.Version) || warm.Downloads[largeB.Version] != 0 {
		t.Fatalf("restart should inventory and reuse the committed artifact: %+v", warm)
	}
	reloaded, err := acquireFiles(ctx, socket, largeA, nil)
	check(t, err)
	check(t, verifyFile(reloaded.files[0], describe(largeAData)))
	reloaded.close()
	t.Log("verified two processes after unlink, 260 FD transfer, checksum retry, cache restart, and last-close space recovery")
}

func requireCapacityError(t *testing.T, socket string, p pin) {
	t.Helper()
	result, err := acquireFiles(t.Context(), socket, p, nil)
	defer result.close()
	if len(result.files) != 0 || err == nil || !strings.Contains(err.Error(), "resource_exhausted") {
		t.Fatalf("expected capacity error without files, got %d files and %v", len(result.files), err)
	}
}

func launchManager(t *testing.T, socket, root string) func() {
	t.Helper()
	cmd := exec.Command("/tc-cache", "serve", "-socket", socket, "-cache", root)
	cmd.Stderr = os.Stderr
	check(t, cmd.Start())
	stop := func() {
		if cmd.ProcessState == nil {
			_ = cmd.Process.Kill()
			_ = cmd.Wait()
		}
	}
	t.Cleanup(stop)
	ctx, cancel := context.WithTimeout(t.Context(), 10*time.Second)
	defer cancel()
	for {
		if _, err := queryStats(ctx, socket); err == nil {
			return stop
		}
		select {
		case <-ctx.Done():
			t.Fatal("manager did not start")
		case <-time.After(30 * time.Millisecond):
		}
	}
}

type heldPeer struct {
	cmd    *exec.Cmd
	input  io.WriteCloser
	stderr *bufio.Scanner
	output *bytes.Buffer
}

func launchPeer(t *testing.T, socket string, p pin) heldPeer {
	t.Helper()
	cmd := exec.Command("/tc-cache", "read", "-socket", socket, "-version", p.Version,
		"-sha256", p.SHA256, "-cases", "c000", "-wait")
	input, err := cmd.StdinPipe()
	check(t, err)
	stderr, err := cmd.StderrPipe()
	check(t, err)
	var output bytes.Buffer
	cmd.Stdout = &output
	check(t, cmd.Start())
	t.Cleanup(func() {
		if cmd.ProcessState == nil {
			_ = cmd.Process.Kill()
			_ = cmd.Wait()
		}
	})
	return heldPeer{cmd, input, bufio.NewScanner(stderr), &output}
}

func (p heldPeer) ready(t *testing.T) {
	t.Helper()
	if !p.stderr.Scan() || p.stderr.Text() != "acquired" {
		t.Fatalf("peer failed before acquire: %s", p.stderr.Text())
	}
}

func (p heldPeer) finish(t *testing.T) {
	t.Helper()
	_, err := io.WriteString(p.input, "\n")
	check(t, err)
	check(t, p.input.Close())
	check(t, p.cmd.Wait())
	if got := p.output.String(); got != "c000.in \"0\\n\"\nc000.out \"ok\\n\"\n" {
		t.Fatalf("peer read after unlink: %q", got)
	}
}

func TestReceiverFDLimit(t *testing.T) {
	socket := os.Getenv("TC_TEST_SOCKET")
	if socket == "" {
		t.Skip("subprocess helper")
	}
	p := pin{os.Getenv("TC_TEST_VERSION"), os.Getenv("TC_TEST_SHA256")}
	// Initialize the Go poller before counting descriptors.
	_, err := queryStats(t.Context(), socket)
	check(t, err)
	var limit unix.Rlimit
	check(t, unix.Getrlimit(unix.RLIMIT_NOFILE, &limit))
	limit.Cur = 24
	check(t, unix.Setrlimit(unix.RLIMIT_NOFILE, &limit))
	before := fdCount(t)
	result, err := acquireFiles(t.Context(), socket, p, nil)
	result.close()
	if err == nil || len(result.files) != 0 {
		t.Fatalf("receiver FD exhaustion returned a partial success")
	}
	if after := fdCount(t); after != before {
		t.Fatalf("FDs leaked across truncated receive: before=%d after=%d", before, after)
	}
}

func TestIncompleteTransfer(t *testing.T) {
	socket := filepath.Join(t.TempDir(), "stub.sock")
	listener, err := net.ListenUnix("unixpacket", &net.UnixAddr{Name: socket, Net: "unixpacket"})
	check(t, err)
	defer listener.Close()
	file, err := os.Open("/dev/null")
	check(t, err)
	defer file.Close()
	p := pin{"stub", strings.Repeat("0", 64)}
	server := make(chan error, 1)
	go func() {
		conn, err := listener.AcceptUnix()
		if err != nil {
			server <- err
			return
		}
		defer conn.Close()
		var req request
		if err := receiveJSON(conn, &req); err != nil {
			server <- err
			return
		}
		ids := make([]string, fdsPerPacket/2+1)
		for i := range ids {
			ids[i] = strconv.Itoa(i)
		}
		if err := sendJSON(conn, reply{Pin: p, IDs: ids}); err != nil {
			server <- err
			return
		}
		fds := make([]int, fdsPerPacket)
		for i := range fds {
			fds[i] = int(file.Fd())
		}
		server <- writePacket(conn, []byte{1}, fds)
	}()
	before := fdCount(t)
	result, err := acquireFiles(t.Context(), socket, p, nil)
	check(t, <-server)
	if err == nil || len(result.files) != 0 {
		result.close()
		t.Fatal("incomplete response returned success")
	}
	if after := fdCount(t); after != before {
		t.Fatalf("FDs leaked across broken transfer: before=%d after=%d", before, after)
	}
}

type blockedSource struct {
	data    []byte
	started chan struct{}
	release chan struct{}
	calls   atomic.Int32
}

func (s *blockedSource) open(ctx context.Context, _ pin) (io.ReadCloser, error) {
	if s.calls.Add(1) == 1 {
		close(s.started)
	}
	select {
	case <-ctx.Done():
		return nil, ctx.Err()
	case <-s.release:
		return io.NopCloser(bytes.NewReader(s.data)), nil
	}
}

func TestCanceledAcquireDoesNotCancelSharedLoad(t *testing.T) {
	data, p, err := buildBundle("cancel", map[string][]byte{"1.in": []byte("x"), "1.out": []byte("y")})
	check(t, err)
	source := &blockedSource{data: data, started: make(chan struct{}), release: make(chan struct{})}
	root, err := os.MkdirTemp("/test-cache", "cancel-")
	if errors.Is(err, os.ErrNotExist) {
		t.Skip("run the Compose verify service for a dedicated filesystem")
	}
	check(t, err)
	defer os.RemoveAll(root)
	c, err := newCache(t.Context(), root, source, 6<<20, 3<<20)
	check(t, err)
	ctx, cancel := context.WithCancel(t.Context())
	defer cancel()
	first := make(chan error, 1)
	go func() {
		result, err := c.acquire(ctx, p, nil)
		result.close()
		first <- err
	}()
	<-source.started
	second := make(chan error, 1)
	go func() {
		result, err := c.acquire(t.Context(), p, nil)
		result.close()
		second <- err
	}()
	cancel()
	if err := <-first; !errors.Is(err, context.Canceled) {
		t.Fatalf("canceled acquire returned %v", err)
	}
	close(source.release)
	check(t, <-second)
	if source.calls.Load() != 1 {
		t.Fatalf("expected one shared load, got %d", source.calls.Load())
	}
}

type fixtureSource map[string][]byte

func (s fixtureSource) open(_ context.Context, p pin) (io.ReadCloser, error) {
	return io.NopCloser(bytes.NewReader(s[p.Version])), nil
}

func TestEvictionKeepsMostRecentlyUsed(t *testing.T) {
	root, err := os.MkdirTemp("/test-cache", "lru-")
	if errors.Is(err, os.ErrNotExist) {
		t.Skip("run the Compose verify service for a dedicated filesystem")
	}
	check(t, err)
	defer os.RemoveAll(root)
	source := fixtureSource{}
	var pins []pin
	for _, version := range []string{"first", "second", "third"} {
		data, p, err := buildBundle(version, map[string][]byte{
			"1.in": bytes.Repeat([]byte{version[0]}, 2<<20), "1.out": []byte("ok"),
		})
		check(t, err)
		source[version] = data
		pins = append(pins, p)
	}
	c, err := newCache(t.Context(), root, source, 6<<20, 3<<20)
	check(t, err)
	for _, p := range []pin{pins[0], pins[1], pins[0], pins[2]} {
		result, err := c.acquire(t.Context(), p, nil)
		check(t, err)
		result.close()
	}
	stats, err := c.stats()
	check(t, err)
	if !slices.Equal(stats.Ready, []string{"first", "third"}) || stats.Downloads["first"] != 1 {
		t.Fatalf("least recently used version was not evicted: %+v", stats)
	}

	// Race a warm acquire against a miss that must evict an entry.
	errs := make(chan error, 2)
	start := make(chan struct{})
	for _, p := range pins[:2] {
		go func() {
			<-start
			result, err := c.acquire(t.Context(), p, nil)
			defer result.close()
			if err != nil {
				errs <- err
				return
			}
			if len(result.files) != 2 {
				errs <- fmt.Errorf("partial successful acquire for %s", p.Version)
				return
			}
			errs <- errors.Join(
				verifyFile(result.files[0], describe(bytes.Repeat([]byte{p.Version[0]}, 2<<20))),
				verifyFile(result.files[1], describe([]byte("ok"))),
			)
		}()
	}
	close(start)
	check(t, <-errs)
	check(t, <-errs)
}

func fdCount(t *testing.T) int {
	t.Helper()
	fds, err := os.ReadDir("/proc/self/fd")
	check(t, err)
	return len(fds)
}

func check(t *testing.T, err error) {
	t.Helper()
	if err != nil {
		t.Fatal(err)
	}
}
