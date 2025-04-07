'use client'

import './xterm.css'

export function RunnerTab() {
  return (
    <div
      className="m-3 h-4/5 w-auto rounded-lg bg-[#121728] px-4 py-3"
      style={{ height: 'calc(100% - 5rem)' }}
    >
      <div id="runner-container" className="h-full w-auto" />
    </div>
  )
}
