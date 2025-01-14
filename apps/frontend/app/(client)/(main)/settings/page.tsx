'use client'

//import { safeFetcherWithAuth } from '@/libs/utils'
import type { SettingsFormat } from '@/types/type'
import { zodResolver } from '@hookform/resolvers/zod'
//import { useSuspenseQuery, useMutation } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
//import { useEffect, useRef } from 'react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
//import type { UseFormRegister } from 'react-hook-form'
import { toast } from 'sonner'
import {
  useFetchUserProfileSuspense,
  useUpdateUserProfile
} from '../../../(client)/_libs/queries/settings'
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
import type { SettingsContextType } from './_components/context'
//import type { Profile } from './_components/context'
import { useCheckPassword } from './_libs/hooks/useCheckPassword'
import { schemaSettings } from './_libs/schemas'

//import { useConfirmNavigation } from './_libs/utils'

export default function Page() {
  const searchParams = useSearchParams()
  const updateNow = searchParams.get('updateNow')
  const router = useRouter()

  const { data: defaultProfileValues, isLoading } =
    useFetchUserProfileSuspense()

  const updateMutation = useUpdateUserProfile()

  const {
    handleSubmit,
    watch,
    getValues,
    setValue,
    register,
    formState: { errors }
  } = useForm<SettingsFormat>({
    resolver: zodResolver(schemaSettings(Boolean(updateNow))),
    mode: 'onChange',
    defaultValues: {} // 초기 값을 비워둠
  })

  const realName = watch('realName')
  const studentId = watch('studentId')
  const currentPassword = watch('currentPassword')
  const newPassword = watch('newPassword')
  const confirmPassword = watch('confirmPassword')

  if (defaultProfileValues && !isLoading) {
    setValue('realName', defaultProfileValues.userProfile?.realName ?? '')
    setValue('studentId', defaultProfileValues.studentId ?? '')
    setValue('currentPassword', '')
    setValue('newPassword', '')
    setValue('confirmPassword', '')
  }
  // 패스워드 상태 관리
  const [passwordShow, setPasswordShow] = useState(false)
  const [newPasswordShow, setNewPasswordShow] = useState(false)
  const [confirmPasswordShow, setConfirmPasswordShow] = useState(false)

  const {
    isPasswordCorrect,
    newPasswordAble,
    isCheckButtonClicked,
    checkPassword
  } = useCheckPassword(defaultProfileValues, currentPassword)
  const isPasswordsMatch = newPassword === confirmPassword && newPassword !== ''

  // Context value 정의
  const settingsContextValue: SettingsContextType = {
    defaultProfileValues,
    passwordState: {
      passwordShow: false,
      setPasswordShow,
      newPasswordShow,
      setNewPasswordShow,
      confirmPasswordShow,
      setConfirmPasswordShow
    },
    majorState: {
      majorOpen: false,
      setMajorOpen: () => {},
      majorValue: '',
      setMajorValue: () => {}
    },
    formState: {
      register, // useForm에서 가져온 register
      errors // useForm에서 가져온 errors
    },
    updateNow: Boolean(updateNow),
    isLoading: false
  }

  const onSubmit = (data: SettingsFormat) => {
    const updatePayload = {
      ...(data.realName !== defaultProfileValues.userProfile?.realName && {
        realName: data.realName
      }),
      ...(data.studentId !== defaultProfileValues.studentId && {
        studentId: data.studentId
      }),
      ...(currentPassword && { password: currentPassword }),
      ...(newPassword && { newPassword })
    }
    updateMutation.mutate(updatePayload, {
      onSuccess: () => {
        toast.success('Successfully updated your information')
        setTimeout(() => {
          if (updateNow) {
            router.push('/')
          } else {
            window.location.reload()
          }
        }, 1500)
      },
      onError: () => {
        toast.error('Failed to update your information, Please try again')
      }
    })
  }

  return (
    <div className="flex w-full gap-20 py-6">
      {/* Logo */}
      <LogoSection />
      {/* SettingsProvider로 감싸는 컨텍스트 안하니까 에러남*/}
      <SettingsProvider value={settingsContextValue}>
        {/* Form과 추가 섹션 */}
        <div className="flex w-full gap-20 py-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex h-svh max-h-[846px] w-full flex-col justify-between gap-4 overflow-y-auto px-4"
          >
            {/* Topic Section */}
            <TopicSection />
            {/* ID Section */}
            <IdSection />
            {/* Current Password Section */}
            <CurrentPwSection
              currentPassword={currentPassword}
              isCheckButtonClicked={isCheckButtonClicked}
              isPasswordCorrect={isPasswordCorrect}
              checkPassword={checkPassword}
            />
            {/* New password */}{' '}
            <NewPwSection
              newPasswordAble={newPasswordAble}
              isPasswordsMatch={isPasswordsMatch}
              confirmPassword={confirmPassword}
              newPassword={newPassword}
            />
            {/* Re-enter new password */}{' '}
            <ReEnterNewPwSection
              newPasswordAble={newPasswordAble}
              isPasswordsMatch={isPasswordsMatch}
              confirmPassword={confirmPassword}
              getValues={getValues}
            />
            <hr className="my-4 border-neutral-200" />
            <NameSection realName={realName} />
            <StudentIdSection studentId={studentId} />
            <MajorSection major={defaultProfileValues?.major ?? ''} />
            <SaveButton
              saveAbleUpdateNow={Boolean(realName || studentId)} // 업데이트 가능한지 여부
              saveAble={Boolean(realName || studentId)}
              isLoading={isLoading} // 로딩 상태 전달
              onSubmitClick={() => console.log('Submitting form...')}
            />
          </form>

          <ConfirmModal
            title="Are you sure you want to leave?"
            description="Your changes have not been saved. If you leave this page, all changes will be lost."
            open={false}
            handleOpen={() => {}}
            handleClose={() => {}}
            confirmAction={() => {}}
          />
        </div>
      </SettingsProvider>
    </div>
  )
}
