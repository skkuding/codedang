import { Button } from '@/components/shadcn/button'
import { Dialog, DialogContent } from '@/components/shadcn/dialog'
import { useState } from 'react'
import { RegisterCourse } from './RegisterCourse'

export function RegisterCourseButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  return (
    <>
      <Button variant="slate" onClick={() => setIsDialogOpen(true)}>
        <div className="border-primary flex h-[32px] w-[127px] items-center justify-center gap-2 rounded-full border">
          <div className="border-primary relative flex h-5 w-5 items-center justify-center rounded-full border-2">
            <div className="bg-primary absolute h-[2px] w-[60%] rounded-full" />
            <div className="bg-primary absolute h-[60%] w-[2px] rounded-full" />
          </div>
          <span className="text-primary font-semibold">Register</span>
        </div>
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[416px]">
          <RegisterCourse />
        </DialogContent>
      </Dialog>
    </>
  )
}
