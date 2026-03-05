package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strconv"
	"strings"
	"time"

	redis "github.com/redis/go-redis/v9"
)

type RunnerLifecycleState string

const (
	RunnerStateProvisioning RunnerLifecycleState = "provisioning"
	RunnerStateIdle         RunnerLifecycleState = "idle"
	RunnerStateLeased       RunnerLifecycleState = "leased"
)

type RunnerStateRecord struct {
	PodName     string
	NodePoolID  string
	PodIP       string
	State       RunnerLifecycleState
	OwnerPod    string
	OwnerPodUID string
	LeaseToken  string
	UpdatedAt   time.Time
}

type RunnerLease struct {
	Record     RunnerStateRecord
	LeaseToken string
}

type RunnerClusterSnapshot struct {
	TotalIdle         int64
	TotalLeased       int64
	TotalProvisioning int64
	TotalReserved     int64
	NodePoolCounts    map[string]RunnerNodePoolSnapshot
}

type RunnerNodePoolSnapshot struct {
	Idle         int64
	Leased       int64
	Provisioning int64
	Reserved     int64
}

type RunnerStateStore interface {
	Enabled() bool
	UpsertRunner(ctx context.Context, record RunnerStateRecord) error
	DeleteRunner(ctx context.Context, podName string) error
	GetClusterSnapshot(ctx context.Context, nodePools []RunnerNodePool) (*RunnerClusterSnapshot, error)
	AcquireIdleRunnerLease(ctx context.Context, ownerPod, ownerUID string, ttl time.Duration) (*RunnerLease, error)
	ReleaseRunnerLease(ctx context.Context, podName, leaseToken string, nextState RunnerLifecycleState) (bool, error)
	TryReserveProvisioningSlot(ctx context.Context, targetPoolSize int, nodePoolID string, nodePoolCap int) (bool, error)
	ReleaseProvisioningSlotReservation(ctx context.Context, nodePoolID string) error
	ListRunnersByStates(ctx context.Context, states ...RunnerLifecycleState) ([]RunnerStateRecord, error)
	HasRunnerLease(ctx context.Context, podName string) (bool, error)
}

func NewRunnerStateStoreFromEnv(logger *log.Logger) RunnerStateStore {
	addr := strings.TrimSpace(os.Getenv("REDIS_ADDR"))
	if addr == "" {
		logger.Printf("REDIS_ADDR is empty, shared runner state disabled")
		return noopRunnerStateStore{}
	}

	db := 0
	if raw := strings.TrimSpace(os.Getenv("REDIS_DB")); raw != "" {
		if parsed, err := strconv.Atoi(raw); err == nil {
			db = parsed
		}
	}

	prefix := strings.TrimSpace(os.Getenv("RUNNER_REDIS_PREFIX"))
	if prefix == "" {
		prefix = "codedang:runner"
	}

	client := redis.NewClient(&redis.Options{
		Addr:         addr,
		Password:     os.Getenv("REDIS_PASSWORD"),
		DB:           db,
		DialTimeout:  2 * time.Second,
		ReadTimeout:  1 * time.Second,
		WriteTimeout: 1 * time.Second,
	})

	if err := client.Ping(context.Background()).Err(); err != nil {
		logger.Printf("Redis ping failed, shared runner state disabled: %v", err)
		_ = client.Close()
		return noopRunnerStateStore{}
	}

	logger.Printf("Shared runner state enabled (redis=%s db=%d prefix=%s)", addr, db, prefix)
	return &redisRunnerStateStore{client: client, prefix: prefix}
}

type noopRunnerStateStore struct{}

func (noopRunnerStateStore) Enabled() bool { return false }

func (noopRunnerStateStore) UpsertRunner(context.Context, RunnerStateRecord) error { return nil }

func (noopRunnerStateStore) DeleteRunner(context.Context, string) error { return nil }

func (noopRunnerStateStore) GetClusterSnapshot(context.Context, []RunnerNodePool) (*RunnerClusterSnapshot, error) {
	return &RunnerClusterSnapshot{NodePoolCounts: map[string]RunnerNodePoolSnapshot{}}, nil
}

