package main

import (
	"context"
	"testing"
	"time"

	"github.com/alicebob/miniredis/v2"
	redis "github.com/redis/go-redis/v9"
)

func TestLoadRunnerNodePoolsWithoutSelectorKey(t *testing.T) {
	t.Setenv("RUNNER_NODE_SELECTOR_KEY", "")
	t.Setenv("RUNNER_NODE_POD_COUNTS", "")
	t.Setenv("RUNNER_NODE_SELECTOR_VALUE", "")

	selectorKey, pools, err := loadRunnerNodePools(10)
	if err != nil {
		t.Fatalf("loadRunnerNodePools returned error: %v", err)
	}
	if selectorKey != "" {
		t.Fatalf("expected empty selectorKey, got %q", selectorKey)
	}
	if pools != nil {
		t.Fatalf("expected nil pools, got %#v", pools)
	}
}

func TestLoadRunnerNodePoolsParsesCounts(t *testing.T) {
	t.Setenv("RUNNER_NODE_SELECTOR_KEY", "runner-node")
	t.Setenv("RUNNER_NODE_POD_COUNTS", "node-1=40, node-2=10,node-3=10")
	t.Setenv("RUNNER_NODE_SELECTOR_VALUE", "")

	selectorKey, pools, err := loadRunnerNodePools(60)
	if err != nil {
		t.Fatalf("loadRunnerNodePools returned error: %v", err)
	}
	if selectorKey != "runner-node" {
		t.Fatalf("unexpected selectorKey: %q", selectorKey)
	}
	if len(pools) != 3 {
		t.Fatalf("expected 3 pools, got %d", len(pools))
	}
	if pools[0] != (RunnerNodePool{NodePoolID: "node-1", MaxPods: 40}) {
		t.Fatalf("unexpected pool[0]: %#v", pools[0])
	}
	if pools[1] != (RunnerNodePool{NodePoolID: "node-2", MaxPods: 10}) {
		t.Fatalf("unexpected pool[1]: %#v", pools[1])
	}
	if pools[2] != (RunnerNodePool{NodePoolID: "node-3", MaxPods: 10}) {
		t.Fatalf("unexpected pool[2]: %#v", pools[2])
	}
}

func TestLoadRunnerNodePoolsFallbackSingleValue(t *testing.T) {
	t.Setenv("RUNNER_NODE_SELECTOR_KEY", "runner-node")
	t.Setenv("RUNNER_NODE_POD_COUNTS", "")
	t.Setenv("RUNNER_NODE_SELECTOR_VALUE", "node-1")

	selectorKey, pools, err := loadRunnerNodePools(7)
	if err != nil {
		t.Fatalf("loadRunnerNodePools returned error: %v", err)
	}
	if selectorKey != "runner-node" {
		t.Fatalf("unexpected selectorKey: %q", selectorKey)
	}
	if len(pools) != 1 {
		t.Fatalf("expected 1 pool, got %d", len(pools))
	}
	if pools[0] != (RunnerNodePool{NodePoolID: "node-1", MaxPods: 7}) {
		t.Fatalf("unexpected pool: %#v", pools[0])
	}
}

func TestLoadRunnerNodePoolsRejectsInvalidCounts(t *testing.T) {
	t.Setenv("RUNNER_NODE_SELECTOR_KEY", "runner-node")
	t.Setenv("RUNNER_NODE_POD_COUNTS", "node-1=1,broken-entry")
	t.Setenv("RUNNER_NODE_SELECTOR_VALUE", "")

	if _, _, err := loadRunnerNodePools(10); err == nil {
		t.Fatal("expected error for invalid RUNNER_NODE_POD_COUNTS entry")
	}
}

func newTestRunnerStateStore(t *testing.T) *redisRunnerStateStore {
	t.Helper()

	mr, err := miniredis.Run()
	if err != nil {
		t.Fatalf("start miniredis: %v", err)
	}
	t.Cleanup(func() { mr.Close() })

	client := redis.NewClient(&redis.Options{Addr: mr.Addr()})
	t.Cleanup(func() { _ = client.Close() })

	return &redisRunnerStateStore{
		client: client,
		prefix: "test:runner",
	}
}

