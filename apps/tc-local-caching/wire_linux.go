//go:build linux

package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"net"
	"os"
	"time"

	"golang.org/x/sys/unix"
)

const (
	maxPacket      = 32 << 10
	fdsPerPacket   = 64
	requestTimeout = 40 * time.Second
)

type request struct {
	Op  string   `json:"op"`
	Pin pin      `json:"pin"`
	IDs []string `json:"ids,omitempty"`
}

type reply struct {
	Error string      `json:"error,omitempty"`
	Code  string      `json:"code,omitempty"`
	Pin   pin         `json:"pin"`
	IDs   []string    `json:"ids,omitempty"`
	Stats *cacheStats `json:"stats,omitempty"`
}

func writePacket(conn *net.UnixConn, data []byte, fds []int) error {
	var control []byte
	if len(fds) != 0 {
		control = unix.UnixRights(fds...)
	}
	n, oobn, err := conn.WriteMsgUnix(data, control, nil)
	if err == nil && (n != len(data) || oobn != len(control)) {
		return io.ErrShortWrite
	}
	return err
}

func sendJSON(conn *net.UnixConn, value any) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}
	return writePacket(conn, data, nil)
}

func readPacket(conn *net.UnixConn) ([]byte, []int, error) {
	raw, err := conn.SyscallConn()
	if err != nil {
		return nil, nil, err
	}
	data := make([]byte, maxPacket)
	control := make([]byte, unix.CmsgSpace(fdsPerPacket*4))
	var n, oobn, flags int
	var readErr error
	err = raw.Read(func(fd uintptr) bool {
		for {
			n, oobn, flags, _, readErr = unix.Recvmsg(int(fd), data, control, unix.MSG_CMSG_CLOEXEC)
			if readErr != unix.EINTR {
				return readErr != unix.EAGAIN
			}
		}
	})
	if err := errors.Join(err, readErr); err != nil {
		return nil, nil, err
	}
	messages, err := unix.ParseSocketControlMessage(control[:oobn])
	if err != nil {
		return nil, nil, err
	}
	var fds []int
	for _, message := range messages {
		rights, err := unix.ParseUnixRights(&message)
		if err != nil {
			closeFDs(fds)
			return nil, nil, err
		}
		fds = append(fds, rights...)
	}
	if flags&(unix.MSG_TRUNC|unix.MSG_CTRUNC) != 0 {
		closeFDs(fds)
		return nil, nil, errors.New("truncated socket packet or FD control message")
	}
	if n == 0 {
		closeFDs(fds)
		return nil, nil, io.EOF
	}
	return data[:n], fds, nil
}

func closeFDs(fds []int) {
	for _, fd := range fds {
		unix.Close(fd)
	}
}

func receiveJSON(conn *net.UnixConn, value any) error {
	data, fds, err := readPacket(conn)
	if len(fds) != 0 {
		closeFDs(fds)
		return errors.New("unexpected FDs on JSON packet")
	}
	if err != nil {
		return err
	}
	return json.Unmarshal(data, value)
}

func sendFailure(conn *net.UnixConn, err error) {
	code := "unavailable"
	switch {
	case errors.Is(err, errInvalid):
		code = "invalid"
	case errors.Is(err, errCapacity), errors.Is(err, unix.ENOSPC), errors.Is(err, unix.EDQUOT):
		code = "resource_exhausted"
	}
	_ = sendJSON(conn, reply{Error: err.Error(), Code: code})
}

