import type { SubmissionDetail } from '@/types/type'

const dataIfError: SubmissionDetail = {
  problemId: 0,
  username: 'skkuding',
  code: `#include <stdio.h>

int main() {
char name[20];
scanf("%s", name);
printf("Hello, %s!\\n", name);
return 0;
}`,
  language: 'C',
  createTime: new Date(),
  result: 'Accepted',
  testcaseResult: Array.from({ length: 5 }, (_, i) => ({
    id: i,
    submissionId: 0,
    problemTestcaseId: i,
    result: 'Accepted',
    cpuTime: '0',
    memoryUsage: 12345,
    createTime: new Date(),
    updateTime: new Date()
  }))
}

export default dataIfError
