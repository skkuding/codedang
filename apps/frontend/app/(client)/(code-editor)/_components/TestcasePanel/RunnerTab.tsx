'use client'

import { Button } from '@/components/shadcn/button'
import { useEffect } from 'react'
import { useRunner } from './useRunner'
import './xterm.css'

export function RunnerTab() {
  const { terminal, startRunner, remainingTime } = useRunner()

  useEffect(() => {
    let element

    if (
      terminal &&
      document &&
      (element = document.getElementById('runner-container'))
    ) {
      terminal.clear()
      terminal.open(element)
    }
  }, [terminal])

  return (
    <>
      <div className="flex w-full items-center justify-between px-5">
        <Button onClick={startRunner}>Click to Run</Button>
        <p>남은시간:{remainingTime} 초</p>
      </div>
      <div id="runner-container" className="h-full w-full bg-black p-5" />
    </>
  )
}
