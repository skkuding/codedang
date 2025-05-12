import heapq
import sys

def main():
    # Input and initialization
    m = int(input())
    INF = 10**9 + 7
    g = [[] for _ in range(100010)]
    
    for i in range(m):
        u, v = map(int, input().split())
        g[u].append((v, i))
        g[v].append((u, i))
    
    # Distance array and priority queue
    dist = [INF] * 100010
    pq = []
    
    for i in range(100010):
        dist[i] = i + 101010
        heapq.heappush(pq, (dist[i], i))
    
    while pq:
        d, node = heapq.heappop(pq)
        
        if dist[node] != d:
            continue
        
        for nt, w in g[node]:
            nd = d + w
            if nd < dist[nt]:
                dist[nt] = nd
                heapq.heappush(pq, (nd, nt))
    
    # XOR sum
    xsum = 0
    for i in range(100010):
        xsum ^= dist[i]
    
    # Output the result
    print(xsum)

if __name__ == "__main__":
    main()
