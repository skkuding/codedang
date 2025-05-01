#include <stdio.h>
#include <stdlib.h>     // malloc, free 함수 사용
#include <stdint.h>     // uint64_t 사용
#include <unistd.h>     // sleep 함수 사용 (POSIX 시스템)
// #include <windows.h> // Windows의 경우 Sleep 함수 사용

int main() {
    // --- 설정값 ---
    // 할당할 메모리 (MB 단위)
    const int memory_to_allocate_mb = 512;
    // 메모리를 유지할 시간 (초 단위)
    const int hold_time_seconds = 3;
    // ---------------

    const size_t memory_to_allocate_bytes = (size_t)memory_to_allocate_mb * 1024 * 1024;
    char *allocated_memory = NULL; // 할당된 메모리를 가리킬 포인터

    printf("Attempting to allocate approximately %d MB of memory...\n", memory_to_allocate_mb);

    // malloc을 사용하여 메모리 할당 시도
    allocated_memory = (char *)malloc(memory_to_allocate_bytes);

    if (allocated_memory == NULL) {
        // 메모리 할당 실패 처리
        fprintf(stderr, "Failed to allocate %d MB. malloc returned NULL.\n", memory_to_allocate_mb);
        return 1; // 오류 코드로 종료
    }

    printf("Successfully allocated memory. Holding for %d seconds...\n", hold_time_seconds);

    // 지정된 시간 동안 대기
    // POSIX 시스템 (Linux, macOS 등)
    sleep(hold_time_seconds);
    // Windows 시스템
    // Sleep(hold_time_seconds * 1000);

    printf("Finished holding memory for %d seconds. Releasing memory.\n", hold_time_seconds);

    // 할당된 메모리 해제
    free(allocated_memory);
    allocated_memory = NULL; // 댕글링 포인터 방지 (선택 사항이지만 좋은 습관)

    printf("Memory freed. Program exiting.\n");

    return 0; // 성공 코드로 종료
}