func (noopRunnerStateStore) AcquireIdleRunnerLease(context.Context, string, string, time.Duration) (*RunnerLease, error) {
	return nil, nil
}

func (noopRunnerStateStore) ReleaseRunnerLease(context.Context, string, string, RunnerLifecycleState) (bool, error) {
	return false, nil
}

func (noopRunnerStateStore) TryReserveProvisioningSlot(context.Context, int, string, int) (bool, error) {
	return false, nil
}

func (noopRunnerStateStore) ReleaseProvisioningSlotReservation(context.Context, string) error { return nil }

func (noopRunnerStateStore) ListRunnersByStates(context.Context, ...RunnerLifecycleState) ([]RunnerStateRecord, error) {
	return nil, nil
}

func (noopRunnerStateStore) HasRunnerLease(context.Context, string) (bool, error) { return false, nil }

type redisRunnerStateStore struct {
	client *redis.Client
	prefix string
}

var acquireRunnerLeaseScript = redis.NewScript(`
local state = redis.call('HGET', KEYS[1], 'state')
if state ~= ARGV[1] then
  return 0
end
local ok = redis.call('SET', KEYS[2], ARGV[5], 'NX', 'PX', ARGV[6])
if not ok then
  return 0
end
redis.call('HSET', KEYS[1],
  'state', ARGV[2],
  'owner_pod', ARGV[3],
  'owner_uid', ARGV[4],
  'lease_token', ARGV[5],
  'lease_expire_at', ARGV[7],
  'updated_at', ARGV[8]
)
redis.call('SREM', KEYS[3], ARGV[9])
redis.call('SADD', KEYS[4], ARGV[9])
if KEYS[5] ~= '' then
  redis.call('SREM', KEYS[5], ARGV[9])
end
if KEYS[6] ~= '' then
  redis.call('SADD', KEYS[6], ARGV[9])
end
return 1
`)

var releaseRunnerLeaseScript = redis.NewScript(`
local state = redis.call('HGET', KEYS[1], 'state')
local token = redis.call('HGET', KEYS[1], 'lease_token')
if state ~= ARGV[1] or token ~= ARGV[2] then
  return 0
end
redis.call('DEL', KEYS[2])
redis.call('HSET', KEYS[1],
  'state', ARGV[3],
  'lease_token', '',
  'lease_expire_at', '',
  'updated_at', ARGV[4]
)
redis.call('SREM', KEYS[3], ARGV[5])
if KEYS[4] ~= '' then
  redis.call('SADD', KEYS[4], ARGV[5])
end
if KEYS[6] ~= '' then
  redis.call('SREM', KEYS[6], ARGV[5])
end
if KEYS[5] ~= '' then
  redis.call('SADD', KEYS[5], ARGV[5])
end
return 1
`)

var reserveProvisioningSlotScript = redis.NewScript(`
local totalActual = redis.call('SCARD', KEYS[1]) + redis.call('SCARD', KEYS[2]) + redis.call('SCARD', KEYS[3])
local totalReserved = tonumber(redis.call('GET', KEYS[4]) or '0')
local totalCap = tonumber(ARGV[1])
if totalCap > 0 and (totalActual + totalReserved) >= totalCap then
  return 0
end
local nodeReserved = tonumber(redis.call('HGET', KEYS[5], ARGV[2]) or '0')
local nodeActual = 0
if KEYS[6] ~= '' then
  nodeActual = nodeActual + redis.call('SCARD', KEYS[6])
end
if KEYS[7] ~= '' then
  nodeActual = nodeActual + redis.call('SCARD', KEYS[7])
end
if KEYS[8] ~= '' then
  nodeActual = nodeActual + redis.call('SCARD', KEYS[8])
end
local nodeCap = tonumber(ARGV[3])
if nodeCap > 0 and (nodeActual + nodeReserved) >= nodeCap then
  return 0
end
redis.call('INCR', KEYS[4])
redis.call('HINCRBY', KEYS[5], ARGV[2], 1)
return 1
`)

