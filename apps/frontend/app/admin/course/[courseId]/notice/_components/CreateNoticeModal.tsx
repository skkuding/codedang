'use client'

import { TextEditor } from '@/app/admin/_components/TextEditor'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { Checkbox } from '@/components/shadcn/checkbox'
import { Input } from '@/components/shadcn/input'
import { Label } from '@/components/shadcn/label'
import {
  CREATE_COURSE_NOTICE,
  UPDATE_COURSE_NOTICE
} from '@/graphql/course/mutation'
import { useMutation } from '@apollo/client'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FaPen } from 'react-icons/fa6'
import { toast } from 'sonner'

interface CreateNoticeModalProps {
  courseId: string
  editData?: {
    id: number
    title: string
    content: string
    isFixed?: boolean
    isPublic?: boolean
  } | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreateNoticeModal({
  courseId,
  editData,
  open,
  onOpenChange
}: CreateNoticeModalProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const isEditMode = Boolean(editData)

  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled =
    typeof open === 'boolean' && typeof onOpenChange === 'function'
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen: (open: boolean) => void = isControlled
    ? (nextOpen) => onOpenChange(nextOpen)
    : setInternalOpen

  const [title, setTitle] = useState('')
  const [mainText, setMainText] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [isPublic, setIsPublic] = useState(editData?.isPublic ?? true)
  const [isFixed, setIsFixed] = useState(editData?.isFixed ?? false)

  const [createCourseNotice, { loading: isCreating }] =
    useMutation(CREATE_COURSE_NOTICE)
  const [updateCourseNotice, { loading: isUpdating }] =
    useMutation(UPDATE_COURSE_NOTICE)

  const isPending = isCreating || isUpdating

  useEffect(() => {
    if (!isOpen) {
      return
    }

    if (editData) {
      setTitle(editData.title)
      setMainText(editData.content)
      setIsPublic(editData.isPublic ?? true)
      setIsFixed(editData.isFixed ?? false)
      setCharCount(editData.content.replace(/<[^>]*>/g, '').length)
      return
    }

    setTitle('')
    setMainText('')
    setIsPublic(true)
    setIsFixed(false)
    setCharCount(0)
  }, [isOpen, editData])

  const handleMainTextChange = (richText: string) => {
    setMainText(richText)
    setCharCount(richText.replace(/<[^>]*>/g, '').length)
  }

  const closeModal = () => {
    setIsOpen(false)
  }

  const invalidateAdminNotice = async () => {
    await queryClient.invalidateQueries({
      queryKey: ['adminCourseNotices', Number(courseId)]
    })
  }

  const handleSubmit = async () => {
    try {
      if (isEditMode && editData) {
        await updateCourseNotice({
          variables: {
            courseNoticeId: editData.id,
            input: {
              title,
              content: mainText,
              isPublic,
              isFixed
            }
          }
        })
        toast.success('Notice updated!')
      } else {
        await createCourseNotice({
          variables: {
            input: {
              groupId: Number(courseId),
              title,
              content: mainText,
              isPublic,
              isFixed
            }
          }
        })
        toast.success('Notice created!')
      }

      await invalidateAdminNotice()
      router.refresh()
      closeModal()
    } catch {
      toast.error(
        isEditMode ? 'Failed to update notice.' : 'Failed to create notice.'
      )
    }
  }

  return (
    <>
      {!isControlled && (
        <Button
          variant="default"
          className="h-[46px] w-[126px] rounded-full bg-[#3581FA] px-6 py-[10px] hover:bg-[#3581FA]/90"
          onClick={() => setIsOpen(true)}
        >
          <FaPen className="mr-2 h-5 w-5" />
          <span className="text-[18px] font-medium leading-[140%] tracking-[-0.03em]">
            Create
          </span>
        </Button>
      )}

      <Modal
        open={isOpen}
        onOpenChange={setIsOpen}
        size="lg"
        type="custom"
        title={isEditMode ? 'Edit Notice' : 'Create Notice'}
      >
        <div className="flex flex-col gap-6 pt-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="title" className="whitespace-nowrap text-base">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter the Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-10 max-w-[645px] flex-1 rounded-3xl"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={isPublic}
                onCheckedChange={(checked) => setIsPublic(Boolean(checked))}
              />
              Public
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={isFixed}
                onCheckedChange={(checked) => setIsFixed(Boolean(checked))}
              />
              Fixed
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="mainText" className="text-base">
              Main Text <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <TextEditor
                placeholder="Enter the Main Text"
                onChange={handleMainTextChange}
                defaultValue={editData?.content || ''}
              />
              <div className="absolute bottom-4 right-4 text-sm text-gray-500">
                {charCount}/400
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              className="border-[#3581FA] bg-white text-[#3581FA] hover:bg-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                !title.trim() ||
                !mainText.trim() ||
                charCount > 400 ||
                isPending
              }
              className="bg-[#3581FA] text-white hover:bg-[#3581FA]/90"
            >
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
