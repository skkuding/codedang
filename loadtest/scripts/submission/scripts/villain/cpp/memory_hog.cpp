#include <iostream>
#include <vector>       // std::vector 사용
#include <chrono>       // 시간 관련 기능 사용
#include <thread>       // std::this_thread::sleep_for 사용
#include <new>          // std::bad_alloc 사용
#include <cstdint>      // uint64_t 사용

int main() {
    // --- 설정값 ---
    // 할당할 메모리 (MB 단위)
    const int memory_to_allocate_mb = 512;
    // 메모리를 유지할 시간 (초 단위)
    const int hold_time_seconds = 3;
    // ---------------

    // C++에서는 size_t를 사용하는 것이 일반적
    const size_t memory_to_allocate_bytes = static_cast<size_t>(memory_to_allocate_mb) * 1024 * 1024;
    std::vector<char> memory_chunk; // 메모리를 담을 벡터

    std::cout << "Attempting to allocate approximately " << memory_to_allocate_mb << " MB of memory..." << std::endl;

    try {
        // 벡터의 크기를 조절하여 메모리 할당 시도
        // resize는 내부적으로 메모리를 할당하며, 실패 시 bad_alloc 예외 발생
        memory_chunk.resize(memory_to_allocate_bytes);

        std::cout << "Successfully allocated memory. Holding for " << hold_time_seconds << " seconds..." << std::endl;

        // 지정된 시간 동안 대기
        std::this_thread::sleep_for(std::chrono::seconds(hold_time_seconds));

        std::cout << "Finished holding memory for " << hold_time_seconds << " seconds. Releasing memory." << std::endl;

    } catch (const std::bad_alloc& e) {
        // 메모리 할당 실패 시 예외 처리
        std::cerr << "Failed to allocate " << memory_to_allocate_mb << " MB. std::bad_alloc occurred: " << e.what() << std::endl;
    } catch (...) {
        // 기타 예외 처리 (예: sleep 중 인터럽트 - C++ 표준에는 sleep 인터럽트 없음)
        std::cerr << "An unexpected error occurred." << std::endl;
    }

    // try 블록을 벗어나면 memory_chunk 벡터의 소멸자가 자동으로 호출되어
    // 할당된 메모리가 해제됨 (RAII 패턴)
    std::cout << "Memory will be released by vector destructor. Program exiting." << std::endl;

    return 0;
}