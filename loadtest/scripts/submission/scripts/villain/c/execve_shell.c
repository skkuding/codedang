#include <unistd.h>
#include <stdio.h>

int main()
{
  // 시스템 셸(/bin/sh)을 현재 프로세스 대신 실행하려고 시도합니다.
  // 성공하면 현재 프로그램은 /bin/sh로 대체됩니다.
  char *args[] = {"/bin/sh", NULL};
  char *envp[] = {NULL};

  printf("Attempting to execute /bin/sh via execve()...\\n");
  // 이 함수는 성공 시 반환하지 않습니다.
  execve("/bin/sh", args, envp);

  // execve가 실패해야 이 코드가 실행됩니다 (샌드박스에서 예상되는 동작).
  perror("execve failed (as expected in sandbox)");
  return 1;
}