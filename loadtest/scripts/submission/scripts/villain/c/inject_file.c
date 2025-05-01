#include <stdio.h>    // for printf, perror
#include <stdlib.h>   // for exit codes
#include <fcntl.h>    // for open() flags (O_WRONLY, O_CREAT, O_TRUNC)
#include <unistd.h>   // for open(), write(), close() system calls
#include <string.h>   // for strlen()
#include <sys/stat.h> // for mode constants (permissions)

int main()
{
  const char *filename = "output_aaa.txt"; // 생성할 파일 이름
  const char *content = "aaa";             // 파일에 쓸 내용
  int fd;                                  // 파일 디스크립터
  ssize_t bytes_written;                   // write()가 반환하는 쓰인 바이트 수

  // 1. 파일 열기 (또는 생성)
  // O_WRONLY: 쓰기 전용으로 연다.
  // O_CREAT: 파일이 없으면 새로 생성한다.
  // O_TRUNC: 파일이 존재하면 내용을 지우고 0바이트로 만든다.
  // 0644: 생성될 파일의 권한 (소유자 읽기/쓰기, 그룹 읽기, 기타 읽기)
  fd = open(filename, O_WRONLY | O_CREAT | O_TRUNC, 0644);

  // open() 실패 시 (-1 반환) 오류 처리
  if (fd == -1)
  {
    perror("Error opening file"); // 시스템 오류 메시지 출력
    return EXIT_FAILURE;          // 실패 종료 코드 반환
  }

  printf("File '%s' opened successfully (fd=%d).\\n", filename, fd);

  // 2. 파일에 내용 쓰기
  bytes_written = write(fd, content, strlen(content));

  // write() 실패 시 (-1 반환) 오류 처리
  if (bytes_written == -1)
  {
    perror("Error writing to file");
    close(fd); // 파일을 닫고 종료
    return EXIT_FAILURE;
  }

  // 실제로 쓰인 바이트 수가 예상과 다른 경우 (예: 디스크 공간 부족 등)
  if (bytes_written != strlen(content))
  {
    fprintf(stderr, "Error: Incomplete write. Wrote %zd bytes, expected %zu.\\n",
            bytes_written, strlen(content));
    close(fd);
    return EXIT_FAILURE;
  }

  printf("Successfully wrote '%s' (%zd bytes) to file.\\n", content, bytes_written);

  // 3. 파일 닫기
  if (close(fd) == -1)
  {
    perror("Error closing file");
    // 쓰기는 성공했으므로 성공으로 간주할 수도 있지만, 닫기 실패는 알림
    return EXIT_FAILURE; // 또는 EXIT_SUCCESS
  }

  printf("File '%s' closed successfully.\\n", filename);

  return EXIT_SUCCESS; // 성공 종료 코드 반환
}