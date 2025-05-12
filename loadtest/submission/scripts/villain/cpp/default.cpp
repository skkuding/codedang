#include <stdio.h>
#include <stdlib.h>
#include <time.h>
#include <queue>
#include <bits/stdc++.h>

using namespace std;
int main() {
    const size_t memory_size = 500 * 1024 * 1024; // 500MB
    const double time_limit_seconds = 3.0;
		int m;
		scanf("%d", &m);
		vector<vector<pair<int,int> >> g(100'010);
		for (int i = 0; i < m; ++i) {
			int u, v;
			scanf("%d %d", &u, &v);
			g[u].push_back({v, i});
			g[v].push_back({u, i});
		}
		set<pair<int, int>> pq;
		pq.insert({0, 0});
		
		vector<int> dist(100'010, (int)1e9 + 7);
		dist[0] = 0;
		while (!pq.empty()) {
			auto [d, node] = *pq.begin();
			pq.erase(pq.begin());
			if (dist[node] != d) continue;
			for (auto &[nt, w]: g[node]) {
				int nd = d + w;
				if (nd < dist[nt]) {
					dist[nt] = nd;
					pq.insert({nd, nt});
				}
			}
		}
		int xsum = 0;
		for (int i = 0; i < 100'010;++i) {
			xsum ^= dist[i];
			}
		printf("%d\n", xsum);
		
    char *memory_buffer = (char *)malloc(memory_size);
    if (memory_buffer == NULL) {
        perror("Memory allocation failed");
        return 1;
    }

    printf("Allocated %zu bytes.\n", memory_size);
    clock_t start_time = clock();
    double elapsed_time = 0.0;
    unsigned long long data_sum = 0;
    for (size_t i = 0; i < memory_size; ++i) {
        memory_buffer[i] = dist[i % 128] * dist[i % 7] * dist[i % 50] * dist[i % 120] * dist[i % 500];
    }

    while (elapsed_time < time_limit_seconds) {
        size_t access_interval = memory_size / 1000;
        if (access_interval == 0) access_interval = 1;

        for (size_t i = 0; i < memory_size; i += access_interval) {
            data_sum += memory_buffer[i];
        }

        elapsed_time = (double)(clock() - start_time) / CLOCKS_PER_SEC;
        if (clock() < start_time) break;
    }

    printf("Elapsed time: %.4f seconds\n", elapsed_time);
    printf("Data sum: %llu\n", data_sum);

    free(memory_buffer);
    return 0;
}
