'use client'

import type { ProblemDetail } from '@/types/type'
import { CopyButton } from './CopyButton'
import { WhitespaceVisualizer } from './WhitespaceVisualizer'

interface EditorSampleFieldProps {
  problemTestCase: ProblemDetail['problemTestcase']
}

export function EditorSampleField({ problemTestCase }: EditorSampleFieldProps) {
  return (
    <div>
      {problemTestCase.map(({ id, input, output }, index) => {
        return (
          <div key={id} className="mb-2 px-6">
            <h2 className="mb-2 font-bold">Sample</h2>

            <div className="flex space-x-2 text-base">
              <div className="w-1/2 space-y-2">
                <div className="flex items-center space-x-3">
                  <h3 className="select-none text-sm font-semibold">
                    Input {index + 1}
                  </h3>
                  <CopyButton value={input} />
                </div>
                <div className="rounded-md border border-[#555C66]">
                  <WhitespaceVisualizer text={input} className="px-4 py-2" />
                </div>
              </div>

              <div className="w-1/2 space-y-2">
                <div className="flex items-center space-x-3">
                  <h3 className="select-none text-sm font-semibold">
                    Output {index + 1}
                  </h3>
                  <CopyButton value={output} />
                </div>
                <div className="rounded-md border-[1px] border-[#555C66]">
                  <WhitespaceVisualizer text={output} className="px-4 py-2" />
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
