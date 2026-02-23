'use client'

import type { SettingsFormat } from '@/types/type'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslate } from '@tolgee/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { updateUserProfile } from '../../_libs/apis/profile'
import { profileQueries } from '../../_libs/queries/profile'
import { ConfirmModal } from './_components/ConfirmModal'
import { CurrentPwSection } from './_components/CurrentPwSection'
import { EmailSection } from './_components/EmailSection'
import { IdSection } from './_components/IdSection'
import { LogoSection } from './_components/LogoSection'
import { MajorSection } from './_components/MajorSection'
import { NameSection } from './_components/NameSection'
import { NewPwSection } from './_components/NewPwSection'
import { PushNotificationSection } from './_components/PushNotificationSection'
import { ReEnterNewPwSection } from './_components/ReEnterNewPwSection'
import { SaveButton } from './_components/SaveButton'
import { StudentIdSection } from './_components/StudentIdSection'
import { TopicSection } from './_components/TopicSection'
import { SettingsProvider } from './_components/context'
import { useCheckPassword } from './_libs/hooks/useCheckPassword'
import { getSchema } from './_libs/schemas'
import { useConfirmNavigation } from './_libs/utils'

type UpdatePayload = Partial<{
  password: string
  newPassword: string
  realName: string
  studentId: string
  college: string
  major: string
}>

export default function Page() {
  const { t } = useTranslate()
  const searchParams = useSearchParams()
  const updateNow = searchParams.get('updateNow')
  const router = useRouter()
  const bypassConfirmation = useRef<boolean>(false)

  const { data: defaultProfileValues, isLoading } = useQuery({
    ...profileQueries.fetch(),
    initialData: {
      username: '',
      userProfile: {
        realName: ''
      },
      studentId: '',
      college: '',
      major: '',
      email: ''
    },
    retry: false
  })

  const [majorValue, setMajorValue] = useState(defaultProfileValues.major)
  const [collegeValue, setCollegeValue] = useState(defaultProfileValues.college)

  useEffect(() => {
    if (defaultProfileValues.major) {
      setMajorValue(defaultProfileValues.major)
    }
    if (defaultProfileValues.college) {
      setCollegeValue(defaultProfileValues.college)
    }
  }, [defaultProfileValues.major, defaultProfileValues.college])

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
  const [collegeOpen, setCollegeOpen] = useState<boolean>(false)

  const isPasswordsMatch = newPassword === confirmPassword && newPassword !== ''
  const saveAblePassword: boolean =
    Boolean(currentPassword) &&
    Boolean(newPassword) &&
    Boolean(confirmPassword) &&
    isPasswordCorrect &&
    newPasswordAble &&
    isPasswordsMatch
  const saveAbleOthers: boolean =
    Boolean(realName) ||
    Boolean(majorValue !== defaultProfileValues.major) ||
    Boolean(collegeValue !== defaultProfileValues.college)
  const saveAble =
    (saveAblePassword || saveAbleOthers) &&
    ((isPasswordsMatch && !errors.newPassword) ||
      (!newPassword && !confirmPassword)) &&
    majorValue !== 'none' &&
    collegeValue !== 'none'
  const saveAbleUpdateNow =
    Boolean(studentId) &&
    majorValue !== 'none' &&
    collegeValue !== 'none' &&
    !errors.studentId

  useEffect(() => {
    if (isPasswordsMatch) {
      setValue('newPassword', newPassword)
      setValue('confirmPassword', confirmPassword)
    }
  }, [isPasswordsMatch, newPassword, confirmPassword, setValue])

  const { mutate } = useMutation({
    mutationFn: updateUserProfile,
    onError: (error) => {
      console.error(error)
      toast.error(t('update_failed'))
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    },
    onSuccess: () => {
      toast.success(t('update_successful'))
      bypassConfirmation.current = true
      setTimeout(() => {
        if (updateNow) {
          router.push('/')
        } else {
          window.location.reload()
        }
      }, 1500)
    }
  })

  const onSubmit = (data: SettingsFormat) => {
    const updatePayload: UpdatePayload = {}

    if (data.realName !== defaultProfileValues.userProfile?.realName) {
      updatePayload.realName = data.realName
    }
    if (majorValue !== defaultProfileValues.major) {
      updatePayload.major = majorValue
    }
    if (collegeValue !== defaultProfileValues.college) {
      updatePayload.college = collegeValue
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

    mutate(updatePayload)
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
    isLoading,
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
    collegeState: {
      collegeOpen,
      setCollegeOpen,
      collegeValue,
      setCollegeValue
    },
    formState: {
      register,
      errors
    },
    updateNow: Boolean(updateNow)
  }
  return (
    <div className="mt-[60px] flex w-full max-w-[1440px] gap-20 px-4 pb-6 sm:px-[116px]">
      {/* Logo */}
      <LogoSection />

      <SettingsProvider value={settingsContextValue}>
        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex h-svh max-h-[1000px] w-full flex-col justify-between gap-4 overflow-y-auto px-4"
        >
          {/* Topic */}
          <TopicSection />
          {/* ID */}
          <IdSection />
          {/* Email */}
          <EmailSection />
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
          {/* Push Notifications */}
          <PushNotificationSection />
          {/* Save Button */}
          <SaveButton
            saveAble={saveAble}
            saveAbleUpdateNow={saveAbleUpdateNow}
            onSubmitClick={onSubmitClick}
          />
        </form>
      </SettingsProvider>

      <ConfirmModal
        title={t('leave_confirmation_title')}
        description={`${t('leave_confirmation_description_line_1')}\n${t('leave_confirmation_description_line_2')}\n${t('leave_confirmation_description_line_3')}`}
        open={isConfirmModalOpen}
        handleOpen={() => setIsConfirmModalOpen(true)}
        handleClose={() => setIsConfirmModalOpen(false)}
        confirmAction={confirmAction}
      />
    </div>
  )
}
