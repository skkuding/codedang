'use client'

import { TextEditor } from '@/app/admin/_components/TextEditor'
import { Button } from '@/components/shadcn/button'
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
import { NoticeModal, NoticeModalTitle } from './NoticeModal'

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
            groupId: Number(courseId),
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
            groupId: Number(courseId),
            input: {
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
          className="bg-primary hover:bg-primary-strong h-[46px] w-[126px] rounded-full px-6 py-[10px]"
          onClick={() => setIsOpen(true)}
        >
          <FaPen className="mr-2 h-5 w-5" />
          <span className="text-sub2_m_18">Create</span>
        </Button>
      )}

      <NoticeModal open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex flex-col gap-7 px-10 pb-[50px] pt-10">
          <NoticeModalTitle className="text-head4_m_28 text-color-common-0">
            {isEditMode ? 'Edit Notice' : 'Create Notice'}
          </NoticeModalTitle>

          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="flex shrink-0 items-center gap-1">
                <label htmlFor="title" className="text-sub3_sb_16">
                  Title
                </label>
                <span className="text-error text-sub3_sb_16 leading-none">
                  *
                </span>
              </div>
              <div className="border-color-neutral-95 flex flex-1 items-center justify-between gap-2 rounded-full border px-4 py-[11px]">
                <input
                  id="title"
                  type="text"
                  placeholder="Enter the Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={35}
                  className="text-body1_m_16 placeholder:text-color-neutral-90 text-color-common-0 w-full flex-1 border-none bg-transparent p-0 outline-none focus:outline-none focus:ring-0"
                />
                <span className="text-caption1_m_13 text-color-cool-neutral-50 shrink-0">
                  {title.length}/35
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1">
                <span className="text-sub1_sb_18">Main Text</span>
                <span className="text-error text-sub1_sb_18 leading-none">
                  *
                </span>
              </div>
              <div className="relative">
                <TextEditor
                  placeholder="Enter the Main Text"
                  onChange={handleMainTextChange}
                  defaultValue={editData?.content || ''}
                />
                <div className="text-caption1_m_13 text-color-cool-neutral-50 absolute bottom-4 right-4">
                  {charCount}/400
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              className="border-primary text-sub2_m_18 text-primary rounded-full border bg-white px-6 pb-[11px] pt-[10px] hover:bg-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={
                !title.trim() ||
                title.length > 35 ||
                !mainText.trim() ||
                charCount > 400 ||
                isPending
              }
              className="bg-primary hover:bg-primary-strong text-sub2_m_18 rounded-full px-6 pb-[11px] pt-[10px] text-white"
            >
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </NoticeModal>
    </>
  )
}
