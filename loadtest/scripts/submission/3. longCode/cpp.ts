import { sleep } from 'k6'
import http from 'k6/http'

export const options = {
  vus: 150,
  duration: '4m',
  noConnectionReuse: true
}

export default function () {
  let longCode = '#include <iostream>\n\nint main() {\n    int sum = 0;\n'
  for (let i = 0; i < 10000; i++) {
    longCode += `    sum += ${i};\n` // 10,000줄 덧셈
  }
  longCode += '    std::cout << "sum = " << sum << std::endl;\n    return 0;\n}'

  const res = http.post(
    `https://rc.codedang.com/api/submission?problemId=337`,
    JSON.stringify({
      language: 'C++',
      code: [{ id: 1, text: longCode, locked: false }]
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer 어쩌구'
      }
    }
  )
  console.log(`Status: ${res.status}`)
  sleep(1)
}
