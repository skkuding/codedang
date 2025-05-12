import time
import sys

# --- 설정값 ---
# 할당할 메모리 (MB 단위)
memory_to_allocate_mb = 512
# 메모리를 유지할 시간 (초 단위)
hold_time_seconds = 3
# ---------------

memory_to_allocate_bytes = memory_to_allocate_mb * 1024 * 1024
allocated_memory = None

print(f"Attempting to allocate approximately {memory_to_allocate_mb} MB of memory...")

try:
    # bytearray를 사용하여 메모리 할당 시도
    # 매우 큰 할당은 MemoryError를 발생시킬 수 있음
    allocated_memory = bytearray(memory_to_allocate_bytes)
    print(f"Successfully allocated memory. Holding for {hold_time_seconds} seconds...")

    # 지정된 시간 동안 대기
    time.sleep(hold_time_seconds)

    print(f"Finished holding memory for {hold_time_seconds} seconds. Releasing memory.")

except MemoryError:
    print(
        f"Failed to allocate {memory_to_allocate_mb} MB. MemoryError occurred.",
        file=sys.stderr,
    )
    # Python에서는 할당 실패 시 객체가 생성되지 않으므로 별도 해제 불필요
except KeyboardInterrupt:
    print("\nMemory holding was interrupted by user.", file=sys.stderr)
finally:
    # allocated_memory 참조를 제거 (Python GC가 처리하도록 유도)
    # del allocated_memory # 명시적으로 삭제할 수도 있음
    print("Memory reference cleared (if allocated). Program exiting.")

# 프로그램 종료 시 allocated_memory가 None이 아니면 GC에 의해 메모리가 회수됨