func TestAcquireAndReleaseRunnerLease(t *testing.T) {
	ctx := context.Background()
	store := newTestRunnerStateStore(t)

	err := store.UpsertRunner(ctx, RunnerStateRecord{
		PodName:    "runner-a",
		NodePoolID: "node-1",
		PodIP:      "10.0.0.11",
		State:      RunnerStateIdle,
	})
	if err != nil {
		t.Fatalf("upsert idle runner: %v", err)
	}

	lease, err := store.AcquireIdleRunnerLease(ctx, "pm-1", "uid-1", 200*time.Second)
	if err != nil {
		t.Fatalf("acquire lease: %v", err)
	}
	if lease == nil {
		t.Fatal("expected lease to be acquired")
	}
	if lease.Record.PodName != "runner-a" {
		t.Fatalf("unexpected leased pod: %q", lease.Record.PodName)
	}

	secondLease, err := store.AcquireIdleRunnerLease(ctx, "pm-2", "uid-2", 200*time.Second)
	if err != nil {
		t.Fatalf("second acquire lease: %v", err)
	}
	if secondLease != nil {
		t.Fatalf("expected no second lease, got %#v", secondLease)
	}

	hasLease, err := store.HasRunnerLease(ctx, "runner-a")
	if err != nil {
		t.Fatalf("has lease check: %v", err)
	}
	if !hasLease {
		t.Fatal("expected lease key to exist")
	}

	ok, err := store.ReleaseRunnerLease(ctx, "runner-a", "wrong-token", RunnerStateIdle)
	if err != nil {
		t.Fatalf("release with wrong token: %v", err)
	}
	if ok {
		t.Fatal("expected release with wrong token to fail")
	}

	ok, err = store.ReleaseRunnerLease(ctx, "runner-a", lease.LeaseToken, RunnerStateIdle)
	if err != nil {
		t.Fatalf("release with correct token: %v", err)
	}
	if !ok {
		t.Fatal("expected release with correct token to succeed")
	}

	hasLease, err = store.HasRunnerLease(ctx, "runner-a")
	if err != nil {
		t.Fatalf("has lease check after release: %v", err)
	}
	if hasLease {
		t.Fatal("expected lease key to be deleted after release")
	}

	idles, err := store.ListRunnersByStates(ctx, RunnerStateIdle)
	if err != nil {
		t.Fatalf("list idle runners: %v", err)
	}
	if len(idles) != 1 || idles[0].PodName != "runner-a" {
		t.Fatalf("expected runner-a to return to idle, got %#v", idles)
	}
}

func TestReserveProvisioningSlotRespectsTotalAndNodeCaps(t *testing.T) {
	ctx := context.Background()
	store := newTestRunnerStateStore(t)

	ok, err := store.TryReserveProvisioningSlot(ctx, 2, "node-1", 1)
	if err != nil {
		t.Fatalf("reserve #1: %v", err)
	}
	if !ok {
		t.Fatal("expected first reservation to succeed")
	}

	ok, err = store.TryReserveProvisioningSlot(ctx, 2, "node-1", 1)
	if err != nil {
		t.Fatalf("reserve #2 same node: %v", err)
	}
	if ok {
		t.Fatal("expected second reservation on node-1 to fail due to node cap")
	}

	ok, err = store.TryReserveProvisioningSlot(ctx, 2, "node-2", 1)
	if err != nil {
		t.Fatalf("reserve #3 node-2: %v", err)
	}
	if !ok {
		t.Fatal("expected reservation on node-2 to succeed")
	}

	ok, err = store.TryReserveProvisioningSlot(ctx, 2, "node-3", 1)
	if err != nil {
		t.Fatalf("reserve #4 total cap: %v", err)
	}
	if ok {
		t.Fatal("expected reservation to fail due to total cap")
	}

	if err := store.ReleaseProvisioningSlotReservation(ctx, "node-1"); err != nil {
		t.Fatalf("release reservation node-1: %v", err)
	}

	ok, err = store.TryReserveProvisioningSlot(ctx, 2, "node-1", 1)
	if err != nil {
		t.Fatalf("reserve after release: %v", err)
	}
	if !ok {
		t.Fatal("expected reservation to succeed after releasing node-1 slot")
	}
}
