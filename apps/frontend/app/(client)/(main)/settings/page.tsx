'use client'

import { safeFetcher, safeFetcherWithAuth } from '@/libs/utils'
import type { SettingsFormat } from '@/types/type'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import ConfirmModal from './_components/ConfirmModal'
import { useConfirmNavigation } from './_components/ConfirmNavigation'
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

interface getProfile {
  username: string // ID
  userProfile: {
    realName: string
  }
  studentId: string
  major: string
}

type UpdatePayload = Partial<{
  password: string
  newPassword: string
  realName: string
  studentId: string
  major: string
}>

const schemaSettings = (updateNow: boolean) =>
  z.object({
    currentPassword: z.string().min(1, { message: 'Required' }).optional(),
    newPassword: z
      .string()
      .min(1)
      .min(8)
      .max(20)
      .refine((data) => {
        const invalidPassword = /^([a-z]*|[A-Z]*|[0-9]*|[^a-zA-Z0-9]*)$/
        return !invalidPassword.test(data)
      })
      .optional(),
    confirmPassword: z.string().optional(),
    realName: z
      .string()
      .regex(/^[a-zA-Z\s]+$/, { message: 'Only English Allowed' })
      .optional(),
    studentId: updateNow
      ? z.string().regex(/^\d{10}$/, { message: 'Only 10 numbers' })
      : z.string().optional()
  })

export default function Page() {
  const searchParams = useSearchParams()
  const updateNow = searchParams.get('updateNow')
  const router = useRouter()
  const bypassConfirmation = useRef<boolean>(false)
  const [defaultProfileValues, setdefaultProfileValues] = useState<getProfile>({
    username: '',
    userProfile: {
      realName: ''
    },
    studentId: '',
    major: ''
  })

  useEffect(() => {
    const fetchDefaultProfile = async () => {
      try {
        const data: getProfile = await safeFetcherWithAuth.get('user').json()
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

  const { isConfirmModalOpen, setIsConfirmModalOpen, confirmAction } =
    useConfirmNavigation(bypassConfirmation, !!updateNow)
  const [isCheckButtonClicked, setIsCheckButtonClicked] =
    useState<boolean>(false)
  const [isPasswordCorrect, setIsPasswordCorrect] = useState<boolean>(false)
  const [newPasswordAble, setNewPasswordAble] = useState<boolean>(false)
  const [passwordShow, setPasswordShow] = useState<boolean>(false)
  const [newPasswordShow, setNewPasswordShow] = useState<boolean>(false)
  const [confirmPasswordShow, setConfirmPasswordShow] = useState<boolean>(false)
  const [majorOpen, setMajorOpen] = useState<boolean>(false)
  const [majorValue, setMajorValue] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const currentPassword = watch('currentPassword')
  const newPassword = watch('newPassword')
  const confirmPassword = watch('confirmPassword')
  const realName = watch('realName')
  const studentId = watch('studentId')

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

  const onSubmitClick = () => {
    // submit 되기위해, watch로 확인되는 값이 default값과 같으면 setValue를 통해서 defaultProfileValues로 변경
    if (realName === '') {
      setValue('realName', defaultProfileValues.userProfile?.realName)
    }
    if (majorValue === defaultProfileValues.major) {
      setMajorValue(defaultProfileValues.major)
    }
    if (currentPassword === '') {
      setValue('currentPassword', 'tmppassword1')
    }
    if (newPassword === '') {
      setValue('newPassword', 'tmppassword1')
    }
    if (confirmPassword === '') {
      setValue('confirmPassword', 'tmppassword1')
    }
  }

  const checkPassword = async () => {
    setIsCheckButtonClicked(true)
    try {
      const response = await safeFetcher.post('auth/login', {
        json: {
          username: defaultProfileValues.username,
          password: currentPassword
        }
      })

      if (response.status === 201) {
        setIsPasswordCorrect(true)
        setNewPasswordAble(true)
      }
    } catch {
      console.error('Failed to check password')
    }
  }

  return (
    <div className="flex w-full gap-20 py-6">
      {/* Logo */}
      <LogoSection />

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex h-svh max-h-[846px] w-full flex-col justify-between gap-4 overflow-y-auto px-4"
      >
        {/* Topic */}
        <TopicSection updateNow={!!updateNow} />
        {/* ID */}
        <IdSection
          isLoading={isLoading}
          defaultUsername={defaultProfileValues.username}
        />
        {/* Current password */}
        <CurrentPwSection
          currentPassword={currentPassword}
          isCheckButtonClicked={isCheckButtonClicked}
          isPasswordCorrect={isPasswordCorrect}
          setPasswordShow={setPasswordShow}
          passwordShow={passwordShow}
          checkPassword={checkPassword}
          register={register}
          errors={errors}
          updateNow={!!updateNow}
        />
        {/* New password */}
        <NewPwSection
          newPasswordShow={newPasswordShow}
          setNewPasswordShow={setNewPasswordShow}
          newPasswordAble={newPasswordAble}
          isPasswordsMatch={isPasswordsMatch}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          updateNow={!!updateNow}
          register={register}
          errors={errors}
        />
        {/* Re-enter new password */}
        <ReEnterNewPwSection
          confirmPasswordShow={confirmPasswordShow}
          setConfirmPasswordShow={setConfirmPasswordShow}
          newPasswordAble={newPasswordAble}
          updateNow={!!updateNow}
          register={register}
          getValues={getValues}
          confirmPassword={confirmPassword}
          isPasswordsMatch={isPasswordsMatch}
        />
        <hr className="my-4 border-neutral-200" />
        {/* Name */}
        <NameSection
          isLoading={isLoading}
          updateNow={!!updateNow}
          defaultProfileValues={defaultProfileValues}
          register={register}
          errors={errors}
          realName={realName}
        />
        {/* Student ID */}
        <StudentIdSection
          studentId={studentId}
          updateNow={!!updateNow}
          isLoading={isLoading}
          errors={errors}
          register={register}
          defaultProfileValues={defaultProfileValues}
        />
        {/* Major */}
        <MajorSection
          majorOpen={majorOpen}
          setMajorOpen={setMajorOpen}
          majorValue={majorValue}
          setMajorValue={setMajorValue}
          updateNow={!!updateNow}
          isLoading={isLoading}
          defaultProfileValues={defaultProfileValues}
        />
        {/* Save Button */}
        <SaveButton
          updateNow={!!updateNow}
          saveAble={saveAble}
          saveAbleUpdateNow={saveAbleUpdateNow}
          onSubmitClick={onSubmitClick}
        />
      </form>

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
