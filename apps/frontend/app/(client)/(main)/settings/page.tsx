'use client'

import type { SettingsFormat } from '@/types/type'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { ConfirmModal } from './_components/ConfirmModal'
import { CurrentPwSection } from './_components/CurrentPwSection'
import { IdSection } from './_components/IdSection'
import { LogoSection } from './_components/LogoSection'
import { MajorSection } from './_components/MajorSection'
import { NameSection } from './_components/NameSection'
import { NewPwSection } from './_components/NewPwSection'
import { ReEnterNewPwSection } from './_components/ReEnterNewPwSection'
import { SaveButton } from './_components/SaveButton'
import { StudentIdSection } from './_components/StudentIdSection'
import { TopicSection } from './_components/TopicSection'
import { SettingsProvider } from './_components/context'
import { useCheckPassword } from './_libs/hooks/useCheckPassword'
import {
  useFetchUserProfileSuspense,
  useUpdateUserProfile
} from './_libs/queries/profile'
import { getSchema } from './_libs/schemas'
import { useConfirmNavigation } from './_libs/utils'

type UpdatePayload = Partial<{
  password: string
  newPassword: string
  realName: string
  studentId: string
  major: string
}>

export default function Page() {
  const searchParams = useSearchParams()
  const updateNow = searchParams.get('updateNow')
  const router = useRouter()
  const bypassConfirmation = useRef<boolean>(false)

  // React Query를 사용하여 프로필 데이터 가져오기
  const { data: defaultProfileValues } = useFetchUserProfileSuspense()

  const [majorValue, setMajorValue] = useState<string>(
    defaultProfileValues.major || ''
  )
  //const [isLoading, setIsLoading] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors }
  } = useForm<SettingsFormat>({
    resolver: valibotResolver(getSchema(Boolean(updateNow))),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      realName: defaultProfileValues.userProfile?.realName ?? '',
      studentId: defaultProfileValues.studentId
    }
  })

  const currentPassword = watch('currentPassword')
  const newPassword = watch('newPassword')
  const confirmPassword = watch('confirmPassword')
  const realName = watch('realName')
  const studentId = watch('studentId')

  const { isConfirmModalOpen, setIsConfirmModalOpen, confirmAction } =
    useConfirmNavigation(bypassConfirmation, Boolean(updateNow))

  const {
    isPasswordCorrect,
    newPasswordAble,
    isCheckButtonClicked,
    checkPassword
  } = useCheckPassword(defaultProfileValues, currentPassword)

  const [passwordShow, setPasswordShow] = useState<boolean>(false)
  const [newPasswordShow, setNewPasswordShow] = useState<boolean>(false)
  const [confirmPasswordShow, setConfirmPasswordShow] = useState<boolean>(false)
  const [majorOpen, setMajorOpen] = useState<boolean>(false)

  const isPasswordsMatch = newPassword === confirmPassword && newPassword !== ''
  const saveAblePassword: boolean =
    Boolean(currentPassword) &&
    Boolean(newPassword) &&
    Boolean(confirmPassword) &&
    isPasswordCorrect &&
    newPasswordAble &&
    isPasswordsMatch
  const saveAbleOthers: boolean =
    Boolean(realName) || Boolean(majorValue !== defaultProfileValues.major)
  const saveAble =
    (saveAblePassword || saveAbleOthers) &&
    ((isPasswordsMatch && !errors.newPassword) ||
      (!newPassword && !confirmPassword))
  const saveAbleUpdateNow =
    Boolean(studentId) && majorValue !== 'none' && !errors.studentId

  // 무한 렌더링..
  useEffect(() => {
    if (isPasswordsMatch) {
      setValue('newPassword', newPassword)
      setValue('confirmPassword', confirmPassword)
    }
  }, [isPasswordsMatch, newPassword, confirmPassword, setValue])

  const updateUserProfile = useUpdateUserProfile()

  const onSubmit = async (data: SettingsFormat) => {
    try {
      const updatePayload: UpdatePayload = {}

      if (data.realName !== defaultProfileValues.userProfile?.realName) {
        updatePayload.realName = data.realName
      }
      if (majorValue !== defaultProfileValues.major) {
        updatePayload.major = majorValue
      }
      if (data.currentPassword !== 'tmppassword1') {
        updatePayload.password = data.currentPassword
      }
      if (data.newPassword !== 'tmppassword1') {
        updatePayload.newPassword = data.newPassword
      }
      if (updateNow && data.studentId !== '0000000000') {
        updatePayload.studentId = data.studentId
      }

      await updateUserProfile.mutateAsync(updatePayload)
      toast.success('Successfully updated your information')
      bypassConfirmation.current = true
      setTimeout(() => {
        if (updateNow) {
          router.push('/')
        } else {
          window.location.reload()
        }
      }, 1500)
    } catch (error) {
      console.error(error)
      toast.error('Failed to update your information, Please try again')
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    }
  }

  const resetToSubmittableValue = (
    field: 'realName' | 'currentPassword' | 'newPassword' | 'confirmPassword',
    value: string | undefined,
    defaultValue: string
  ) => {
    if (value === '') {
      setValue(field, defaultValue)
    }
  }

  const onSubmitClick = () => {
    resetToSubmittableValue(
      'realName',
      realName,
      defaultProfileValues.userProfile?.realName ?? ''
    )
    resetToSubmittableValue('currentPassword', currentPassword, 'tmppassword1')
    resetToSubmittableValue('newPassword', newPassword, 'tmppassword1')
    resetToSubmittableValue('confirmPassword', confirmPassword, 'tmppassword1')
  }

  const settingsContextValue = {
    defaultProfileValues,
    passwordState: {
      passwordShow,
      setPasswordShow,
      newPasswordShow,
      setNewPasswordShow,
      confirmPasswordShow,
      setConfirmPasswordShow
    },
    majorState: {
      majorOpen,
      setMajorOpen,
      majorValue,
      setMajorValue
    },
    formState: {
      register,
      errors
    },
    updateNow: Boolean(updateNow)
    //isLoading
  }
  return (
    <div className="flex w-full gap-20 py-6">
      {/* Logo */}
      <LogoSection />

      <SettingsProvider value={settingsContextValue}>
        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex h-svh max-h-[846px] w-full flex-col justify-between gap-4 overflow-y-auto px-4"
        >
          {/* Topic */}
          <TopicSection />
          {/* ID */}
          <IdSection />
          {/* Current password */}
          <CurrentPwSection
            currentPassword={currentPassword}
            isCheckButtonClicked={isCheckButtonClicked}
            isPasswordCorrect={isPasswordCorrect}
            checkPassword={checkPassword}
          />
          {/* New password */}
          <NewPwSection
            newPasswordAble={newPasswordAble}
            isPasswordsMatch={isPasswordsMatch}
            confirmPassword={confirmPassword}
            newPassword={newPassword}
          />
          {/* Re-enter new password */}
          <ReEnterNewPwSection
            newPasswordAble={newPasswordAble}
            isPasswordsMatch={isPasswordsMatch}
            confirmPassword={confirmPassword}
            getValues={getValues}
          />

          <hr className="my-4 border-neutral-200" />

          {/* Name */}
          <NameSection realName={realName} />
          {/* Student ID */}
          <StudentIdSection studentId={studentId} />
          {/* Major */}
          <MajorSection />
          {/* Save Button */}
          <SaveButton
            saveAble={saveAble}
            saveAbleUpdateNow={saveAbleUpdateNow}
            onSubmitClick={onSubmitClick}
          />
        </form>
      </SettingsProvider>

      <ConfirmModal
        title="Are you sure you want to leave?"
        description={`Your changes have not been saved.\nIf you leave this page, all changes will be lost.\nDo you still want to proceed?`}
        open={isConfirmModalOpen}
        handleOpen={() => setIsConfirmModalOpen(true)}
        handleClose={() => setIsConfirmModalOpen(false)}
        confirmAction={confirmAction}
      />
    </div>
  )
}
