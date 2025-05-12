#include <unistd.h>
#include <stdio.h>
#include <sys/types.h>

int main()
{
  // 무한 루프를 돌면서 계속 자식 프로세스를 생성합니다.
  // 시스템의 프로세스 생성 제한(RLIMIT_NPROC)이나 샌드박스의 제한에 걸리지 않으면
  // 시스템 자원을 빠르게 고갈시켜 시스템 전체를 마비시킬 수 있습니다.
  // *** 매우 위험하므로 절대로 일반 환경에서 실행하지 마십시오. ***
  printf("Attempting fork bomb... This is dangerous!\\n");
  while (1)
  {
    pid_t pid = fork();
    if (pid == -1)
    {
      // fork 실패 (자원 부족 또는 제한 초과 - 샌드박스에서 발생해야 함)
      perror("fork failed (hopefully due to limits)");
      // 실패 시 루프를 중단하거나 잠시 대기할 수 있습니다.
      sleep(1);
    }
    else if (pid == 0)
    {
      // 자식 프로세스 (특별한 작업 없이 부모와 동일하게 fork 루프 실행)
      printf("Child process created, continuing fork loop.\\n");
    }
    else
    {
      // 부모 프로세스 (특별한 작업 없이 계속 fork 루프 실행)
      printf("Parent process continues fork loop.\\n");
    }
  }
  // 이론상 도달 불가능
  return 0;
}