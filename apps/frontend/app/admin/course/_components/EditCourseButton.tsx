'use client'

import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/shadcn/dialog'
import { Input } from '@/components/shadcn/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { useState } from 'react'
import { FiPlusCircle } from 'react-icons/fi'
import { GoPencil } from 'react-icons/go'
import { PiTrashLight } from 'react-icons/pi'
import { toast } from 'sonner'

interface EditCourseButtonProps<TData extends { id: number }, TPromise> {
  onSuccess?: () => void
  editTarget: (id: number) => Promise<TPromise>
}

/**
 * 어드민 테이블의 삭제 버튼 컴포넌트
 * @desctiption 선택된 행들을 삭제하는 기능
 * @param target
 * 삭제 대상 (problem or contest)
 * @param deleteTarget
 * 아이디를 전달받아 삭제 요청하는 함수
 * @param getCanDelete
 * 선택된 행들이 삭제 가능한지를 반환하는 함수
 * @param onSuccess
 * 삭제 성공 시 호출되는 함수
 * @param className
 * tailwind 클래스명
 */
export function EditCourseButton<TData extends { id: number }, TPromise>({
  onSuccess
}: EditCourseButtonProps<TData, TPromise>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [prefix, setPrefix] = useState('')
  const [num, setNum] = useState('')
  const [section, setSection] = useState('')

  const handlePrefixChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase() // 대문자로 변환
    if (/^[A-Za-z]{0,3}$/.test(value)) {
      setPrefix(value)
    }
  }

  const handleNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // 숫자만 남기기
    if (/^\d{0,4}$/.test(value)) {
      setNum(value)
    }
  }

  const handleSectionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '') // 숫자만 남기기
    if (/^\d{0,4}$/.test(value)) {
      setSection(value)
    }
  }
  return (
    <>
      <Button
        variant="outline"
        type="button"
        onClick={() => setIsDialogOpen(true)}
      >
        <GoPencil />
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="p-8">
          <DialogHeader className="gap-2">
            <DialogTitle>Create Course</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <span className="font-bold">Professor</span>
              <span className="text-red-500">*</span>
            </div>
            <Input
              id="professor"
              placeholder="이미지정된이름"
              disabled // 입력 비활성화
              className="cursor-not-allowed bg-gray-100 text-gray-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <span className="font-bold">Course Title</span>
              <span className="text-red-500">*</span>
            </div>

            <Input id="course-title" />
          </div>

          <div className="flex justify-between gap-4">
            <div className="flex w-2/3 flex-col gap-2">
              <div className="flex gap-2">
                <span className="font-bold">Course Code</span>
                <span className="text-red-500">*</span>
              </div>

              <div className="flex gap-2">
                <Input
                  id="course-prefix"
                  type="text"
                  placeholder="SWE"
                  value={prefix}
                  onChange={handlePrefixChange}
                  maxLength={3}
                  className="w-full rounded border p-2"
                />
                <Input
                  id="course-num"
                  type="text"
                  placeholder="0000"
                  value={num}
                  onChange={handleNumChange}
                  maxLength={4}
                  className="w-full rounded border p-2"
                />
              </div>
            </div>
            <div className="flex w-1/3 flex-col gap-2">
              <div className="flex gap-2">
                <span className="font-bold">Class Section</span>
              </div>

              <Input
                id="class-section"
                type="text"
                value={section}
                onChange={handleSectionChange}
                maxLength={2}
                className="w-full rounded border p-2"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <span className="font-bold">Semester</span>
              <span className="text-red-500">*</span>
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent className="rounded-md border border-gray-200 bg-white shadow-md">
                <SelectItem value="2025-spring">2025 Spring</SelectItem>
                <SelectItem value="2024-winter">2024 Winter</SelectItem>
                <SelectItem value="2024-fall">2024 Fall</SelectItem>
                <SelectItem value="2024-summer">2024 Summer</SelectItem>
                <SelectItem value="2024-spring">2024 Spring</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <span className="font-bold">Week</span>
              <span className="text-red-500">*</span>
            </div>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent className="rounded-md border border-gray-200 bg-white shadow-md">
                {Array.from({ length: 16 }, (_, i) => {
                  const week = i + 1
                  return (
                    <SelectItem key={week} value={`${week}-weeks`}>
                      {week} {week === 1 ? 'Week' : 'Weeks'}
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <span className="font-bold">Contact</span>
            </div>
            <Select>
              <SelectTrigger className="w-[180px] rounded-md border border-gray-300 shadow-sm">
                <SelectValue placeholder="Choose" />
              </SelectTrigger>
              <SelectContent className="rounded-md border border-gray-200 bg-white shadow-md">
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="office">Office</SelectItem>
                <SelectItem value="phone">Phone Number</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" className="bg-black hover:bg-black/70">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