var releaseProvisioningSlotScript = redis.NewScript(`
local current = tonumber(redis.call('HGET', KEYS[2], ARGV[1]) or '0')
if current <= 0 then
  return 0
end
redis.call('HINCRBY', KEYS[2], ARGV[1], -1)
local total = tonumber(redis.call('GET', KEYS[1]) or '0')
if total > 0 then
  redis.call('DECR', KEYS[1])
end
if tonumber(redis.call('HGET', KEYS[2], ARGV[1]) or '0') <= 0 then
  redis.call('HDEL', KEYS[2], ARGV[1])
end
return 1
`)

func (s *redisRunnerStateStore) Enabled() bool { return s != nil && s.client != nil }

func (s *redisRunnerStateStore) runnerKey(podName string) string {
	return fmt.Sprintf("%s:runner:%s", s.prefix, podName)
}

func (s *redisRunnerStateStore) runnerLeaseKey(podName string) string {
	return fmt.Sprintf("%s:lease:%s", s.prefix, podName)
}

func (s *redisRunnerStateStore) provisioningReservedTotalKey() string {
	return fmt.Sprintf("%s:provisioning:reserved:total", s.prefix)
}

func (s *redisRunnerStateStore) provisioningReservedByNodeKey() string {
	return fmt.Sprintf("%s:provisioning:reserved:by-node", s.prefix)
}

func (s *redisRunnerStateStore) stateIndexKey(state RunnerLifecycleState) string {
	return fmt.Sprintf("%s:index:state:%s", s.prefix, state)
}

func (s *redisRunnerStateStore) nodeStateIndexKey(nodePoolID string, state RunnerLifecycleState) string {
	return fmt.Sprintf("%s:index:node:%s:state:%s", s.prefix, nodePoolID, state)
}

func (s *redisRunnerStateStore) UpsertRunner(ctx context.Context, record RunnerStateRecord) error {
	if !s.Enabled() || record.PodName == "" || record.State == "" {
		return nil
	}

	prev, err := s.client.HGetAll(ctx, s.runnerKey(record.PodName)).Result()
	if err != nil && err != redis.Nil {
		return fmt.Errorf("hgetall previous runner state: %w", err)
	}
	prevState := RunnerLifecycleState(prev["state"])
	prevNodePool := prev["node_pool"]

	updatedAt := record.UpdatedAt
	if updatedAt.IsZero() {
		updatedAt = time.Now()
	}

	pipe := s.client.TxPipeline()
	pipe.HSet(ctx, s.runnerKey(record.PodName),
		"pod_name", record.PodName,
		"state", string(record.State),
		"node_pool", record.NodePoolID,
		"pod_ip", record.PodIP,
		"owner_pod", record.OwnerPod,
		"owner_uid", record.OwnerPodUID,
		"lease_token", record.LeaseToken,
		"updated_at", updatedAt.UTC().Format(time.RFC3339Nano),
	)
	pipe.SAdd(ctx, s.stateIndexKey(record.State), record.PodName)
	if record.NodePoolID != "" {
		pipe.SAdd(ctx, s.nodeStateIndexKey(record.NodePoolID, record.State), record.PodName)
	}

	if prevState != "" && prevState != record.State {
		pipe.SRem(ctx, s.stateIndexKey(prevState), record.PodName)
	}
	if prevNodePool != "" && (prevNodePool != record.NodePoolID || prevState != record.State) {
		if prevState != "" {
			pipe.SRem(ctx, s.nodeStateIndexKey(prevNodePool, prevState), record.PodName)
		}
	}

	if _, err := pipe.Exec(ctx); err != nil {
		return fmt.Errorf("upsert runner state pipeline: %w", err)
	}
	return nil
}

