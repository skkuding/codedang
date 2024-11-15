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
import { cn } from '@/lib/utils'
import { useTestcaseStore } from '@/stores/testcase'
import type { TestcaseItem } from '@/types/type'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { CiSquarePlus } from 'react-icons/ci'
import { FaPlus } from 'react-icons/fa'
import { FaCircleCheck } from 'react-icons/fa6'
import { IoIosClose } from 'react-icons/io'

export default function AddUserTestcaseDialog() {
  const [open, setOpen] = useState(false)
  const { sampleTestcases, userTestcases, setUserTestcases } = useTestcaseStore(
    (state) => state
  )

  const [testcase, setTestcase] = useState<TestcaseItem[]>(userTestcases)

  const addTestcase = (testcase: TestcaseItem) => {
    setTestcase((state) => state.concat(testcase))
  }

  const deleteTestcase = (id: number) => {
    setTestcase((state) => state.filter((testcase) => testcase.id !== id))
  }

  const saveUserTestcase = () => {
    setUserTestcases(testcase)
    setOpen(false)
  }

  useEffect(() => {
    setTestcase(userTestcases)
  }, [userTestcases])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="my-2 flex h-8 w-[148px] items-center justify-center gap-2 rounded-[5px] bg-slate-600 p-2 text-white">
        <CiSquarePlus size={24} />
        Add Testcase
      </DialogTrigger>

      <DialogContent className="w-[700px] max-w-[700px] bg-[#121728] p-0">
        <ScrollArea className="h-[600px] px-14 pb-[40px] pt-[70px]">
          <ScrollBar />
          <DialogHeader>
            <DialogTitle className="mb-8 text-white">
              Add User Testcase
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6">
            {sampleTestcases.map((testcase, index) => (
              <div key={testcase.id} className="flex flex-col gap-2">
                <p className="text-[#C4CACC]">
                  Sample #{(index + 1).toString().padStart(2, '0')}
                </p>
                <SampleTestcaseItem
                  input={testcase.input}
                  output={testcase.output}
                />
              </div>
            ))}

            {testcase.map((testcase, index) => (
              <div key={testcase.id} className="flex flex-col gap-2">
                <p className="text-primary-light">
                  User Testcase #{(index + 1).toString().padStart(2, '0')}
                </p>
                <UserTestcaseItem
                  id={testcase.id}
                  input={testcase.input}
                  output={testcase.output}
                  deleteTestcase={deleteTestcase}
                />
              </div>
            ))}

            <div className="flex flex-col gap-2">
              <p className="text-primary-light">
                User Testcase #
                {(testcase.length + 1).toString().padStart(2, '0')}
              </p>
              <UserTestcaseForm addTestcase={addTestcase} />
            </div>

            <div className="mt-2 flex flex-row justify-end gap-3">
              <DialogClose asChild>
                <Button className="h-[40px] w-[78px] bg-[#DCE3E5] text-[#787E80]">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                className="flex h-[40px] w-[95px] gap-2 bg-[#3581FA] text-white"
                onClick={saveUserTestcase}
              >
                <FaCircleCheck />
                Save
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

function UserTestcaseForm({
  addTestcase
}: {
  addTestcase: (value: TestcaseItem) => void
}) {
  const { register, handleSubmit, formState, reset } = useForm<{
    input: string
    output: string
  }>()

  const hasError = formState.errors.input || formState.errors.output

  const onSubmit = handleSubmit((value) => {
    addTestcase({
      id: new Date().getTime(),
      ...value
    })
    reset()
  })

  return (
    <form onSubmit={onSubmit}>
      <div
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-[#DFDFDF] bg-white py-3 font-mono text-[#C2C2C2] shadow-sm',
          hasError && 'border-error'
        )}
      >
        <Textarea
          placeholder="Input"
          className="z-10 resize-none border-0 px-4 py-0 shadow-none focus-visible:ring-0"
          {...register('input', { required: true })}
        />
        <Textarea
          placeholder="Output"
          className="z-10 min-h-[80px] rounded-none border-l border-transparent border-l-gray-200 px-4 py-0 shadow-none focus-visible:ring-0"
          {...register('output', { required: true })}
        />
      </div>
      {hasError && <p className="text-error mt-2">Required</p>}
      <Button
        type="submit"
        className="mt-6 flex w-full gap-2 bg-[#555C66] text-[#C4CACC] hover:bg-[#222939] active:bg-[#222939]"
      >
        <FaPlus />
        Add
      </Button>
    </form>
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
        'flex h-[80px] w-full rounded-md border border-[#313744] bg-[#222939] font-mono shadow-sm'
      )}
    >
      <Textarea
        value={input}
        readOnly
        className="resize-none border-0 px-4 py-3 text-white shadow-none focus-visible:ring-0"
      />
      <Textarea
        value={output}
        readOnly
        className="min-h-[80px] rounded-none border-l border-transparent border-l-[#313744] px-4 py-3 text-white shadow-none focus-visible:ring-0"
      />
    </div>
  )
}

function UserTestcaseItem({
  id,
  input,
  output,
  deleteTestcase
}: {
  id: number
  input: string
  output: string
  deleteTestcase: (id: number) => void
}) {
  return (
    <div
      className={cn(
        'relative flex min-h-[80px] w-full rounded-md border border-[#DFDFDF] bg-white py-3 font-mono text-[#C2C2C2] shadow-sm'
      )}
    >
      <Textarea
        value={input}
        readOnly
        className="z-10 resize-none border-0 px-4 py-0 shadow-none focus-visible:ring-0"
      />
      <Textarea
        value={output}
        readOnly
        className="z-10 min-h-[80px] rounded-none border-l border-transparent border-l-gray-200 px-4 py-0 shadow-none focus-visible:ring-0"
      />
      <button type="button" className="absolute right-4 z-20 text-[#9B9B9B]">
        <IoIosClose size={25} onClick={() => deleteTestcase(id)} />
      </button>
    </div>
  )
}
