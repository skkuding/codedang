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
  let isComposing = false
  let lastComposedText = ''

  terminal.writeln('[SYS] 실행 서버 연결중...')

  function processLine(line: string) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      isWaitingForServerResponse = true
      const inputMsg = {
        type: RunnerMessageType.INPUT,
        data: `${line}\r\n`
      }
      ws.send(JSON.stringify(inputMsg))
      currentInputBuffer = ''
      cursorPosition = 0
      lastComposedText = ''
    }
  }

  function handleTextAtCursorPosition(text: string) {
    if (cursorPosition === currentInputBuffer.length) {
      // 커서가 끝에 있는 경우 단순 추가
      terminal.write(text)
      currentInputBuffer += text
      cursorPosition += text.length
    } else {
      // 커서가 중간에 있는 경우 삽입 모드 사용
      terminal.write('\x1b[4h') // 삽입 모드 활성화
      terminal.write(text)
      terminal.write('\x1b[4l') // 삽입 모드 비활성화

      // 버퍼 업데이트
      currentInputBuffer =
        currentInputBuffer.substring(0, cursorPosition) +
        text +
        currentInputBuffer.substring(cursorPosition)
      cursorPosition += text.length
    }
  }

  const handleBackspace = () => {
    if (cursorPosition === 0) {
      return
    }

    // 지울 문자 확인
    const charToDelete = currentInputBuffer[cursorPosition - 1]

    const isFullWidthCharacter = (char: string) => {
      if (!char) {
        return false
      }
      const code = char.charCodeAt(0)
      return (
        (code >= 0x1100 && code <= 0x11ff) || // 한글 자모
        (code >= 0x3130 && code <= 0x318f) || // 한글 호환 자모
        (code >= 0xac00 && code <= 0xd7a3) || // 한글 음절
        (code >= 0xff01 && code <= 0xff60) || // 전각 구두점
        (code >= 0xffe0 && code <= 0xffe6) // 전각 기호
      )
    }
    const isFullWidth = isFullWidthCharacter(charToDelete)

    if (cursorPosition === currentInputBuffer.length) {
      // 커서가 끝에 있는 경우
      if (isFullWidth) {
        terminal.write('\b \b\b \b') // 한글/전각은 두 칸 지우기
      } else {
        terminal.write('\b \b') // 일반 문자는 한 칸 지우기
      }
    } else {
      // 커서가 중간에 있는 경우 DCH 명령 사용
      terminal.write('\b') // 한 칸 왼쪽으로 이동
      const deleteCount = isFullWidth ? 2 : 1
      terminal.write(`\x1b[${deleteCount}P`) // 해당 문자 삭제
    }

    // 버퍼 업데이트
    currentInputBuffer =
      currentInputBuffer.substring(0, cursorPosition - 1) +
      currentInputBuffer.substring(cursorPosition)
    cursorPosition--
  }

  const handlePasteWithLineBreaks = (data: string) => {
    const lines = data.split(/\r\n|\r|\n/)

    // 첫 번째 줄 처리
    if (lines[0]) {
      handleTextAtCursorPosition(lines[0])
    }

    // Enter 키 처리
    terminal.write('\r\n')
    processLine(currentInputBuffer)

    // 나머지 줄들은 큐에 추가
    if (lines.length > 1) {
      inputQueue.push(...lines.slice(1).filter((line) => line.length > 0))
    }
  }

  const setupIMEHandlers = () => {
    // IME 조합 시작
    terminal.textarea?.addEventListener('compositionstart', () => {
      isComposing = true
    })

    // IME 조합 완료
    terminal.textarea?.addEventListener(
      'compositionend',
      (e: CompositionEvent) => {
        if (isWaitingForServerResponse) {
          return
        }

        const composedText = e.data
        lastComposedText = composedText

        handleTextAtCursorPosition(composedText)

        // 조합 완료 후 플래그 초기화 (비동기 처리)
        setTimeout(() => {
          isComposing = false
        }, 0)
      }
    )
  }

  const handleDataInput = (data: string) => {
    // 서버 응답 대기 중이면 줄바꿈만 큐에 추가
    if (isWaitingForServerResponse) {
      if (data.includes('\r') || data.includes('\n')) {
        const lines = data.split(/\r\n|\r|\n/)
        inputQueue.push(...lines.filter((line) => line.length > 0))
      }
      return
    }

    // IME 조합 중이거나 직전 완성된 한글 중복 입력 방지
    if (isComposing || lastComposedText === data) {
      lastComposedText = ''
      return
    }

    // 줄바꿈이 있는 붙여넣기 처리
    if (data.includes('\r') || data.includes('\n')) {
      handlePasteWithLineBreaks(data)
      return
    }

    // 백스페이스 처리
    if (data === '\b' || data === '\x7f') {
      handleBackspace()
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
    if (data.length === 1 && !data.startsWith('\x1b')) {
      handleTextAtCursorPosition(data)
    }
  }

  const setupWebSocketHandlers = () => {
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

    const processNextQueuedInput = () => {
      if (inputQueue.length > 0 && !isWaitingForServerResponse) {
        const nextLine = inputQueue.shift()
        if (nextLine !== undefined) {
          processLine(nextLine)
        }
      }
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
            return
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
  }

  setupWebSocketHandlers()
  terminal.onData(handleDataInput)
  setupIMEHandlers()

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