func (s *redisRunnerStateStore) DeleteRunner(ctx context.Context, podName string) error {
	if !s.Enabled() || podName == "" {
		return nil
	}

	prev, err := s.client.HGetAll(ctx, s.runnerKey(podName)).Result()
	if err != nil && err != redis.Nil {
		return fmt.Errorf("hgetall runner state for delete: %w", err)
	}
	prevState := RunnerLifecycleState(prev["state"])
	prevNodePool := prev["node_pool"]

	pipe := s.client.TxPipeline()
	if prevState != "" {
		pipe.SRem(ctx, s.stateIndexKey(prevState), podName)
	}
	if prevState != "" && prevNodePool != "" {
		pipe.SRem(ctx, s.nodeStateIndexKey(prevNodePool, prevState), podName)
	}
	pipe.Del(ctx, s.runnerKey(podName))

	if _, err := pipe.Exec(ctx); err != nil {
		return fmt.Errorf("delete runner state pipeline: %w", err)
	}
	return nil
}

func (s *redisRunnerStateStore) GetClusterSnapshot(
	ctx context.Context,
	nodePools []RunnerNodePool,
) (*RunnerClusterSnapshot, error) {
	if !s.Enabled() {
		return &RunnerClusterSnapshot{NodePoolCounts: map[string]RunnerNodePoolSnapshot{}}, nil
	}

	pipe := s.client.Pipeline()
	totalIdleCmd := pipe.SCard(ctx, s.stateIndexKey(RunnerStateIdle))
	totalLeasedCmd := pipe.SCard(ctx, s.stateIndexKey(RunnerStateLeased))
	totalProvisioningCmd := pipe.SCard(ctx, s.stateIndexKey(RunnerStateProvisioning))
	totalReservedCmd := pipe.Get(ctx, s.provisioningReservedTotalKey())
	reservedByNodeCmd := pipe.HGetAll(ctx, s.provisioningReservedByNodeKey())

	type nodeCmds struct {
		idle         *redis.IntCmd
		leased       *redis.IntCmd
		provisioning *redis.IntCmd
	}
	nodeQueries := make(map[string]nodeCmds, len(nodePools))
	for _, pool := range nodePools {
		nodeQueries[pool.NodePoolID] = nodeCmds{
			idle:         pipe.SCard(ctx, s.nodeStateIndexKey(pool.NodePoolID, RunnerStateIdle)),
			leased:       pipe.SCard(ctx, s.nodeStateIndexKey(pool.NodePoolID, RunnerStateLeased)),
			provisioning: pipe.SCard(ctx, s.nodeStateIndexKey(pool.NodePoolID, RunnerStateProvisioning)),
		}
	}

	if _, err := pipe.Exec(ctx); err != nil && err != redis.Nil {
		return nil, fmt.Errorf("cluster snapshot pipeline: %w", err)
	}

	snapshot := &RunnerClusterSnapshot{
		TotalIdle:         totalIdleCmd.Val(),
		TotalLeased:       totalLeasedCmd.Val(),
		TotalProvisioning: totalProvisioningCmd.Val(),
		TotalReserved:     parseRedisIntCmd(totalReservedCmd),
		NodePoolCounts:    make(map[string]RunnerNodePoolSnapshot, len(nodePools)),
	}
	reservedByNode := reservedByNodeCmd.Val()
	for nodePoolID, cmds := range nodeQueries {
		reserved := int64(0)
		if raw, ok := reservedByNode[nodePoolID]; ok {
			if parsed, err := strconv.ParseInt(raw, 10, 64); err == nil {
				reserved = parsed
			}
		}
		snapshot.NodePoolCounts[nodePoolID] = RunnerNodePoolSnapshot{
			Idle:         cmds.idle.Val(),
			Leased:       cmds.leased.Val(),
			Provisioning: cmds.provisioning.Val(),
			Reserved:     reserved,
		}
	}

	return snapshot, nil
}

func parseRedisIntCmd(cmd *redis.StringCmd) int64 {
	if cmd == nil {
		return 0
	}
	value, err := cmd.Int64()
	if err != nil {
		return 0
	}
	return value
}

