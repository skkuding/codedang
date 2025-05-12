//700 MB 사용하는 코드
#include <stdio.h>
#include <stdlib.h>

#define TARGET_MB 500
#define INT_SIZE sizeof(int)
#define MB (1024 * 1024)

int main() {
    // 700MB / sizeof(int) = 필요한 int 개수
    size_t num_ints = (TARGET_MB * MB) / INT_SIZE;

    // 메모리 동적 할당
    int* arr = (int*)malloc(num_ints * INT_SIZE);
    if (arr == NULL) {
        perror("Memory allocation failed");
        return 1;
    }

    printf("Allocated %zu ints (~%d MB)\n", num_ints, TARGET_MB);

    // 무한 루프에서 메모리 사용
    size_t i = 0;
    while (1) {
        arr[i % num_ints] = (int)i; // 순환하며 값 저장
        i++;
    }

    free(arr); // 실제로는 도달하지 않음
    return 0;
}
