#include <cstdlib>
#include <cstring>
int main() {
    // allocate memory in 1MB chunks until memory limit kills this
    while (true) {
        char* block = (char*)malloc(1024 * 1024);
        if (block) memset(block, 'A', 1024 * 1024);
    }
    return 0;
}