func (s *redisRunnerStateStore) AcquireIdleRunnerLease(
	ctx context.Context,
	ownerPod, ownerUID string,
	ttl time.Duration,
) (*RunnerLease, error) {
	if !s.Enabled() {
		return nil, nil
	}
	if ttl <= 0 {
		ttl = 30 * time.Second
	}

	candidates, err := s.client.SMembers(ctx, s.stateIndexKey(RunnerStateIdle)).Result()
	if err != nil {
		return nil, fmt.Errorf("list idle runners: %w", err)
	}
	now := time.Now().UTC()
	for _, podName := range candidates {
		data, err := s.client.HGetAll(ctx, s.runnerKey(podName)).Result()
		if err != nil && err != redis.Nil {
			return nil, fmt.Errorf("get runner state %s: %w", podName, err)
		}
		if len(data) == 0 {
			continue
		}
		nodePool := data["node_pool"]
		token := fmt.Sprintf("%s-%d", ownerPod, time.Now().UnixNano())
		expireAt := now.Add(ttl)
		keys := []string{
			s.runnerKey(podName),
			s.runnerLeaseKey(podName),
			s.stateIndexKey(RunnerStateIdle),
			s.stateIndexKey(RunnerStateLeased),
			"",
			"",
		}
		if nodePool != "" {
			keys[4] = s.nodeStateIndexKey(nodePool, RunnerStateIdle)
			keys[5] = s.nodeStateIndexKey(nodePool, RunnerStateLeased)
		}

		res, err := acquireRunnerLeaseScript.Run(ctx, s.client, keys,
			string(RunnerStateIdle),
			string(RunnerStateLeased),
			ownerPod,
			ownerUID,
			token,
			ttl.Milliseconds(),
			expireAt.Format(time.RFC3339Nano),
			now.Format(time.RFC3339Nano),
			podName,
		).Int()
		if err != nil {
			return nil, fmt.Errorf("acquire lease script for %s: %w", podName, err)
		}
		if res != 1 {
			continue
		}

		return &RunnerLease{
			LeaseToken: token,
			Record: RunnerStateRecord{
				PodName:     podName,
				NodePoolID:  nodePool,
				PodIP:       data["pod_ip"],
				State:       RunnerStateLeased,
				OwnerPod:    ownerPod,
				OwnerPodUID: ownerUID,
				LeaseToken:  token,
				UpdatedAt:   now,
			},
		}, nil
	}

	return nil, nil
}

func (s *redisRunnerStateStore) ReleaseRunnerLease(
	ctx context.Context,
	podName, leaseToken string,
	nextState RunnerLifecycleState,
) (bool, error) {
	if !s.Enabled() || podName == "" || leaseToken == "" || nextState == "" {
		return false, nil
	}

	data, err := s.client.HGetAll(ctx, s.runnerKey(podName)).Result()
	if err != nil && err != redis.Nil {
		return false, fmt.Errorf("get runner state %s before release: %w", podName, err)
	}
	if len(data) == 0 {
		return false, nil
	}

	nodePool := data["node_pool"]
	keys := []string{
		s.runnerKey(podName),
		s.runnerLeaseKey(podName),
		s.stateIndexKey(RunnerStateLeased),
		s.stateIndexKey(nextState),
		"",
		"",
	}
	if nodePool != "" {
		keys[4] = s.nodeStateIndexKey(nodePool, nextState)
		keys[5] = s.nodeStateIndexKey(nodePool, RunnerStateLeased)
	}

	res, err := releaseRunnerLeaseScript.Run(ctx, s.client, keys,
		string(RunnerStateLeased),
		leaseToken,
		string(nextState),
		time.Now().UTC().Format(time.RFC3339Nano),
		podName,
	).Int()
	if err != nil {
		return false, fmt.Errorf("release lease script for %s: %w", podName, err)
	}
	return res == 1, nil
}

