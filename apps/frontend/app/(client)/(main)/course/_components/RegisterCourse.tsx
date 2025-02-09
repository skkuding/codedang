import { Button } from '@/components/shadcn/button'
import { Dialog, DialogContent } from '@/components/shadcn/dialog'
import { Input } from '@/components/shadcn/input'
import { Separator } from '@/components/shadcn/separator'
import { useState } from 'react'

export function RegisterCourse() {
  const [isDialogOpened, setIsDialogOpened] = useState(false)
  return (
    <div className="my-3 flex flex-col items-center gap-5 p-3">
      <p className="font-semibold">Course Register</p>
      <Input
        type="text"
        className="focus-visible:border-primary w-[80%] focus-visible:ring-0"
        placeholder="Invitation Code"
      />
      <Button
        variant="outline"
        className="bg-primary h-[20%] w-[25%]"
        onClick={() => setIsDialogOpened(true)}
      >
        <span className="text-white">Register</span>
      </Button>
      <Dialog open={isDialogOpened} onOpenChange={setIsDialogOpened}>
        <DialogContent className="w-[416px] p-0">
          <RegisterResult />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function RegisterResult() {
  return (
    <>
      <div className="flex flex-col justify-center px-6 pt-4">
        <span className="text-error">Unverified</span>
      </div>
      <Separator orientation="horizontal" />
      <div className="flex flex-col gap-3 px-6 pb-6 text-sm font-light">
        <span>User whose information has not been verified.</span>
        <span>
          Please make sure that you have entered the invitation code properly.
          If the problem persists, please contact your instructor or administor.
        </span>
        <span>
          초대 코드를 제대로 입력했는지 확인해주세요. 문제가 지속될 경우 교수자
          혹은 관리자에게 문의 해주세요
        </span>
      </div>
    </>
  )
}
