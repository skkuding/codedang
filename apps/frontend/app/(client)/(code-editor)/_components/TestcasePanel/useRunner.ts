'use client'

import { runnerBaseUrl, runnerConnectionTimeLimit } from '@/libs/constants'
import {
  RunnerMessageType,
  type Language,
  type RunnerMessage
} from '@/types/type'
import { Terminal } from '@xterm/xterm'
import { useState } from 'react'

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

const useWebsocket = (
  terminal: Terminal,
  source: string,
  language: Language
) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const ws = new WebSocket(runnerBaseUrl!)

  terminal.writeln('[SYS] 실행 서버 연결중...')
  terminal.onData((data) => {
    if (data === '\r' || data === '\n') {
      terminal.write('\r\n')
    }
    if (ws && ws.readyState === WebSocket.OPEN) {
      const inputMsg = {
        type: RunnerMessageType.INPUT,
        data
      }
      ws.send(JSON.stringify(inputMsg))
    }
  })

  ws.onopen = () => {
    terminal.writeln('[SYS] 실행 서버 연결 성공\n')
    terminal.focus()

    const compileMsg = compileMessageGenerator(source, language)
    ws.send(JSON.stringify(compileMsg))
  }

  ws.onclose = () => {
    terminal.writeln('\n[SYS] 실행 서버 연결 종료.....')
  }

  ws.onerror = () => {
    terminal.writeln('[SYS] 에러 발생으로 연결 끊김')
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      const msgType = data.type

      switch (msgType) {
        case RunnerMessageType.COMPILE_ERR:
          terminal.writeln(data.stderr)
          break
        case RunnerMessageType.ECHO:
        case RunnerMessageType.STDOUT:
        case RunnerMessageType.STDERR:
          terminal.write(data.data || '')
          break
        case RunnerMessageType.EXIT:
          terminal.writeln(
            `\n\n[SYS] Process ended with exit code: ${data.return_code}`
          )
          break
        default:
          return
      }
    } catch (e) {
      terminal.writeln(`[Error] ${e}`)
    }
  }

  return { ws }
}

export const useRunner = () => {
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [terminalInstance, setTerminalInstance] = useState<Terminal | null>(
    null
  )

  const startRunner = (code: string, language: Language) => {
    if (ws) {
      ws.close()
      setWs(null)
    }

    if (timer) {
      clearInterval(timer)
      setTimer(null)
    }

    if (terminalInstance) {
      terminalInstance.dispose()
      setTerminalInstance(null)
    }

    const element = document.getElementById('runner-container')

    if (element) {
      element.innerHTML = ''

      const terminal = new Terminal({
        convertEol: true,
        disableStdin: false,
        cursorBlink: true
      })

      terminal.open(element)
      terminal.focus()

      // eslint-disable-next-line react-hooks/rules-of-hooks
      const { ws: newWs } = useWebsocket(terminal, code, language)
      setWs(newWs)

      let timeLeft = runnerConnectionTimeLimit
      const timerId = setInterval(() => {
        timeLeft -= 1
        if (timeLeft <= 0) {
          clearInterval(timerId)
          if (ws) {
            ws.close()
            setWs(null)
          }
        }
      }, 1000)
      setTimer(timerId)
      setTerminalInstance(terminal)
    }
  }

  return { startRunner }
}
