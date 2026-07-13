'use client'

import { allMajors } from '@/libs/constants'
import { cn } from '@/libs/utils'
import invisibleIcon from '@/public/icons/invisible.svg'
import visibleIcon from '@/public/icons/visible.svg'
import type { SettingsFormat } from '@/types/type'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useMutation, useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { updateUserProfile } from '../../_libs/apis/profile'
import { profileQueries } from '../../_libs/queries/profile'
import { AccountLinkingSection } from './_components/AccountLinkingSection'
import { CollegeSection } from './_components/CollegeSection'
import { ConfirmModal } from './_components/ConfirmModal'
import { DeleteAccountSection } from './_components/DeleteAccountSection'
import { EmailNotificationSection } from './_components/EmailNotificationSection'
import { EmailVerificationSection } from './_components/EmailVerificationSection'
import { NicknameSection } from './_components/NicknameSection'
import { ProfilePhotoSection } from './_components/ProfilePhotoSection'
import { SettingsProvider } from './_components/context'
import { useCheckPassword } from './_libs/hooks/useCheckPassword'
import { getSchema } from './_libs/schemas'
import { useConfirmNavigation } from './_libs/utils'

const JOB_TYPE_LABELS: Record<string, string> = {
  CollegeStudent: '대학생',
  HighSchoolStudent: '고등학생',
  Employee: '직장인',
  Other: '기타'
}

const findMajorKoreanName = (storedMajor?: string) => {
  if (!storedMajor) {
    return ''
  }
  const entry =
    allMajors.find((m: string) => m.includes(storedMajor)) ?? storedMajor
  return (
    entry
      .split(/\s*\/\s*/)
      .at(-1)
      ?.trim() ?? entry
  )
}

const getJobLabel = (jobType?: string) => {
  if (!jobType) {
    return '직업'
  }
  return JOB_TYPE_LABELS[jobType] ?? jobType
}

type UpdatePayload = Partial<{
  password: string
  newPassword: string
  realName: string
  college: string
  major: string
  nickname: string
}>

