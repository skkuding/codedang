#include <iostream>
#include <cstring> // strcpy 사용을 위해 필요

int main() {
    char small_buffer[10]; // 10바이트 크기의 버퍼
    // 버퍼 크기(10)보다 훨씬 큰 문자열
    const char* large_input = "This string is definitely larger than the buffer!";

    std::cout << "Attempting buffer overflow..." << std::endl;

    // strcpy는 경계 검사를 하지 않으므로 버퍼 오버플로우 발생
    // *** 매우 위험: 실제 환경에서는 절대 사용하지 마십시오 ***
    strcpy(small_buffer, large_input);

    // 오버플로우 후 버퍼 내용 출력 (예측 불가능한 결과 또는 충돌 발생 가능)
    std::cout << "Buffer content after overflow (unpredictable): " << small_buffer << std::endl;

    std::cout << "If the program didn't crash, overflow likely occurred." << std::endl;

    return 0;
}