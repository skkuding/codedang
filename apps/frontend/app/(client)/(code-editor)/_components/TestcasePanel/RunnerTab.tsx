'use client'

import { Terminal } from '@xterm/xterm'
import { useEffect } from 'react'
import { useRunner } from './useRunner'
import './xterm.css'

export function RunnerTab() {
  useRunner()
  const term = new Terminal({
    convertEol: true,
    disableStdin: false,
    cursorBlink: true
  })
  term.onKey((data) => term.write(data.key))
  term.onData((data) => {
    if (data === '\r' || data === '\n') {
      term.write('\r\n')
    }
  })

  useEffect(() => {
    let element
    if (document && (element = document.getElementById('runner-container'))) {
      term.clear()
      term.open(element)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <div id="runner-container" className="w-full bg-black p-5" />
}
