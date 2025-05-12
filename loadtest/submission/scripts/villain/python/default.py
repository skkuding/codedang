import heapq
import time
import sys

sys.setrecursionlimit(10**6)

# 입력 처리
m = int(input())
g = [[] for _ in range(100010)]
for i in range(m):
    u, v = map(int, input().split())
    g[u].append((v, i))
    g[v].append((u, i))

# 다익스트라 (Set + Vector 대체: heapq 사용)
dist = [int(1e9) + 7] * 100010
dist[0] = 0
pq = [(0, 0)]  # (distance, node)

while pq:
    d, node = heapq.heappop(pq)
    if dist[node] != d:
        continue
    for nt, w in g[node]:
        nd = d + w
        if nd < dist[nt]:
            dist[nt] = nd
            heapq.heappush(pq, (nd, nt))

# XOR 합
xsum = 0
for d in dist:
    xsum ^= d
print(xsum)

# 메모리 버퍼 시뮬레이션
memory_size = 500 * 1024 * 1024  # 500MB
memory_buffer = bytearray(memory_size)
start_time = time.time()
elapsed_time = 0.0
data_sum = 0

for i in range(memory_size):
    memory_buffer[i] = (
        dist[i % 128] * dist[i % 7] * dist[i % 50] * dist[i % 120] * dist[i % 500]
    ) % 256  # byte 범위 제한

# 시간 제한 내에서 순회
while elapsed_time < 3.0:
    access_interval = memory_size // 1000 or 1
    for i in range(0, memory_size, access_interval):
        data_sum += memory_buffer[i]
    elapsed_time = time.time() - start_time

print(f"Elapsed time: {elapsed_time:.4f} seconds")
print(f"Data sum: {data_sum}")
