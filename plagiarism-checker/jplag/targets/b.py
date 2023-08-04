import time as _time

###### 입력 ######
n = list(map(int, input()))
#################

_start_time = _time.time()  # 실행시간측정

###### 실행 ######
mid = len(n) // 2

left_sum = sum(n[0: mid])
right_sum = sum(n[mid:])

if left_sum == right_sum:
  print("LUCKY")
else:
  print("READY")
#################

_end_time = _time.time()  # 실행시간측정
print("실행시간:", _end_time - _start_time, "초")  # 실행시간측정
