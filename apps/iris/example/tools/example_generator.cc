#include "testlib.h"
#include <bits/stdc++.h>

using namespace std;

int main(int argc, char* argv[]) {
    registerGen(argc, argv, 1);
    int n = atoi(argv[1]);
    int t = atoi(argv[2]);
    cout << rnd.wnext(1, n, t) << ' ' << n << endl;
}
