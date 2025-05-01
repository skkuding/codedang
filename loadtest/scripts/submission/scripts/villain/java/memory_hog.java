import java.util.ArrayList;
import java.util.List;

public class Main {

    public static void main(String[] args) {
        // --- 설정값 ---
        // 할당할 메모리 (MB 단위)
        int memoryToAllocateMB = 512;
        // 메모리를 유지할 시간 (초 단위)
        int holdTimeSeconds = 3;
        // ---------------

        long memoryToAllocateBytes = (long)memoryToAllocateMB * 1024 * 1024;
        List<byte[]> memoryChunks = new ArrayList<>();

        System.out.printf("Attempting to allocate approximately %d MB of memory...%n", memoryToAllocateMB);

        try {
            // 메모리 할당 시도 (OutOfMemoryError 발생 가능)
            // 큰 배열 하나 대신 작은 배열 여러 개로 나누어 할당할 수도 있습니다.
            // 여기서는 간단하게 하나의 큰 배열을 사용합니다.
            byte[] hog = new byte[(int)memoryToAllocateBytes];
            memoryChunks.add(hog); // GC 방지를 위해 리스트에 참조 유지

            System.out.printf("Successfully allocated memory. Holding for %d seconds...%n", holdTimeSeconds);

            // 지정된 시간 동안 대기
            Thread.sleep(holdTimeSeconds * 1000L);

            System.out.printf("Finished holding memory for %d seconds. Releasing memory.%n", holdTimeSeconds);

        } catch (OutOfMemoryError e) {
            System.err.printf("Failed to allocate %d MB. OutOfMemoryError occurred.%n", memoryToAllocateMB);
            // 할당된 만큼이라도 유지하려면 여기서 sleep을 호출할 수 있습니다.
            // 하지만 일반적으로는 실패 처리합니다.
        } catch (InterruptedException e) {
            System.err.println("Memory holding was interrupted.");
            Thread.currentThread().interrupt(); // 인터럽트 상태 복원
        } finally {
            // 명시적으로 참조를 제거하여 GC가 메모리를 회수하도록 유도
            memoryChunks.clear();
            // System.gc(); // GC 호출을 강제할 수는 없지만, 요청할 수는 있습니다.
            System.out.println("Memory reference cleared. Program exiting.");
        }
    }
}