#include <iostream>

int main() {
    int* ptr = new int; // int 타입 메모리 동적 할당
    *ptr = 123;         // 할당된 메모리에 값 쓰기

    std::cout << "Value before delete: " << *ptr << " (Address: " << ptr << ")" << std::endl;

    delete ptr; // 메모리 해제

    std::cout << "Memory freed." << std::endl;

    // *** 해제된 메모리에 접근 시도 (Use After Free) ***
    // 이 시점에서 ptr은 댕글링 포인터가 됩니다.
    // 아래 코드는 정의되지 않은 동작(undefined behavior)을 유발합니다.
    // 충돌하거나, 쓰레기 값을 읽거나, 운 좋게(?) 이전 값이 남아있을 수도 있습니다.
    try {
         std::cout << "Attempting to access value after free (Use After Free): " << *ptr << std::endl;
         // 해제된 메모리에 쓰기 시도 (더 위험)
         // *ptr = 456;
         // std::cout << "Attempting to write after free completed." << std::endl;
    } catch (...) {
         std::cerr << "Caught an exception trying to access freed memory (OS dependent behavior)." << std::endl;
    }

     // 포인터 자체는 여전히 이전 주소를 가지고 있을 수 있음
     std::cout << "Dangling pointer address: " << ptr << std::endl;
     // 안전을 위해 해제 후 포인터를 nullptr로 설정하는 것이 좋음
     // ptr = nullptr;

    std::cout << "Program finished (or crashed before this)." << std::endl;

    return 0;
}