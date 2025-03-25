'use client'

import type { Language } from '@/types/type'
import { Terminal } from '@xterm/xterm'
import { useState } from 'react'

const CONNECTION_TIME_LIMIT = 130

export enum RunnerMessageType {
  INPUT = 'input',
  CODE = 'code',
  COMPILE_SUCCESS = 'compile_success',
  COMPILE_ERR = 'compile_error',
  ECHO = 'echo',
  STDOUT = 'stdout',
  STDERR = 'stderr',
  EXIT = 'exit'
}

interface RunnerMessage {
  type: RunnerMessageType
  language: Language
  filename: string
  source: string
  compile_cmd: string | undefined
  command: string
}

const getCodeConfig = (language: Language) => {
  let filename, compileCmd, command

  switch (language) {
    case 'C':
      filename = 'main.c'
      compileCmd = 'gcc main.c -o main'
      command = './main'
      break
    case 'Cpp':
      filename = 'main.cpp'
      compileCmd = 'g++ main.cpp -o main'
      command = './main'
      break
    case 'Java':
      filename = 'Main.java'
      compileCmd = 'javac Main.java'
      command = 'java Main'
      break
    case 'Python3':
      filename = 'main.py'
      compileCmd = undefined
      command = 'python main.py'
      break
  }

  return { filename, compileCmd, command }
}

const compileMessageGenerator = (
  source: string,
  language: Language
): RunnerMessage => {
  const { filename, compileCmd, command } = getCodeConfig(language)
  return {
    type: RunnerMessageType.CODE,
    language,
    filename,
    command,
    compile_cmd: compileCmd,
    source
  }
}

const useWebsocket = (terminal: Terminal) => {
  const ws = new WebSocket('ws://codedang-runner.my/run')

  terminal.writeln('[시스템] 실행 서버 연결중...')

  terminal.onData((data) => {
    if (data === '\r' || data === '\n') {
      terminal.write('\r\n')
    }
    if (ws && ws.readyState === WebSocket.OPEN) {
      const inputMsg = {
        type: 'input',
        data
      }
      ws.send(JSON.stringify(inputMsg))
    }
  })

  ws.onopen = () => {
    terminal.writeln('[시스템] 실행 서버 연결 성공\n')
    terminal.focus()

    const testCode =
      '#include <stdio.h>\n\nint main() {\n    int a, b;\n    scanf("%d%d", &a, &b);\n    printf("%d\\n", a + b);\n    return 0;\n}\n'

    const compileMsg = compileMessageGenerator(testCode, 'C')
    ws.send(JSON.stringify(compileMsg))
  }

  ws.onclose = () => {
    terminal.writeln('\n[시스템] 실행 서버 연결 종료....')
  }

  ws.onerror = () => {
    terminal.writeln('[시스템] 에러 발생으로 연결 끊김')
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      const msgType = data.type

      if (msgType === RunnerMessageType.COMPILE_SUCCESS) {
        return
      }

      if (msgType === RunnerMessageType.STDERR) {
        terminal.writeln(data.stderr)
      }

      if (msgType === RunnerMessageType.ECHO) {
        terminal.write(data.data || '')
      }

      if (msgType === RunnerMessageType.STDOUT) {
        terminal.write(data.data || '')
      }

      if (msgType === RunnerMessageType.STDERR) {
        terminal.write(data.data || '')
      }

      if (msgType === RunnerMessageType.EXIT) {
        terminal.writeln(
          `\n[시스템] 프로그램 종료 exit code: ${data.return_code}`
        )
      }
    } catch (e) {
      terminal.writeln(`[에러] ${e}`)
    }
  }

  return { ws }
}

export const useRunner = () => {
  const [terminal, setTerminal] = useState<Terminal | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [remainingTime, setRemainingTime] = useState<number>(
    CONNECTION_TIME_LIMIT
  )

  const startRunner = () => {
    if (ws) {
      ws.close()
    }

    const newTerminal = new Terminal({
      convertEol: true,
      disableStdin: false,
      cursorBlink: true
    })

    setTerminal(newTerminal)

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { ws: newWs } = useWebsocket(newTerminal)
    setWs(newWs)

    let timeLeft = CONNECTION_TIME_LIMIT
    setRemainingTime(timeLeft)

    const timerId = setInterval(() => {
      timeLeft -= 1
      setRemainingTime(timeLeft)
      if (timeLeft <= 0) {
        clearInterval(timerId)

        if (ws) {
          ws.close()
          clearInterval(timerId)
          setRemainingTime(CONNECTION_TIME_LIMIT)
        }
      }
    }, 1000)
  }

  return { terminal, startRunner, remainingTime }
}
