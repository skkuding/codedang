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
  let currentInputBuffer = ''
  let cursorPosition = 0
  let isWaitingForServerResponse = false
  // eslint-disable-next-line prefer-const
  let inputQueue: string[] = []

  terminal.writeln('[SYS] 실행 서버 연결중...')

  const processLine = (line: string) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      isWaitingForServerResponse = true
      const inputMsg = {
        type: RunnerMessageType.INPUT,
        data: `${line}\r\n`
      }
      ws.send(JSON.stringify(inputMsg))
      currentInputBuffer = ''
      cursorPosition = 0
    }
  }

  const processNextQueuedInput = () => {
    if (inputQueue.length > 0 && !isWaitingForServerResponse) {
      const nextLine = inputQueue.shift()
      if (nextLine !== undefined) {
        processLine(nextLine)
      }
    }
  }

  terminal.onData((data) => {
    if (isWaitingForServerResponse) {
      // 서버 응답을 기다리는 중이면 입력을 큐에 넣음
      if (data.includes('\r') || data.includes('\n')) {
        const lines = data.split(/\r\n|\r|\n/)
        inputQueue.push(...lines.filter((line) => line.length > 0))
      }
      return
    }

    // 줄바꿈이 있는 텍스트가, 복사 붙여넣기 되었을 경우
    if (data.includes('\r') || data.includes('\n')) {
      const lines = data.split(/\r\n|\r|\n/)

      // 첫 번째 줄은 현재 입력 버퍼에 추가
      if (lines[0]) {
        currentInputBuffer += lines[0]
        terminal.write(lines[0])
      }

      // Enter 키 처리
      terminal.write('\r\n')
      processLine(currentInputBuffer)

      // 나머지 줄들은 큐에 추가
      if (lines.length > 1) {
        inputQueue.push(...lines.slice(1).filter((line) => line.length > 0))
      }
      return
    }

    // 백스페이스 처리
    if (data === '\b' || data === '\x7f') {
      if (cursorPosition > 0) {
        currentInputBuffer =
          currentInputBuffer.substring(0, cursorPosition - 1) +
          currentInputBuffer.substring(cursorPosition)
        cursorPosition--

        // 화면에서 글자 지우기
        terminal.write('\b \b')
      }
      return
    }

    // 왼쪽 화살표 키 처리
    if (data === '\x1b[D') {
      if (cursorPosition > 0) {
        cursorPosition--
        terminal.write(data)
      }
      return
    }

    // 오른쪽 화살표 키 처리
    if (data === '\x1b[C') {
      if (cursorPosition < currentInputBuffer.length) {
        cursorPosition++
        terminal.write(data)
      }
      return
    }

    // 일반 텍스트 입력 처리
    currentInputBuffer =
      currentInputBuffer.substring(0, cursorPosition) +
      data +
      currentInputBuffer.substring(cursorPosition)
    cursorPosition += data.length
    terminal.write(data)
  })

  ws.onopen = () => {
    terminal.writeln('[SYS] 실행 서버 연결 성공\n')
    terminal.focus()

    const compileMsg = compileMessageGenerator(source, language)
    ws.send(JSON.stringify(compileMsg))
  }

  ws.onclose = () => {
    terminal.writeln('\n[SYS] 실행 서버 연결 종료.....')
    isWaitingForServerResponse = false
  }

  ws.onerror = () => {
    terminal.writeln('[SYS] 에러 발생으로 연결 끊김')
    isWaitingForServerResponse = false
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

      // 서버 응답을 받으면 다음 입력 처리
      if (
        msgType === RunnerMessageType.STDOUT ||
        msgType === RunnerMessageType.STDERR ||
        msgType === RunnerMessageType.ECHO
      ) {
        isWaitingForServerResponse = false
        processNextQueuedInput()
      }
    } catch (e) {
      terminal.writeln(`[Error] ${e}`)
      isWaitingForServerResponse = false
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
