import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shadcn/dialog'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { Textarea } from '@/components/shadcn/textarea'
import { cn } from '@/libs/utils'
import { AlertTriangle, X } from 'lucide-react'
import { useState } from 'react'
import { CiSquarePlus } from 'react-icons/ci'
import { FaPlus } from 'react-icons/fa'
import { FaCircleCheck } from 'react-icons/fa6'
import { IoIosClose } from 'react-icons/io'
import CopyButton from '../CopyButton'
import { useTestcaseStore } from '../context/TestcaseStoreProvider'
import { useUserTestcasesForm } from './useUserTestcasesForm'

export default function AddUserTestcaseDialog() {
  const [open, setOpen] = useState(false)
  const sampleTestcases = useTestcaseStore((state) => state.sampleTestcases)

  const {
    formState,
    testcases,
    onSubmit,
    register,
    addTestcase,
    removeTestcase
  } = useUserTestcasesForm({
    onSubmit: () => setOpen(false)
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="flex h-8 w-[148px] items-center justify-center gap-2 rounded-[5px] bg-slate-600 p-2 text-white">
        <CiSquarePlus size={24} />
        Add Testcase
      </DialogTrigger>

      <DialogContent
        className="w-[700px] max-w-[700px] bg-[#121728] p-0"
        hideCloseButton
      >
        <DialogClose className="absolute right-6 top-6 z-10">
          <X className="h-6 w-6 text-[#b0b0b0]" />
          <span className="sr-only">Close</span>
        </DialogClose>
        <ScrollArea className="h-[600px] px-14">
          <ScrollBar />
          <form onSubmit={onSubmit}>
            <DialogHeader className="mt-[70px]">
              <DialogTitle className="text-white">
                Add User Testcase
              </DialogTitle>
            </DialogHeader>

            <div className="my-8 flex flex-col gap-6">
              {sampleTestcases.map((testcase, index) => (
                <div key={testcase.id} className="flex flex-col gap-4">
                  <p className="text-[#C4CACC]">
                    Sample #{(index + 1).toString().padStart(2, '0')}
                  </p>
                  <SampleTestcaseItem
                    input={testcase.input}
                    output={testcase.output}
                  />
                </div>
              ))}

              {testcases.map((testcase, index) => (
                <div key={testcase.id} className="flex flex-col">
                  <p className="text-primary-light mb-4">
                    User Testcase #{(index + 1).toString().padStart(2, '0')}
                  </p>
                  <div
                    className={cn(
                      'relative flex min-h-[80px] w-full rounded-md border border-[#DFDFDF] bg-white py-3 font-mono text-[#C2C2C2] shadow-sm',
                      formState.errors?.testcases?.[index] && 'border-error'
                    )}
                  >
                    <Textarea
                      {...register(`testcases.${index}.input`, {
                        required: true
                      })}
                      placeholder="Input"
                      className="z-10 resize-none border-0 px-4 py-0 text-black shadow-none placeholder:text-[#3333334D] focus-visible:ring-0"
                    />
                    <Textarea
                      {...register(`testcases.${index}.output`, {
                        required: true
                      })}
                      placeholder="Output"
                      className="z-10 min-h-[80px] rounded-none border-l border-transparent border-l-gray-200 px-4 py-0 text-black shadow-none placeholder:text-[#3333334D] focus-visible:ring-0"
                    />
                    <button
                      type="button"
                      className="absolute right-4 z-20 text-[#9B9B9B]"
                      onClick={() => removeTestcase(index)}
                    >
                      <IoIosClose size={25} />
                    </button>
                  </div>
                  {formState.errors?.testcases?.[index] && (
                    <div className="text-error mt-2 flex items-center gap-1 text-[11px] font-medium leading-[14px]">
                      <AlertTriangle size={12} />
                      Required
                    </div>
                  )}
                </div>
              ))}
              <Button
                type="button"
                onClick={addTestcase}
                className="mt-6 flex w-full gap-2 bg-[#555C66] text-[#C4CACC] hover:bg-[#222939] active:bg-[#222939]"
              >
                <FaPlus />
                Add
              </Button>
            </div>

            <div className="mb-[40px] flex flex-row justify-end gap-3">
              <DialogClose asChild>
                <Button className="h-[40px] w-[78px] bg-[#DCE3E5] text-[#787E80] hover:bg-[#C4CACC] hover:text-[#5F6566] active:bg-[#C4CACC] active:text-[#5F6566]">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                type="submit"
                className="flex h-[40px] w-[95px] gap-2 text-white hover:text-neutral-200 active:text-neutral-200"
              >
                <FaCircleCheck />
                Save
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function SampleTestcaseItem({
  input,
  output
}: {
  input: string
  output: string
}) {
  return (
    <div
      className={cn(
        'flex min-h-[80px] w-full rounded-md border border-[#313744] bg-[#222939] font-mono shadow-sm'
      )}
    >
      <div className="relative flex-1">
        <Textarea
          value={input}
          readOnly
          className="resize-none border-0 px-4 py-3 text-white shadow-none focus-visible:ring-0"
        />
        <CopyButton
          value={`${input}\n\n`}
          withTooltip={false}
          iconSize={16}
          className="absolute right-4 top-3 z-20 size-6 text-[#AAB1B2]"
        />
      </div>
      <div className="relative flex-1">
        <Textarea
          value={output}
          readOnly
          className="min-h-[80px] rounded-none border-l border-transparent border-l-[#313744] px-4 py-3 text-white shadow-none focus-visible:ring-0"
        />
        <CopyButton
          value={`${output}\n\n`}
          withTooltip={false}
          iconSize={16}
          className="absolute right-4 top-3 z-20 size-6 text-[#AAB1B2]"
        />
      </div>
    </div>
  )
}
