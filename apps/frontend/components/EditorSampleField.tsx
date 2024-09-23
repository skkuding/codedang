import CopyIcon from '@/public/24_copy.svg'
import copyIcon from '@/public/copy.svg'
import copyCompleteIcon from '@/public/copyComplete.svg'
import type { ProblemDetail } from '@/types/type'
import { motion } from 'framer-motion'
import { sanitize } from 'isomorphic-dompurify'
import Image from 'next/image'
import { useState } from 'react'
import { useCopyToClipboard } from 'react-use'
import { toast } from 'sonner'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from './ui/tooltip'

interface EditorSampleFieldProps {
  problemTestCase: ProblemDetail['problemTestcase']
}

const useCopy = () => {
  const [, copyToClipboard] = useCopyToClipboard()

  // copiedID is used to show the checkmark icon when the user copies the input/output
  const [copiedID, setCopiedID] = useState('')
  const [timeoutID, setTimeoutID] = useState<NodeJS.Timeout | null>(null)

  const copy = (value: string, id: string) => {
    copyToClipboard(value)
    setCopiedID(id)

    // Clear the timeout if it's already set
    // This will prevent the previous setTimeout from executing
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    timeoutID && clearTimeout(timeoutID)
    const timeout = setTimeout(() => setCopiedID(''), 2000)
    setTimeoutID(timeout)
  }

  return { copiedID, copy }
}

export default function EditorSampleField({
  problemTestCase
}: EditorSampleFieldProps) {
  const { copiedID, copy } = useCopy()
  return problemTestCase.map(({ id, input, output }, index) => {
    const whitespaceStyle =
      'color: rgb(53, 129, 250); min-width: 0.5em; display: inline-block;'
    const changedInput = input
      .replaceAll(/ /g, `<span style="${whitespaceStyle}">␣</span>`)
      .replaceAll(/\n/g, `<span style="${whitespaceStyle}">↵</span>\n`)
      .replaceAll(/\t/g, `<span style="${whitespaceStyle}">↹</span>`)
    const changedOutput = output
      .replaceAll(/ /g, `<span style="${whitespaceStyle}">␣</span>`)
      .replaceAll(/\n/g, `<span style="${whitespaceStyle}">↵</span>\n`)
      .replaceAll(/\t/g, `<span style="${whitespaceStyle}">↹</span>`)
    return (
      <div key={id} className="mb-2 px-6">
        <h2 className="mb-2 font-bold">Sample</h2>

        <div className="flex space-x-2 text-base">
          <div className="w-1/2 space-y-2">
            <div className="flex items-center space-x-3">
              <h3 className="select-none text-sm font-semibold">
                Input {index + 1}
              </h3>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <motion.div
                    key={copiedID == `input-${id}` ? 'check' : 'clipboard'}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {copiedID == `input-${id}` ? (
                      <Image src={copyCompleteIcon} alt="copy" width={24} />
                    ) : (
                      <TooltipTrigger asChild>
                        <Image
                          onClick={() => {
                            copy(input + '\n\n', `input-${id}`) // add newline to the end for easy testing
                            toast('Successfully copied', {
                              unstyled: true,
                              closeButton: false,
                              icon: <Image src={CopyIcon} alt="copy" />,
                              style: { backgroundColor: '#f0f8ff' },
                              classNames: {
                                toast:
                                  'inline-flex items-center py-2 px-3 rounded gap-2',
                                title: 'text-primary font-medium'
                              }
                            })
                          }}
                          className="cursor-pointer transition-opacity hover:opacity-60"
                          src={copyIcon}
                          alt="copy"
                          width={24}
                        />
                      </TooltipTrigger>
                    )}
                  </motion.div>
                  <TooltipContent>
                    <p>Copy</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="rounded-md border border-[#555C66]">
              <pre
                className="h-24 w-full select-none overflow-auto px-4 py-2 font-mono text-sm"
                dangerouslySetInnerHTML={{
                  __html: sanitize(changedInput)
                }}
              />
            </div>
          </div>

          <div className="w-1/2 space-y-2">
            <div className="flex items-center space-x-3">
              <h3 className="select-none text-sm font-semibold">
                Output {index + 1}
              </h3>
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <motion.div
                    key={copiedID == `output-${id}` ? 'check' : 'clipboard'}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {copiedID == `output-${id}` ? (
                      <Image src={copyCompleteIcon} alt="copy" width={24} />
                    ) : (
                      <TooltipTrigger asChild>
                        <Image
                          onClick={() => {
                            copy(output + '\n\n', `output-${id}`) // add newline to the end for easy testing
                            toast('Successfully copied', {
                              unstyled: true,
                              closeButton: false,
                              icon: <Image src={CopyIcon} alt="copy" />,
                              style: { backgroundColor: '#f0f8ff' },
                              classNames: {
                                toast:
                                  'inline-flex items-center py-2 px-3 rounded gap-2',
                                title: 'text-primary font-medium'
                              }
                            })
                          }}
                          className="cursor-pointer transition-opacity hover:opacity-60"
                          src={copyIcon}
                          alt="copy"
                          width={24}
                        />
                      </TooltipTrigger>
                    )}
                  </motion.div>
                  <TooltipContent>
                    <p>Copy</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="rounded-md border-[1px] border-[#555C66]">
              <pre
                className="h-24 w-full select-none overflow-auto px-4 py-2 font-mono text-sm"
                dangerouslySetInnerHTML={{
                  __html: sanitize(changedOutput)
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  })
}
