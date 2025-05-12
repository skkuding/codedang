#include <stdio.h>

// 파일 내용을 읽어 출력하는 함수 (이전과 동일)
void read_file(const char *path)
{
  FILE *fp = fopen(path, "r"); // 읽기 모드('r')로 엽니다.
  if (fp)
  {
    char buf[256];
    printf("[+] Opened %s successfully\n", path); // 성공 메시지
    // 파일 끝까지 한 줄씩 읽어 출력합니다.
    while (fgets(buf, sizeof(buf), fp))
    {
      printf("  %s", buf); // 파일 내용 출력 (앞에 공백 추가)
    }
    fclose(fp);
    printf("[+] Finished reading %s\n", path); // 완료 메시지
  }
  else
  {
    // fopen 실패 시 오류 메시지 출력 (perror 대신 간단한 출력 사용)
    printf("[-] Failed to open %s (permission denied or file not found?)\n", path);
  }
}

int main()
{
  // 읽기를 시도할 중요/민감 파일 경로 목록 (문자열 배열)
  const char *sensitive_files[] = {
      "/etc/passwd",         // 사용자 계정 정보
      "/etc/shadow",         // 암호화된 패스워드 정보 (보통 root만 읽기 가능)
      "/etc/hosts",          // 호스트 이름-IP 매핑
      "/etc/resolv.conf",    // DNS 설정
      "/proc/version",       // 커널 버전 정보
      "/proc/cpuinfo",       // CPU 정보
      "/proc/meminfo",       // 메모리 정보
      "/proc/mounts",        // 마운트된 파일시스템 정보
      "/proc/net/tcp",       // 활성 TCP 연결 정보
      "/proc/self/environ",  // 현재 프로세스의 환경 변수
      "/root/.bash_history", // root 사용자의 명령어 기록 (root 권한 필요)
      "/root/.ssh/id_rsa",   // root 사용자의 SSH 비공개 키 (존재한다면 매우 민감, root 권한 필요)
      // 필요에 따라 다른 경로 추가 가능
      "/var/log/syslog", // 시스템 로그 (권한 필요)
      "/etc/os-release"  // OS 정보
  };

  // 배열의 크기를 계산합니다.
  int num_files = sizeof(sensitive_files) / sizeof(sensitive_files[0]);

  printf("Attempting to read %d sensitive files...\n", num_files);
  printf("-----------------------------------------\n");

  // for 루프를 사용하여 배열의 각 파일 경로에 대해 read_file 함수를 호출합니다.
  for (int i = 0; i < num_files; i++)
  {
    read_file(sensitive_files[i]);
    printf("-----------------------------------------\n");
  }

  printf("Finished attempting to read files.\n");

  return 0;
}