export default function Page() {
  const bypassConfirmation = useRef<boolean>(false)

  const { data: defaultProfileValues, isLoading } = useQuery({
    ...profileQueries.fetch(),
    initialData: {
      username: '',
      nickname: '',
      userProfile: { realName: '' },
      studentId: '',
      college: '',
      major: '',
      email: ''
    },
    retry: false
  })

  const [majorValue, setMajorValue] = useState(defaultProfileValues.major)
  const [collegeValue, setCollegeValue] = useState(defaultProfileValues.college)

  const isSKKU =
    Boolean(defaultProfileValues.studentId) &&
    defaultProfileValues.studentId !== '0000000000'

  const [passwordShow, setPasswordShow] = useState(false)
  const [newPasswordShow, setNewPasswordShow] = useState(false)
  const [confirmPasswordShow, setConfirmPasswordShow] = useState(false)

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<SettingsFormat>({
    resolver: valibotResolver(getSchema()),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      realName: '',
      studentId: '',
      nickname: ''
    }
  })

  const currentPassword = watch('currentPassword')
  const newPassword = watch('newPassword')
  const confirmPassword = watch('confirmPassword')
  const realName = watch('realName')
  const nickname = watch('nickname')

  const initialized = useRef(false)

  useEffect(() => {
    if (isLoading) {
      return
    }
    if (!initialized.current) {
      initialized.current = true
      reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        realName: defaultProfileValues.userProfile?.realName ?? '',
        studentId: defaultProfileValues.studentId ?? '',
        nickname: defaultProfileValues.nickname ?? ''
      })
    }
    if (defaultProfileValues.college) {
      setCollegeValue(defaultProfileValues.college)
    }
    if (defaultProfileValues.major) {
      setMajorValue(defaultProfileValues.major)
    }
  }, [isLoading, reset, defaultProfileValues])

  const { isConfirmModalOpen, setIsConfirmModalOpen, confirmAction } =
    useConfirmNavigation(bypassConfirmation, false)

  const {
    isPasswordCorrect,
    newPasswordAble,
    isCheckButtonClicked,
    checkPassword
  } = useCheckPassword(defaultProfileValues, currentPassword)

  const isPasswordsMatch = newPassword === confirmPassword && newPassword !== ''

  const saveAble =
    (Boolean(currentPassword) &&
      Boolean(newPassword) &&
      Boolean(confirmPassword) &&
      isPasswordCorrect &&
      newPasswordAble &&
      isPasswordsMatch) ||
    (Boolean(realName) &&
      realName !== (defaultProfileValues.userProfile?.realName ?? '')) ||
    majorValue !== defaultProfileValues.major ||
    collegeValue !== defaultProfileValues.college ||
    Boolean(nickname && nickname !== defaultProfileValues.nickname)

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
      toast.error('정보 업데이트에 실패했습니다. 다시 시도해주세요.')
      setTimeout(() => window.location.reload(), 1500)
    },
    onSuccess: () => {
      toast.success('정보가 성공적으로 업데이트되었습니다.')
      bypassConfirmation.current = true
      setTimeout(() => window.location.reload(), 1500)
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
    if (data.nickname && data.nickname !== defaultProfileValues.nickname) {
      updatePayload.nickname = data.nickname
    }
    mutate(updatePayload)
  }

  const onSubmitClick = () => {
    const reset = (
      field: 'realName' | 'currentPassword' | 'newPassword' | 'confirmPassword',
      current: string | undefined,
      fallback: string
    ) => {
      if (current === '') {
        setValue(field, fallback)
      }
    }
    reset(
      'realName',
      realName,
      defaultProfileValues.userProfile?.realName ?? ''
    )
    reset('currentPassword', currentPassword, 'tmppassword1')
    reset('newPassword', newPassword, 'tmppassword1')
    reset('confirmPassword', confirmPassword, 'tmppassword1')
  }

  const inputBase =
    'h-[46px] w-full rounded-xl border border-line px-5 py-[11px] text-body1_m_16 outline-none'
  const labelBase = 'text-caption2_m_12 text-color-neutral-15'

  return (
    <div className="mt-[60px] flex w-full justify-center bg-white">
      <SettingsProvider
        value={{
          defaultProfileValues,
          isLoading,
          majorState: { majorValue, setMajorValue },
          collegeState: { collegeValue, setCollegeValue }
        }}
      >
        <div className="flex w-full max-w-[1440px] flex-col gap-10 px-5 py-7 sm:px-6 md:px-[116px] xl:px-[226px]">
          <form
            id="settings-form"
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-10"
          >
            <section className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold leading-[1.3] tracking-[-0.72px]">
                프로필 정보
              </h2>
              <ProfilePhotoSection />
              <div className="flex flex-col gap-6">
                <div className="flex gap-6">
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <label className={labelBase}>이름</label>
                    <div
                      className={cn(
                        inputBase,
                        'bg-fill-neutral text-color-neutral-70 flex items-center'
                      )}
                    >
                      {isLoading
                        ? 'Loading...'
                        : defaultProfileValues.userProfile?.realName || '이름'}
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <label className={labelBase}>아이디</label>
                    <div
                      className={cn(
                        inputBase,
                        'bg-fill-neutral text-color-neutral-70 flex items-center'
                      )}
                    >
                      {isLoading
                        ? 'Loading...'
                        : defaultProfileValues.username || '아이디'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-6">
                  <NicknameSection register={register} errors={errors} />
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <label className={labelBase}>직업</label>
                    <div
                      className={cn(
                        inputBase,
                        'bg-fill-neutral text-color-neutral-70 flex items-center'
                      )}
                    >
                      {isLoading
                        ? 'Loading...'
                        : getJobLabel(defaultProfileValues.jobType)}
                    </div>
                  </div>
                </div>

                {isSKKU ? (
                  <>
                    <div className="w-1/2 pr-3">
                      <div className="flex flex-col gap-1">
                        <label className={labelBase}>대학교</label>
                        <div
                          className={cn(
                            inputBase,
                            'bg-fill-neutral text-color-neutral-70 flex items-center'
                          )}
                        >
                          {isLoading ? 'Loading...' : '성균관대학교'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-6">
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <label className={labelBase}>학과</label>
                        <div
                          className={cn(
                            inputBase,
                            'bg-fill-neutral text-color-neutral-70 flex items-center'
                          )}
                        >
                          {isLoading
                            ? 'Loading...'
                            : findMajorKoreanName(
                                majorValue || defaultProfileValues.major
                              ) || '학과'}
                        </div>
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <label className={labelBase}>학번</label>
                        <div
                          className={cn(
                            inputBase,
                            'bg-fill-neutral text-color-neutral-70 flex items-center'
                          )}
                        >
                          {isLoading
                            ? 'Loading...'
                            : defaultProfileValues.studentId || '학번'}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="w-1/2 pr-3">
                    <CollegeSection />
                  </div>
                )}
              </div>
            </section>

            <section className="flex flex-col gap-5">
              <h2 className="text-2xl font-semibold leading-[1.3] tracking-[-0.72px]">
                이메일 인증
              </h2>
              <EmailVerificationSection />
            </section>

            <section className="flex flex-col gap-5">
              <h2 className="text-2xl font-semibold leading-[1.3] tracking-[-0.72px]">
                이메일 알림
              </h2>
              <EmailNotificationSection />
            </section>

            <section className="flex flex-col gap-5">
              <h2 className="text-2xl font-semibold leading-[1.3] tracking-[-0.72px]">
                비밀번호 변경
              </h2>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1">
                  <label className={labelBase}>현재 비밀번호</label>
                  <div className="flex items-center gap-1.5">
                    <div className="relative min-w-0 flex-1">
                      <input
                        type={passwordShow ? 'text' : 'password'}
                        placeholder="영문자, 숫자 포함 8-20자 (특수문자 제외)"
                        {...register('currentPassword')}
                        className={cn(
                          inputBase,
                          'focus:border-primary text-color-neutral-30 placeholder:text-color-neutral-90 w-full bg-white pr-12',
                          errors.currentPassword && 'border-red-500',
                          isCheckButtonClicked &&
                            (isPasswordCorrect
                              ? 'border-primary'
                              : 'border-red-500')
                        )}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                        onClick={() => setPasswordShow((v) => !v)}
                      >
                        <Image
                          src={passwordShow ? visibleIcon : invisibleIcon}
                          alt=""
                          width={20}
                          height={20}
                        />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={checkPassword}
                      disabled={!currentPassword}
                      className="text-primary border-primary-light h-[46px] shrink-0 rounded-xl border bg-white px-5 py-[13px] text-base font-semibold tracking-[-0.64px] disabled:opacity-50"
                    >
                      확인
                    </button>
                  </div>
                  {!errors.currentPassword && isCheckButtonClicked && (
                    <p
                      className={cn(
                        'text-xs',
                        isPasswordCorrect ? 'text-primary' : 'text-red-500'
                      )}
                    >
                      {isPasswordCorrect
                        ? '비밀번호가 일치합니다.'
                        : '비밀번호가 일치하지 않습니다.'}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelBase}>새 비밀번호</label>
                  <div className="relative">
                    <input
                      type={newPasswordShow ? 'text' : 'password'}
                      placeholder="영문자, 숫자 포함 8-20자 (특수문자 제외)"
                      disabled={!newPasswordAble}
                      {...register('newPassword')}
                      className={cn(
                        inputBase,
                        'focus:border-primary disabled:bg-fill-neutral text-color-neutral-30 placeholder:text-color-neutral-90 bg-white pr-12',
                        isPasswordsMatch
                          ? 'border-primary'
                          : ((errors.newPassword && newPassword) ||
                              confirmPassword) &&
                              'border-red-500'
                      )}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                      onClick={() => setNewPasswordShow((v) => !v)}
                    >
                      <Image
                        src={newPasswordShow ? visibleIcon : invisibleIcon}
                        alt=""
                        width={20}
                        height={20}
                      />
                    </button>
                  </div>
                  {errors.newPassword && newPasswordAble && newPassword && (
                    <ul className="text-xs text-red-500">
                      <li>8-20자리 이하</li>
                      <li>영문 대/소문자, 숫자 중 2가지 이상 포함</li>
                    </ul>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label className={labelBase}>새 비밀번호 확인</label>
                  <div className="relative">
                    <input
                      type={confirmPasswordShow ? 'text' : 'password'}
                      placeholder="영문자, 숫자 포함 8-20자 (특수문자 제외)"
                      disabled={!newPasswordAble}
                      {...register('confirmPassword')}
                      className={cn(
                        inputBase,
                        'focus:border-primary disabled:bg-fill-neutral text-color-neutral-30 placeholder:text-color-neutral-90 bg-white pr-12',
                        isPasswordsMatch
                          ? 'border-primary'
                          : confirmPassword && 'border-red-500'
                      )}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                      onClick={() => setConfirmPasswordShow((v) => !v)}
                    >
                      <Image
                        src={confirmPasswordShow ? visibleIcon : invisibleIcon}
                        alt=""
                        width={20}
                        height={20}
                      />
                    </button>
                  </div>
                  {getValues('confirmPassword') && (
                    <p
                      className={cn(
                        'text-xs',
                        isPasswordsMatch ? 'text-primary' : 'text-red-500'
                      )}
                    >
                      {isPasswordsMatch
                        ? '비밀번호가 일치합니다.'
                        : '비밀번호가 일치하지 않습니다.'}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </form>

          <section className="flex flex-col gap-5">
            <h2 className="text-2xl font-semibold leading-[1.3] tracking-[-0.72px]">
              계정 연동
            </h2>
            <AccountLinkingSection />
          </section>

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              form="settings-form"
              disabled={!saveAble}
              onClick={onSubmitClick}
              className={cn(
                'w-full rounded-xl px-5 py-[15px] text-base font-semibold tracking-[-0.64px] text-white',
                saveAble
                  ? 'bg-primary'
                  : 'bg-fill-neutral text-color-neutral-30 cursor-not-allowed'
              )}
            >
              변경사항 저장하기
            </button>
          </div>

          <DeleteAccountSection />
        </div>
      </SettingsProvider>

      <ConfirmModal
        title="페이지를 떠나시겠습니까?"
        description={`변경사항이 저장되지 않았습니다.\n이 페이지를 벗어나면 모든 변경사항이 사라집니다.\n계속 진행하시겠습니까?`}
        open={isConfirmModalOpen}
        handleOpen={() => setIsConfirmModalOpen(true)}
        handleClose={() => setIsConfirmModalOpen(false)}
        confirmAction={confirmAction}
      />
    </div>
  )
}
