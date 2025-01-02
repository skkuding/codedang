'use client'

import { safeFetcherWithAuth } from '@/libs/utils'
import type { SettingsFormat } from '@/types/type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import ConfirmModal from './_components/ConfirmModal'
import CurrentPwSection from './_components/CurrentPwSection'
import IdSection from './_components/IdSection'
import LogoSection from './_components/LogoSection'
import MajorSection from './_components/MajorSection'
import NameSection from './_components/NameSection'
import NewPwSection from './_components/NewPwSection'
import ReEnterNewPwSection from './_components/ReEnterNewPwSection'
import SaveButton from './_components/SaveButton'
import StudentIdSection from './_components/StudentIdSection'
import TopicSection from './_components/TopicSection'
import { SettingsProvider } from './_components/context'
import type { GetProfile, SettingsContextType } from './_components/context'
import { useCheckPassword } from './_libs/hooks/useCheckPassword'
import { schemaSettings } from './_libs/schemas'
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
  const [defaultProfileValues, setdefaultProfileValues] = useState<GetProfile>({
    username: '',
    userProfile: {
      realName: ''
    },
    studentId: '',
    major: ''
  })

  // Fetch default profile values
  useEffect(() => {
    const fetchDefaultProfile = async () => {
      try {
        const data: GetProfile = await safeFetcherWithAuth.get('user').json()
        setMajorValue(data.major)
        setdefaultProfileValues(data)
        setIsLoading(false)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
        toast.error('Failed to load profile data')
        setIsLoading(false)
      }
    }
    fetchDefaultProfile()
  }, [])

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    formState: { errors }
  } = useForm<SettingsFormat>({
    resolver: zodResolver(schemaSettings(!!updateNow)),
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
    useConfirmNavigation(bypassConfirmation, !!updateNow)
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
  const [majorValue, setMajorValue] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const isPasswordsMatch = newPassword === confirmPassword && newPassword !== ''
  const saveAblePassword: boolean =
    !!currentPassword &&
    !!newPassword &&
    !!confirmPassword &&
    isPasswordCorrect &&
    newPasswordAble &&
    isPasswordsMatch
  const saveAbleOthers: boolean =
    !!realName || !!(majorValue !== defaultProfileValues.major)
  const saveAble =
    (saveAblePassword || saveAbleOthers) &&
    ((isPasswordsMatch && !errors.newPassword) ||
      (!newPassword && !confirmPassword))
  const saveAbleUpdateNow =
    !!studentId && majorValue !== 'none' && !errors.studentId
  // 일치 여부에 따라 New Password Input, Re-enter Password Input 창의 border 색상을 바꿈
  useEffect(() => {
    if (isPasswordsMatch) {
      setValue('newPassword', newPassword)
      setValue('confirmPassword', confirmPassword)
    }
  }, [isPasswordsMatch, newPassword, confirmPassword])
  const onSubmit = async (data: SettingsFormat) => {
    try {
      // 필요 없는 필드 제외 (defaultProfileValues와 값이 같은 것들은 제외)
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
      const response = await safeFetcherWithAuth.patch('user', {
        json: updatePayload
      })
      if (response.ok) {
        toast.success('Successfully updated your information')
        bypassConfirmation.current = true
        setTimeout(() => {
          if (updateNow) {
            router.push('/')
          } else {
            window.location.reload()
          }
        }, 1500)
      }
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
    if (value === '') setValue(field, defaultValue)
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

  const settingsContextValue: SettingsContextType = {
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
    updateNow: !!updateNow,
    isLoading
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