func (s *redisRunnerStateStore) TryReserveProvisioningSlot(
	ctx context.Context,
	targetPoolSize int,
	nodePoolID string,
	nodePoolCap int,
) (bool, error) {
	if !s.Enabled() || nodePoolID == "" || nodePoolCap < 1 {
		return false, nil
	}

	keys := []string{
		s.stateIndexKey(RunnerStateIdle),
		s.stateIndexKey(RunnerStateLeased),
		s.stateIndexKey(RunnerStateProvisioning),
		s.provisioningReservedTotalKey(),
		s.provisioningReservedByNodeKey(),
		s.nodeStateIndexKey(nodePoolID, RunnerStateIdle),
		s.nodeStateIndexKey(nodePoolID, RunnerStateLeased),
		s.nodeStateIndexKey(nodePoolID, RunnerStateProvisioning),
	}
	res, err := reserveProvisioningSlotScript.Run(
		ctx,
		s.client,
		keys,
		targetPoolSize,
		nodePoolID,
		nodePoolCap,
	).Int()
	if err != nil {
		return false, fmt.Errorf("reserve provisioning slot script (%s): %w", nodePoolID, err)
	}
	return res == 1, nil
}

func (s *redisRunnerStateStore) ReleaseProvisioningSlotReservation(ctx context.Context, nodePoolID string) error {
	if !s.Enabled() || nodePoolID == "" {
		return nil
	}

	_, err := releaseProvisioningSlotScript.Run(
		ctx,
		s.client,
		[]string{
			s.provisioningReservedTotalKey(),
			s.provisioningReservedByNodeKey(),
		},
		nodePoolID,
	).Int()
	if err != nil {
		return fmt.Errorf("release provisioning reservation (%s): %w", nodePoolID, err)
	}
	return nil
}

func (s *redisRunnerStateStore) ListRunnersByStates(
	ctx context.Context,
	states ...RunnerLifecycleState,
) ([]RunnerStateRecord, error) {
	if !s.Enabled() || len(states) == 0 {
		return nil, nil
	}

	keySet := make(map[string]struct{})
	for _, state := range states {
		if state == "" {
			continue
		}
		members, err := s.client.SMembers(ctx, s.stateIndexKey(state)).Result()
		if err != nil && err != redis.Nil {
			return nil, fmt.Errorf("list state index %s: %w", state, err)
		}
		for _, name := range members {
			keySet[name] = struct{}{}
		}
	}
	if len(keySet) == 0 {
		return nil, nil
	}

	names := make([]string, 0, len(keySet))
	for name := range keySet {
		names = append(names, name)
	}
	pipe := s.client.Pipeline()
	cmds := make([]*redis.MapStringStringCmd, 0, len(names))
	for _, name := range names {
		cmds = append(cmds, pipe.HGetAll(ctx, s.runnerKey(name)))
	}
	if _, err := pipe.Exec(ctx); err != nil && err != redis.Nil {
		return nil, fmt.Errorf("list runner states pipeline: %w", err)
	}

	records := make([]RunnerStateRecord, 0, len(names))
	for _, cmd := range cmds {
		data := cmd.Val()
		if len(data) == 0 {
			continue
		}
		record := RunnerStateRecord{
			PodName:     data["pod_name"],
			NodePoolID:  data["node_pool"],
			PodIP:       data["pod_ip"],
			State:       RunnerLifecycleState(data["state"]),
			OwnerPod:    data["owner_pod"],
			OwnerPodUID: data["owner_uid"],
			LeaseToken:  data["lease_token"],
		}
		if record.PodName == "" {
			continue
		}
		if raw := data["updated_at"]; raw != "" {
			if parsed, err := time.Parse(time.RFC3339Nano, raw); err == nil {
				record.UpdatedAt = parsed
			}
		}
		records = append(records, record)
	}

	return records, nil
}

func (s *redisRunnerStateStore) HasRunnerLease(ctx context.Context, podName string) (bool, error) {
	if !s.Enabled() || podName == "" {
		return false, nil
	}

	n, err := s.client.Exists(ctx, s.runnerLeaseKey(podName)).Result()
	if err != nil {
		return false, fmt.Errorf("check runner lease key %s: %w", podName, err)
	}
	return n > 0, nil
}
