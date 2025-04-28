#include <stdio.h>
#include <stdlib.h>

int main()
{
  // 100MB 배열 할당 후, 임의의 값 할당하기.
  long arr_size = 100 * 1024 * 1024 / sizeof(int); // 2천..
  int *arr = (int *)malloc(arr_size * sizeof(int));
  for (long i = 0; i < arr_size; i++)
  {
    arr[i] = i % 100;
  }
  printf("allocation 512size array");

  // 2천 * 7 (1.4억 연산)
  int result = 0;
  for (int j = 0; j < 7; j++)
  {
    for (int i = 0; i < arr_size; i++)
    {
      result += (arr[i]) * (arr[i] + 1);
    }
  }
  printf("%d", result);

  // 의미없는 긴코드
  int dummy = 0;
  dummy += 1;
  dummy += 2;
  dummy += 3;
  dummy += 4;
  dummy += 5;
  dummy += 6;
  dummy += 7;
  dummy += 8;
  dummy += 9;
  dummy += 10;
  dummy += 11;
  dummy += 12;
  dummy += 13;
  dummy += 14;
  dummy += 15;
  dummy += 16;
  dummy += 17;
  dummy += 18;
  dummy += 19;
  dummy += 20;
  dummy += 21;
  dummy += 22;
  dummy += 23;
  dummy += 24;
  dummy += 25;
  dummy += 26;
  dummy += 27;
  dummy += 28;
  dummy += 29;
  dummy += 30;
  dummy += 31;
  dummy += 32;
  dummy += 33;
  dummy += 34;
  dummy += 35;
  dummy += 36;
  dummy += 37;
  dummy += 38;
  dummy += 39;
  dummy += 40;
  dummy += 41;
  dummy += 42;
  dummy += 43;
  dummy += 44;
  dummy += 45;
  dummy += 46;
  dummy += 47;
  dummy += 48;
  dummy += 49;
  dummy += 50;

  return 0;
}
