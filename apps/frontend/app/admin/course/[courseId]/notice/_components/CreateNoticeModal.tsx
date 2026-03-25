'use client'

import { fetchUserProfile } from '@/app/(client)/_libs/apis/profile'
import { TextEditor } from '@/app/admin/_components/TextEditor'
import { Modal } from '@/components/Modal'
import { Input } from '@/components/shadcn/input'
import { Label } from '@/components/shadcn/label'
import {
  CREATE_COURSE_NOTICE,
  UPDATE_COURSE_NOTICE
} from '@/graphql/course/mutation'
import { getClientSession } from '@/libs/auth/getClientSession'
import { useMutation } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

interface CreateNoticeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: string
  onSuccess?: () => void
  editData?: {
    id: number
    title: string
    content: string
  } | null
}

export function CreateNoticeModal({
  open,
  onOpenChange,
  courseId,
  onSuccess,
  editData
}: CreateNoticeModalProps) {
  const [realName, setRealName] = useState('')
  const [title, setTitle] = useState('')
  const [mainText, setMainText] = useState('')
  const [charCount, setCharCount] = useState(0)
  const isEditMode = Boolean(editData)

  const [createNotice, { loading: isCreating }] =
    useMutation(CREATE_COURSE_NOTICE)
  const [updateNotice, { loading: isUpdating }] =
    useMutation(UPDATE_COURSE_NOTICE)

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

  const handleSubmit = async () => {
    const groupIdNum = Number(courseId)

    if (!Number.isInteger(groupIdNum) || groupIdNum <= 0) {
      console.error('Invalid courseId for CreateNotice:', courseId)
      toast.error(
        'Invalid course id. Please reopen the modal from a valid course page.'
      )
      return
    }

    try {
      const getSession = getClientSession()
      const session = await getSession()

      if (isEditMode && editData) {
        console.log('updateNotice variables', {
          courseNoticeId: editData.id,
          input: { title, content: mainText }
        })
        await updateNotice({
          variables: {
            courseNoticeId: editData.id,
            input: {
              title,
              content: mainText
            }
          },
          context: session
            ? { headers: { Authorization: session.token.accessToken } }
            : undefined
        })
        toast.success('Notice updated!')
      } else {
        const inputVars = {
          groupId: groupIdNum,
          title,
          content: mainText,
          isPublic: true,
          isFixed: false
        }
        console.log('createNotice variables', { input: inputVars })
        await createNotice({
          variables: {
            input: inputVars
          },
          context: session
            ? { headers: { Authorization: session.token.accessToken } }
            : undefined
        })
        toast.success('Notice created!')
      }

      onSuccess?.()
      resetAndClose()
    } catch (error) {
      console.error('Create/Update Notice Error:', error)
      toast.error(
        isEditMode ? 'Failed to update notice.' : 'Failed to create notice.'
      )
    }
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
        disabled:
          !title.trim() ||
          !mainText.trim() ||
          charCount > 400 ||
          isCreating ||
          isUpdating,
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
              key={editData?.id ?? 'create'}
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
