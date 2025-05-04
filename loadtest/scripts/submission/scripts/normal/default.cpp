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
		
    return 0;
}