func handle(ctx context.Context, conn *net.UnixConn, c *cache) {
	ctx, cancel := context.WithTimeout(ctx, requestTimeout)
	defer cancel()

	_ = conn.SetDeadline(time.Now().Add(requestTimeout))

	// parse requeset into json
	var req request
	if err := receiveJSON(conn, &req); err != nil {
		sendFailure(conn, errors.Join(errInvalid, err))
		return
	}

	// route request
	switch req.Op {
	case "stats":
		stats, err := c.stats()
		if err != nil {
			sendFailure(conn, err)
			return
		}
		_ = sendJSON(conn, reply{Stats: &stats})

	case "acquire":
		// conn.Read is blocked at this point as the req from client is already read.
		// unblocked when client close the conn, and it is the time for cancellation.
		go func() {
			var unused [1]byte
			_, _ = conn.Read(unused[:])
			cancel()
		}()
			
		// get from cache
		result, err := c.acquire(ctx, req.Pin, req.IDs)
		if err != nil {
			sendFailure(conn, err)
			return
		}
		defer result.close()
		if err := sendJSON(conn, reply{Pin: req.Pin, IDs: result.ids}); err != nil {
			return
		}
		for start := 0; start < len(result.files); start += fdsPerPacket {
			end := min(start+fdsPerPacket, len(result.files))
			fds := make([]int, 0, end-start)
			for _, file := range result.files[start:end] {
				fds = append(fds, int(file.Fd()))
			}
			if err := writePacket(conn, []byte{1}, fds); err != nil {
				log.Printf("transfer %s: %v", req.Pin.Version, err)
				return
			}
		}

	default:
		sendFailure(conn, fmt.Errorf("%w: unknown operation", errInvalid))
	}
}

func exchange(ctx context.Context, socket string, req request) (*net.UnixConn, reply, func(), error) {
	ctx, cancel := context.WithTimeout(ctx, requestTimeout)
	var dialer net.Dialer
	opened, err := dialer.DialContext(ctx, "unixpacket", socket)
	if err != nil {
		cancel()
		return nil, reply{}, nil, err
	}
	conn := opened.(*net.UnixConn)
	deadline, _ := ctx.Deadline()
	_ = conn.SetDeadline(deadline)
	stop := context.AfterFunc(ctx, func() { conn.Close() })
	closeConn := func() {
		stop()
		conn.Close()
		cancel()
	}
	var res reply
	if err := sendJSON(conn, req); err != nil {
		closeConn()
		return nil, reply{}, nil, err
	}
	if err := receiveJSON(conn, &res); err != nil {
		closeConn()
		return nil, reply{}, nil, err
	}
	if res.Error != "" {
		closeConn()
		return nil, reply{}, nil, fmt.Errorf("%s: %s", res.Code, res.Error)
	}
	return conn, res, closeConn, nil
}

func acquireFiles(ctx context.Context, socket string, p pin, ids []string) (acquired, error) {
	conn, res, cleanup, err := exchange(ctx, socket, request{Op: "acquire", Pin: p, IDs: ids})
	if err != nil {
		return acquired{}, err
	}
	defer cleanup()
	if res.Pin != p || len(res.IDs) == 0 || len(res.IDs) > maxCases {
		return acquired{}, errors.New("invalid acquire response metadata")
	}
	if len(ids) != 0 && len(ids) != len(res.IDs) {
		return acquired{}, errors.New("unexpected testcase count")
	}
	seen := make(map[string]bool, len(res.IDs))
	for i, id := range res.IDs {
		if !identifier.MatchString(id) || seen[id] || (len(ids) != 0 && id != ids[i]) {
			return acquired{}, errors.New("invalid testcase-to-FD mapping")
		}
		seen[id] = true
	}
	result := acquired{ids: res.IDs, files: make([]*os.File, 0, 2*len(res.IDs))}
	for len(result.files) < cap(result.files) {
		expected := min(fdsPerPacket, cap(result.files)-len(result.files))
		data, fds, err := readPacket(conn)
		if err != nil || len(data) != 1 || data[0] != 1 || len(fds) != expected {
			closeFDs(fds)
			result.close()
			return acquired{}, errors.Join(errors.New("incomplete FD response"), err)
		}
		for _, fd := range fds {
			result.files = append(result.files, os.NewFile(uintptr(fd), "testcase"))
		}
	}
	return result, nil
}

func queryStats(ctx context.Context, socket string) (cacheStats, error) {
	_, res, cleanup, err := exchange(ctx, socket, request{Op: "stats"})
	if err != nil {
		return cacheStats{}, err
	}
	defer cleanup()
	if res.Stats == nil {
		return cacheStats{}, errors.New("missing stats")
	}
	return *res.Stats, nil
}
