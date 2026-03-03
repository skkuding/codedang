'use client'

import { fetchUserProfile } from '@/app/(client)/_libs/apis/profile'
import { TextEditor } from '@/app/admin/_components/TextEditor'
import { Modal } from '@/components/Modal'
import { Input } from '@/components/shadcn/input'
import { Label } from '@/components/shadcn/label'
import { useCallback, useEffect, useState } from 'react'

interface CreateNoticeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
  editData?: {
    id: number
    title: string
    content: string
  } | null
}

export function CreateNoticeModal({
  open,
  onOpenChange,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  courseId,
  editData
}: CreateNoticeModalProps) {
  const [realName, setRealName] = useState('')
  const [title, setTitle] = useState('')
  const [mainText, setMainText] = useState('')
  const [charCount, setCharCount] = useState(0)
  const isEditMode = Boolean(editData)

  const loadProfile = useCallback(async () => {
    try {
      const profile = await fetchUserProfile()
      setRealName(profile.userProfile.realName)
    } catch {
      setRealName('Unknown')
    }
  }, [])

  useEffect(() => {
    if (open && !realName) {
      loadProfile()
    }
  }, [open, realName, loadProfile])

  useEffect(() => {
    if (open && editData) {
      setTitle(editData.title)
      setMainText(editData.content)
      const textContent = editData.content.replace(/<[^>]*>/g, '')
      setCharCount(textContent.length)
    } else if (open && !editData) {
      setTitle('')
      setMainText('')
      setCharCount(0)
    }
  }, [open, editData])

  const handleMainTextChange = (richText: string) => {
    setMainText(richText)
    const textContent = richText.replace(/<[^>]*>/g, '')
    setCharCount(textContent.length)
  }

  const resetAndClose = () => {
    setTitle('')
    setMainText('')
    setCharCount(0)
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (isEditMode && editData) {
      window.dispatchEvent(
        new CustomEvent('noticeUpdated', {
          detail: {
            type: 'edit',
            id: editData.id,
            title,
            content: mainText
          }
        })
      )
    } else {
      window.dispatchEvent(
        new CustomEvent('noticeUpdated', {
          detail: {
            type: 'create',
            title,
            content: mainText,
            createdBy: realName || 'Unknown'
          }
        })
      )
    }
    resetAndClose()
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      type="custom"
      title={isEditMode ? 'Edit Notice' : 'Create Notice'}
      primaryButton={{
        text: isEditMode ? 'Update' : 'Create',
        onClick: handleSubmit,
        disabled: !title.trim() || !mainText.trim() || charCount > 400,
        className: 'bg-[#3581FA] text-white hover:bg-[#3581FA]/90'
      }}
      secondaryButton={{
        text: 'Cancel',
        onClick: resetAndClose,
        variant: 'outline',
        className: 'border-[#3581FA] text-[#3581FA] bg-white hover:bg-white'
      }}
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
      </div>
    </Modal>
  )
}
