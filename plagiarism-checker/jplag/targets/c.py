def solution(s):
  answer = len(s)

  for step in range(1, len(s) // 2 + 1):
    compressed = ''
    prev = s[0:step]
    count = 1

    for j in range(step, len(s), step):
      if prev == s[j: j + step]:
        count += 1
      else:
        if count >= 2:
          compressed += str(count) + prev
          prev = s[j: j + step]
          count = 1
        else:
          compressed += prev
          prev = s[j: j + step]
          count = 1  # count 초기화

      if count >= 2:
        compressed += str(count) + prev
      else:
        compressed += prev

      answer = min(answer, len(compressed))

    return answer
