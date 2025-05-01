#include <stdio.h>
#include <stdlib.h>
#include <stdint.h> // uint64_t 타입을 사용하기 위해 필요

// 쓰기 작업을 위한 버퍼 크기 (예: 1MB)
// 시스템 및 디스크 성능에 따라 조절 가능
#define BUFFER_SIZE (1024 * 1024)

// 목표 파일 크기 (1TB)
#define TARGET_SIZE_BYTES (1024ULL * 1024 * 1024 * 1024) // 1 TB (ULL: unsigned long long)

int main()
{
  const char *filename = "large_file_1tb.bin";
  FILE *fp = NULL;
  char *buffer = NULL;
  uint64_t bytes_written = 0;
  size_t chunk_size = BUFFER_SIZE;
  size_t write_result;

  printf("Attempting to create a 1TB file named '%s'.\n", filename);
  printf("Ensure you have at least 1TB of free disk space.\n");

  // 1. 파일 열기 (바이너리 쓰기 모드)
  fp = fopen(filename, "wb");
  if (fp == NULL)
  {
    perror("Error opening file");
    return 1;
  }

  // 2. 쓰기 버퍼 할당
  buffer = (char *)malloc(BUFFER_SIZE);
  if (buffer == NULL)
  {
    perror("Error allocating buffer memory");
    fclose(fp);
    return 1;
  }

  // 버퍼를 0으로 채움 (또는 다른 데이터로 채울 수 있음)
  // memset(buffer, 0, BUFFER_SIZE); // <string.h> 필요

  printf("Starting to write 1TB...\n");

  // 3. 목표 크기만큼 버퍼 내용을 반복해서 쓰기
  while (bytes_written < TARGET_SIZE_BYTES)
  {
    // 남은 바이트가 버퍼 크기보다 작으면 청크 크기 조절
    if (TARGET_SIZE_BYTES - bytes_written < BUFFER_SIZE)
    {
      chunk_size = TARGET_SIZE_BYTES - bytes_written;
    }

    // 버퍼 내용을 파일에 쓰기
    write_result = fwrite(buffer, 1, chunk_size, fp);

    if (write_result != chunk_size)
    {
      // 쓰기 오류 처리 (예: 디스크 공간 부족)
      if (ferror(fp))
      {
        perror("Error writing to file");
      }
      else
      {
        fprintf(stderr, "Error writing to file: Unexpected end of file or other error.\n");
      }
      free(buffer);
      fclose(fp);
      return 1;
    }

    bytes_written += write_result;

    // 진행 상황 출력 (선택 사항, 너무 자주 출력하면 성능 저하 가능)
    if ((bytes_written / (1024 * 1024)) % 1024 == 0)
    { // 약 1GB 마다 출력
      printf("Written: %llu GB\n", bytes_written / (1024 * 1024 * 1024));
    }
  }

  printf("Successfully wrote %llu bytes (1TB) to '%s'.\n", bytes_written, filename);

  // 4. 리소스 정리
  free(buffer);
  fclose(fp);

  return 0;
}