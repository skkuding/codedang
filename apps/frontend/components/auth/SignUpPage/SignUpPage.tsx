'use client'

import asteriskGray from '@/public/icons/asterisk-gray.svg'
import { valibotResolver } from '@hookform/resolvers/valibot'
import Image from 'next/image'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaEye, FaEyeSlash } from 'react-icons/fa6'
import { signupSchema } from './signup.schema'
import type { SignUpFormValues } from './signup.type'

interface AgreementCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  children: React.ReactNode
}

function AgreementCheckbox({
  checked,
  onChange,
  children
}: AgreementCheckboxProps) {
  return (
    <label className="text-caption2_m_12 flex cursor-pointer items-center gap-[6px]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-[20px] w-[20px] shrink-0 appearance-none rounded-[3px] border border-[#C4C4C4] bg-white bg-center bg-no-repeat checked:border-transparent checked:bg-[#3581FA]"
        style={{
          backgroundImage: checked
            ? `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'><path d='M5.5 10L8.14645 12.6464C8.34171 12.8417 8.65829 12.8417 8.85355 12.6464L14.5 7' stroke='white' stroke-width='2' stroke-linecap='round'/></svg>")`
            : 'none'
        }}
      />
      <span>{children}</span>
    </label>
  )
}

export function SignUpPage() {
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    minorPrivacy: false,
    marketing: false
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<SignUpFormValues>({
    resolver: valibotResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      birth: '',
      userId: '',
      password: '',
      passwordConfirm: '',
      nickname: '',
      job: '',
      email: '',
      terms: false,
      privacy: false,
      minorPrivacy: false,
      marketing: false
    }
  })

  interface VisibleButtonProps {
    isVisible: boolean
    setIsVisible: (visible: boolean) => void
  }

  function VisibleButton({ isVisible, setIsVisible }: VisibleButtonProps) {
    return (
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setIsVisible(!isVisible)}
        className="absolute inset-y-0 right-[21.67px] flex items-center text-[#909799]"
        aria-label={isVisible ? '비밀번호 숨기기' : '비밀번호 보기'}
      >
        {isVisible ? (
          <FaEye className="text-gray-400" />
        ) : (
          <FaEyeSlash className="text-gray-400" />
        )}
      </button>
    )
  }
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const watchPassword = watch('password')
  const watchPasswordConfirm = watch('passwordConfirm')
  const watchBirth = watch('birth')

  const isPasswordMatched =
    watchPassword === watchPasswordConfirm && watchPasswordConfirm.length > 0

  const isPasswordConfirmError =
    Boolean(errors.passwordConfirm) ||
    (watchPasswordConfirm.length > 0 && !isPasswordMatched)

  const isAllChecked =
    agreements.terms &&
    agreements.privacy &&
    agreements.minorPrivacy &&
    agreements.marketing

  const handleAllAgreementChange = (checked: boolean) => {
    const nextAgreements = {
      terms: checked,
      privacy: checked,
      minorPrivacy: checked,
      marketing: checked
    }

    setAgreements(nextAgreements)
    setValue('terms', checked, { shouldValidate: true })
    setValue('privacy', checked, { shouldValidate: true })
    setValue('minorPrivacy', checked, { shouldValidate: true })
    setValue('marketing', checked, { shouldValidate: true })
  }

  const handleAgreementChange = (
    key: 'terms' | 'privacy' | 'minorPrivacy' | 'marketing',
    checked: boolean
  ) => {
    setAgreements((prev) => ({
      ...prev,
      [key]: checked
    }))

    setValue(key, checked, { shouldValidate: true })
  }

  const onSubmit = (data: SignUpFormValues) => {
    if (!isPasswordMatched) {
      return
    }

    console.log(data)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-[500px] flex-col items-start rounded-[20px] border border-[#DCE3E5] bg-white px-6 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
    >
      <div className="flex w-full flex-col gap-[48px]">
        <div className="flex w-full flex-col gap-5">
          <p className="text-head5_sb_24">회원가입</p>

          <div className="flex w-full flex-col gap-6">
            <div className="flex w-full flex-col gap-1">
              <label className="text-caption2_m_12">이름</label>
              <input
                type="text"
                placeholder="이름"
                className={`placeholder:text-body1_m_16 h-[46px] w-full rounded-[12px] border bg-white px-5 py-[11px] outline-none placeholder:text-[#C4C4C4] ${
                  errors.name
                    ? 'border-error focus:border-error'
                    : 'focus:border-primary border-[#D8D8D8]'
                }`}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-caption3_r_13 text-[#FF3B2F]">
                  {errors.name.message?.toString()}
                </p>
              )}
            </div>

            <div className="flex w-full flex-col gap-1">
              <label className="text-caption2_m_12">생년월일 6자리</label>
              <input
                type="text"
                placeholder="YYMMDD"
                maxLength={6}
                className={`placeholder:text-body1_m_16 h-[46px] w-full rounded-[12px] border bg-white px-5 py-[11px] outline-none placeholder:text-[#C4C4C4] ${
                  errors.birth
                    ? 'border-error focus:border-error'
                    : 'focus:border-primary border-[#D8D8D8]'
                }`}
                {...register('birth')}
              />
              {watchBirth && errors.birth && (
                <p className="text-caption3_r_13 text-[#FF3B2F]">
                  {errors.birth.message?.toString()}
                </p>
              )}
            </div>

            <div className="flex w-full flex-col gap-1">
              <label className="text-caption2_m_12">아이디</label>
              <input
                type="text"
                placeholder="아이디"
                className={`placeholder:text-body1_m_16 h-[46px] w-full rounded-[12px] border bg-white px-5 py-[11px] outline-none placeholder:text-[#C4C4C4] ${
                  errors.userId
                    ? 'border-error focus:border-error'
                    : 'focus:border-primary border-[#D8D8D8]'
                }`}
                {...register('userId')}
              />
              {errors.userId && (
                <p className="text-caption3_r_13 text-[#FF3B2F]">
                  {errors.userId.message?.toString()}
                </p>
              )}
            </div>

            <div className="flex w-full flex-col gap-2">
              <label className="text-caption2_m_12">비밀번호</label>

              <div className="flex w-full flex-col gap-[6px]">
                <div className="relative">
                  <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    placeholder="영문자, 숫자, 특수문자 포함 8-20자"
                    className={`placeholder:text-body1_m_16 h-[46px] w-full rounded-[12px] border bg-white px-5 py-[11px] outline-none placeholder:text-[#C4C4C4] ${
                      errors.password
                        ? 'border-error focus:border-error'
                        : 'focus:border-primary border-[#D8D8D8]'
                    }`}
                    {...register('password')}
                  />
                  <VisibleButton
                    isVisible={isPasswordVisible}
                    setIsVisible={setIsPasswordVisible}
                  />
                </div>
                {errors.password && (
                  <p className="text-caption3_r_13 text-[#FF3B2F]">
                    {errors.password.message?.toString()}
                  </p>
                )}

                <div className="relative">
                  <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    placeholder="비밀번호 확인"
                    className={`placeholder:text-body1_m_16 h-[46px] w-full rounded-[12px] border bg-white px-5 py-[11px] outline-none placeholder:text-[#C4C4C4] ${
                      isPasswordConfirmError
                        ? 'border-error focus:border-error'
                        : 'focus:border-primary border-[#D8D8D8]'
                    }`}
                    {...register('passwordConfirm')}
                  />
                  <VisibleButton
                    isVisible={isPasswordVisible}
                    setIsVisible={setIsPasswordVisible}
                  />
                </div>
                {watchPasswordConfirm &&
                  (isPasswordMatched ? (
                    <p className="text-caption3_r_13 text-[#3581FA]">
                      비밀번호가 일치합니다.
                    </p>
                  ) : (
                    <p className="text-caption3_r_13 text-[#FF3B2F]">
                      비밀번호가 일치하지 않습니다.
                    </p>
                  ))}
              </div>
            </div>

            <div className="flex w-full flex-col gap-[9px]">
              <div className="flex w-full flex-col gap-1">
                <label className="text-caption2_m_12">닉네임</label>
                <input
                  type="text"
                  placeholder="신나는 청사과"
                  className="placeholder:text-body1_m_16 focus:border-primary h-[46px] w-full rounded-[12px] border border-[#D8D8D8] bg-white px-5 py-[11px] outline-none placeholder:text-[#C4C4C4]"
                  {...register('nickname')}
                />
              </div>

              <div className="flex items-center gap-1">
                <Image
                  src={asteriskGray}
                  alt=""
                  width={12}
                  height={12}
                  className="shrink-0"
                />
                <p className="text-caption3_r_13 text-[#909799]">
                  닉네임 미입력시, 코드당이 자동으로 닉네임을 추천해드려요!
                </p>
              </div>
            </div>

            {/* <div className="flex w-full flex-col gap-1">
              <label className="text-caption2_m_12">직업</label>
              <input
                type="text"
                placeholder="직업"
                className="placeholder:text-body1_m_16 focus:border-primary h-[46px] w-full rounded-[12px] border border-[#D8D8D8] bg-white px-5 py-[11px] outline-none placeholder:text-[#C4C4C4]"
                {...register('job')}
              />
              {errors.job && (
                <p className="text-caption3_r_13 text-red-500">
                  {errors.job.message?.toString()}
                </p>
              )}
            </div> */}

            <div className="flex w-full flex-col gap-1">
              <label className="text-caption2_m_12">이메일</label>
              <input
                type="text"
                placeholder="codedang@codedang.com"
                className="placeholder:text-body1_m_16 focus:border-primary h-[46px] w-full rounded-[12px] border border-[#D8D8D8] bg-white px-5 py-[11px] outline-none placeholder:text-[#C4C4C4]"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-caption3_r_13 text-[#FF3B2F]">
                  {errors.email.message?.toString()}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-12">
          <div className="flex w-full flex-col gap-[10px]">
            <AgreementCheckbox
              checked={isAllChecked}
              onChange={handleAllAgreementChange}
            >
              전체동의
            </AgreementCheckbox>

            <div className="border-b border-[#D8D8D8]" />

            <AgreementCheckbox
              checked={agreements.terms}
              onChange={(checked) => handleAgreementChange('terms', checked)}
            >
              이용약관 동의
            </AgreementCheckbox>

            <AgreementCheckbox
              checked={agreements.privacy}
              onChange={(checked) => handleAgreementChange('privacy', checked)}
            >
              코드당 개인정보 수집 및 이용 동의
            </AgreementCheckbox>

            <AgreementCheckbox
              checked={agreements.minorPrivacy}
              onChange={(checked) =>
                handleAgreementChange('minorPrivacy', checked)
              }
            >
              14세미만 개인정보 이용 보호
            </AgreementCheckbox>

            <AgreementCheckbox
              checked={agreements.marketing}
              onChange={(checked) =>
                handleAgreementChange('marketing', checked)
              }
            >
              [선택] 마케팅 활용 동의 및 광고 수신 동의
            </AgreementCheckbox>
          </div>

          <button
            type="submit"
            disabled={!isValid || !isPasswordMatched}
            className="text-sub3_sb_16 flex h-[52px] w-full items-center justify-center rounded-[12px] bg-[#E5E5E5] text-[#9B9B9B] disabled:cursor-not-allowed"
          >
            가입하기
          </button>
        </div>
      </div>
    </form>
  )
}
