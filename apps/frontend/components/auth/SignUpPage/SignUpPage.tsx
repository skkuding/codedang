'use client'

import { allMajors } from '@/libs/constants'
import { cn, isHttpError, safeFetcher } from '@/libs/utils'
import resetGray from '@/public/icons/reset-gray.svg'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { searchUniversities } from 'korea-universities'
// @ts-expect-error: no type declarations for this package
import randomNameGenerator from 'korean-random-names-generator'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FaChevronDown, FaChevronUp, FaEye, FaEyeSlash } from 'react-icons/fa6'
import { IoSearchOutline } from 'react-icons/io5'
import { toast } from 'sonner'
import { signupSchema } from './signup.schema'
import type { SignUpFormValues } from './signup.type'

const JOB_OPTIONS = ['고등학생', '대학생', '직장인', '기타'] as const

const PIN_EXPIRE_SECONDS = 300

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
        className="border-color-neutral-90 checked:bg-primary h-[20px] w-[20px] shrink-0 appearance-none rounded-[3px] border bg-white bg-center bg-no-repeat checked:border-transparent"
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
      className="text-color-cool-neutral-60 absolute inset-y-0 right-[21.67px] flex items-center"
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

export function SignUpPage() {
  const router = useRouter()
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    minorPrivacy: false
  })

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    setError,
    clearErrors,
    formState: { errors, touchedFields }
  } = useForm<SignUpFormValues>({
    resolver: valibotResolver(signupSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      userId: '',
      password: '',
      passwordConfirm: '',
      nickname: '',
      job: '',
      university: '',
      major: '',
      studentId: '',
      email: '',
      terms: false,
      privacy: false,
      minorPrivacy: false
    }
  })

  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const [isUserIdAvailable, setIsUserIdAvailable] = useState(false)
  const [isCheckingUserId, setIsCheckingUserId] = useState(false)
  const [emailLocal, setEmailLocal] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)
  const [emailAuthToken, setEmailAuthToken] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [pinError, setPinError] = useState('')
  const [codeExpired, setCodeExpired] = useState(false)
  const [remaining, setRemaining] = useState(PIN_EXPIRE_SECONDS)
  const [endTime, setEndTime] = useState(0)
  const [jobOpen, setJobOpen] = useState(false)
  const [universityQuery, setUniversityQuery] = useState('')
  const [universityOpen, setUniversityOpen] = useState(false)
  const [majorQuery, setMajorQuery] = useState('')
  const [majorOpen, setMajorOpen] = useState(false)

  const watchPassword = watch('password')
  const watchPasswordConfirm = watch('passwordConfirm')
  const watchJob = watch('job')
  const watchUserId = watch('userId')
  const watchUniversity = watch('university')
  const watchNickname = watch('nickname')

  const isPasswordMismatch =
    watchPasswordConfirm.length > 0 && watchPassword !== watchPasswordConfirm

  const isPasswordAvailable =
    watchPasswordConfirm.length > 0 &&
    watchPassword === watchPasswordConfirm &&
    !errors.password

  const isSKKU = watchUniversity.startsWith('성균관대학교')

  const isAllChecked =
    agreements.terms && agreements.privacy && agreements.minorPrivacy

  useEffect(() => {
    if (!emailSent || codeExpired || emailVerified) {
      return
    }
    const id = setInterval(() => {
      const rem = Math.max(0, Math.round((endTime - Date.now()) / 1000))
      setRemaining(rem)
      if (rem === 0) {
        setCodeExpired(true)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [emailSent, endTime, codeExpired, emailVerified])

  useEffect(() => {
    setIsUserIdAvailable(false)
  }, [watchUserId])

  useEffect(() => {
    const fullEmail = isSKKU ? `${emailLocal}@skku.edu` : emailLocal
    setValue('email', fullEmail, { shouldValidate: emailLocal.length > 0 })
  }, [emailLocal, isSKKU, setValue])

  useEffect(() => {
    setEmailSent(false)
    setEmailVerified(false)
    setVerificationCode('')
    setPinError('')
    setCodeExpired(false)
  }, [emailLocal])

  useEffect(() => {
    setEmailLocal('')
    setEmailSent(false)
    setEmailVerified(false)
    setVerificationCode('')
    setPinError('')
    setCodeExpired(false)
    setValue('major', '')
    setMajorQuery('')
    setValue('studentId', '')
  }, [isSKKU, setValue])

  const formatTimer = () => {
    const min = Math.floor(remaining / 60)
    const sec = remaining % 60
    return `${min}:${sec < 10 ? '0' : ''}${sec}`
  }

  const sendEmail = async () => {
    if (!emailLocal) {
      return
    }
    try {
      const fullEmail = isSKKU ? `${emailLocal}@skku.edu` : emailLocal
      await safeFetcher.post('email-auth/send-email/register-new', {
        json: { email: fullEmail }
      })
      const now = Date.now()
      setEndTime(now + PIN_EXPIRE_SECONDS * 1000)
      setRemaining(PIN_EXPIRE_SECONDS)
      setEmailSent(true)
      setCodeExpired(false)
      setEmailVerified(false)
      setVerificationCode('')
      setPinError('')
    } catch (error) {
      if (isHttpError(error) && error.response.status === 409) {
        setError('email', { message: '이미 사용 중인 이메일입니다' })
      } else {
        setError('email', {
          message: '이메일 전송에 실패했습니다. 다시 시도해주세요'
        })
      }
    }
  }

  const verifyPin = async (code: string) => {
    if (code.length !== 6) {
      return
    }
    try {
      const response = await safeFetcher.post('email-auth/verify-pin', {
        credentials: 'include',
        json: {
          pin: code,
          email: isSKKU ? `${emailLocal}@skku.edu` : emailLocal
        }
      })
      if (response.status === 201) {
        setEmailVerified(true)
        setEmailAuthToken(response.headers.get('email-auth') || '')
        setPinError('')
      } else {
        setPinError('인증 번호가 일치하지 않습니다')
        setEmailVerified(false)
      }
    } catch {
      setPinError('인증 번호가 일치하지 않습니다')
      setEmailVerified(false)
    }
  }

  const checkUserId = async () => {
    const valid = await trigger('userId')
    if (!valid) {
      return
    }
    setIsCheckingUserId(true)
    try {
      await safeFetcher.get(`user/username-check?username=${watchUserId}`)
      clearErrors('userId')
      setIsUserIdAvailable(true)
    } catch {
      setError('userId', { message: '중복된 아이디입니다' })
      setIsUserIdAvailable(false)
    } finally {
      setIsCheckingUserId(false)
    }
  }

  const generateNickname = () => {
    setValue('nickname', randomNameGenerator(), { shouldValidate: true })
  }

  const handleAllAgreementChange = (checked: boolean) => {
    setAgreements({ terms: checked, privacy: checked, minorPrivacy: checked })
    setValue('terms', checked)
    setValue('privacy', checked)
    setValue('minorPrivacy', checked)
  }

  const handleAgreementChange = (
    key: 'terms' | 'privacy' | 'minorPrivacy',
    checked: boolean
  ) => {
    setAgreements((prev) => ({ ...prev, [key]: checked }))
    setValue(key, checked)
  }

  const filteredUniversities =
    universityQuery.length > 0 ? searchUniversities(universityQuery) : []

  const filteredMajors =
    majorQuery.length > 0
      ? allMajors.filter((m) =>
          m.toLowerCase().includes(majorQuery.toLowerCase())
        )
      : []

  const getKoreanMajorName = (major: string) =>
    major
      .split(/\s*\/\s*/)
      .at(-1)
      ?.trim() ?? major

  const CAMPUS_OVERRIDES: Record<string, Record<string, string>> = {
    성균관대학교: { 제1캠퍼스: '서울캠퍼스', 제2캠퍼스: '수원캠퍼스' },
    연세대학교: { 제1캠퍼스: '신촌캠퍼스', 제2캠퍼스: '국제캠퍼스' },
    경희대학교: { 제1캠퍼스: '서울캠퍼스', 제2캠퍼스: '국제캠퍼스' },
    중앙대학교: { 제1캠퍼스: '서울캠퍼스', 제2캠퍼스: '안성캠퍼스' },
    한국외국어대학교: { 제1캠퍼스: '서울캠퍼스', 제2캠퍼스: '글로벌캠퍼스' },
    단국대학교: { 제1캠퍼스: '죽전캠퍼스', 제2캠퍼스: '천안캠퍼스' },
    부산대학교: {
      제1캠퍼스: '부산캠퍼스',
      제2캠퍼스: '밀양캠퍼스',
      제3캠퍼스: '양산캠퍼스'
    },
    강원대학교: { 제1캠퍼스: '춘천캠퍼스', 제2캠퍼스: '삼척캠퍼스' }
  }

  const REGION_SHORT: Record<string, string> = {
    서울특별시: '서울',
    경기도: '경기',
    인천광역시: '인천',
    부산광역시: '부산',
    대구광역시: '대구',
    광주광역시: '광주',
    대전광역시: '대전',
    울산광역시: '울산',
    세종특별자치시: '세종',
    강원특별자치도: '강원',
    충청북도: '충북',
    충청남도: '충남',
    전라남도: '전남',
    전북특별자치도: '전북',
    경상북도: '경북',
    경상남도: '경남',
    제주특별자치도: '제주'
  }

  const getUniversityDisplayName = (
    uni: (typeof filteredUniversities)[number]
  ) => {
    const hasDuplicate =
      filteredUniversities.filter((u) => u.nameKr === uni.nameKr).length > 1
    if (!hasDuplicate) {
      return uni.nameKr
    }

    const override = CAMPUS_OVERRIDES[uni.nameKr]?.[uni.campus ?? '']
    if (override) {
      return `${uni.nameKr} ${override}`
    }

    const sameRegion =
      filteredUniversities.filter(
        (u) => u.nameKr === uni.nameKr && u.region === uni.region
      ).length > 1
    if (sameRegion) {
      return `${uni.nameKr} ${uni.campus}`
    }

    const short = REGION_SHORT[uni.region] ?? uni.region
    return `${uni.nameKr} ${short}캠퍼스`
  }

  const canSubmit =
    isUserIdAvailable &&
    emailVerified &&
    agreements.terms &&
    agreements.privacy &&
    agreements.minorPrivacy

  const getUserIdBorderClass = () => {
    if (errors.userId) {
      return 'border-error focus:border-error'
    }
    return 'focus:border-primary border-line'
  }

  const getEmailBorderClass = () => {
    if (errors.email) {
      return 'border-error focus:border-error'
    }
    if (emailVerified) {
      return 'border-primary focus:border-primary'
    }
    return 'focus:border-primary border-line'
  }

  const JOB_TYPE_MAP: Record<string, string> = {
    대학생: 'CollegeStudent',
    고등학생: 'HighSchoolStudent',
    직장인: 'Employee',
    기타: 'Other'
  }

  const onSubmit = async (data: SignUpFormValues) => {
    if (!canSubmit) {
      return
    }
    if (data.job === '대학생' && !data.university) {
      setError('university', { message: '대학교를 선택해주세요' })
      return
    }
    if (isSKKU && !data.major) {
      setError('major', { message: '소속 학과를 선택해주세요' })
      return
    }
    try {
      await safeFetcher.post('user/sign-up', {
        headers: { 'email-auth': emailAuthToken },
        json: {
          username: data.userId,
          password: data.password,
          email: data.email,
          realName: data.name,
          nickname: data.nickname || randomNameGenerator(),
          jobType: JOB_TYPE_MAP[data.job],
          college: data.university || undefined,
          major: data.major || undefined,
          studentId: data.studentId || undefined
        }
      })
      toast.success('회원가입이 완료됐습니다!')
      router.push('/login')
    } catch {
      toast.error('회원가입에 실패했습니다. 다시 시도해주세요')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="border-color-cool-neutral-90 flex w-[500px] flex-col items-start rounded-[16px] border bg-white px-6 py-7"
    >
      <div className="flex w-full flex-col gap-[48px]">
        <div className="flex w-full flex-col gap-5">
          <div className="flex w-full items-center justify-between">
            <p className="text-head5_sb_24">회원가입</p>
            <Link href="/login" className="text-sub2_m_18 whitespace-nowrap">
              <span className="text-primary">기존 회원</span>
              <span className="text-black">이신가요?</span>
            </Link>
          </div>

          <div className="flex w-full flex-col gap-6">
            <div className="flex w-full flex-col gap-1">
              <label className="text-caption2_m_12">이름</label>
              <input
                type="text"
                placeholder="이름"
                className={cn(
                  'placeholder:text-body1_m_16 placeholder:text-color-neutral-90 h-[46px] w-full rounded-[12px] border bg-white px-5 py-[11px] outline-none',
                  errors.name
                    ? 'border-error focus:border-error'
                    : 'focus:border-primary border-line'
                )}
                {...register('name')}
              />
              {errors.name?.message && (
                <p className="text-caption3_r_13 text-color-red-50">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="flex w-full flex-col gap-1">
              <label className="text-caption2_m_12">아이디</label>
              <div className="flex gap-[6px]">
                <input
                  type="text"
                  placeholder="아이디"
                  className={cn(
                    'placeholder:text-body1_m_16 placeholder:text-color-neutral-90 h-[46px] w-full rounded-[12px] border bg-white px-5 py-[11px] outline-none',
                    getUserIdBorderClass()
                  )}
                  {...register('userId')}
                />
                <button
                  type="button"
                  onClick={checkUserId}
                  disabled={!watchUserId || watchUserId.length < 3}
                  className="text-sub3_sb_16 border-primary text-primary h-[46px] shrink-0 rounded-[12px] border px-4 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  중복 확인
                </button>
              </div>
              {errors.userId?.message && (
                <p className="text-caption3_r_13 text-color-red-50">
                  {errors.userId.message}
                </p>
              )}
              {!errors.userId &&
                !isCheckingUserId &&
                touchedFields.userId &&
                !isUserIdAvailable &&
                watchUserId.length >= 3 && (
                  <p className="text-caption3_r_13 text-color-red-50">
                    아이디 중복 확인을 해주세요
                  </p>
                )}
              {!errors.userId && isUserIdAvailable && (
                <p className="text-caption4_r_12 text-primary">
                  사용 가능한 아이디입니다
                </p>
              )}
            </div>

            <div className="flex w-full flex-col gap-2">
              <label className="text-caption2_m_12">비밀번호</label>
              <div className="flex w-full flex-col gap-[6px]">
                <div className="relative">
                  <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    placeholder="영문자, 숫자 포함 8-20자"
                    className={cn(
                      'placeholder:text-body1_m_16 placeholder:text-color-neutral-90 h-[46px] w-full rounded-[12px] border bg-white px-5 py-[11px] outline-none',
                      errors.password
                        ? 'border-error focus:border-error'
                        : 'focus:border-primary border-line'
                    )}
                    {...register('password')}
                  />
                  <VisibleButton
                    isVisible={isPasswordVisible}
                    setIsVisible={setIsPasswordVisible}
                  />
                </div>
                {errors.password?.message && (
                  <p className="text-caption3_r_13 text-color-red-50">
                    {errors.password.message}
                  </p>
                )}
                <div className="relative">
                  <input
                    type={isPasswordVisible ? 'text' : 'password'}
                    placeholder="비밀번호 확인"
                    className={cn(
                      'placeholder:text-body1_m_16 placeholder:text-color-neutral-90 h-[46px] w-full rounded-[12px] border bg-white px-5 py-[11px] outline-none',
                      isPasswordMismatch
                        ? 'border-error focus:border-error'
                        : 'focus:border-primary border-line'
                    )}
                    {...register('passwordConfirm')}
                  />
                  <VisibleButton
                    isVisible={isPasswordVisible}
                    setIsVisible={setIsPasswordVisible}
                  />
                </div>
                {isPasswordMismatch && (
                  <p className="text-caption3_r_13 text-color-red-50">
                    비밀번호가 일치하지 않습니다
                  </p>
                )}
                {isPasswordAvailable && (
                  <p className="text-caption3_r_13 text-primary">
                    사용 가능한 비밀번호입니다
                  </p>
                )}
              </div>
            </div>

            <div className="flex w-full flex-col gap-1">
              <label className="text-caption2_m_12">닉네임</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="희망찬 올빼미"
                    className="placeholder:text-body1_m_16 focus:border-primary border-line placeholder:text-color-neutral-90 h-[46px] w-full rounded-[12px] border bg-white px-5 py-[11px] pr-[52px] outline-none"
                    {...register('nickname')}
                  />
                  <button
                    type="button"
                    onClick={generateNickname}
                    className="text-color-cool-neutral-60 hover:text-primary absolute inset-y-0 right-5 flex items-center"
                    aria-label="닉네임 자동 생성"
                  >
                    <Image
                      src={resetGray}
                      alt="닉네임 재생성"
                      width={20}
                      height={20}
                    />
                  </button>
                </div>
              </div>
              {!watchNickname && (
                <p className="text-caption3_r_13 text-color-cool-neutral-60">
                  * 닉네임 미입력시, 코드당이 자동으로 닉네임을 추천해드려요!
                </p>
              )}
            </div>

            <div className="flex w-full flex-col gap-1">
              <label className="text-caption2_m_12">직업</label>
              <div
                className="relative"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setJobOpen(false)
                  }
                }}
                tabIndex={-1}
              >
                <button
                  type="button"
                  onClick={() => setJobOpen((prev) => !prev)}
                  className={cn(
                    'placeholder:text-body1_m_16 flex h-[46px] w-full items-center justify-between rounded-[12px] border bg-white py-[11px] pl-5 pr-4 outline-none',
                    errors.job
                      ? 'border-error'
                      : 'focus:border-primary border-line'
                  )}
                >
                  <span
                    className={
                      watchJob ? 'text-black' : 'text-color-neutral-90'
                    }
                  >
                    {watchJob || '직업'}
                  </span>
                  {jobOpen ? (
                    <FaChevronUp
                      className="text-color-cool-neutral-60"
                      size={14}
                    />
                  ) : (
                    <FaChevronDown
                      className="text-color-cool-neutral-60"
                      size={14}
                    />
                  )}
                </button>
                {jobOpen && (
                  <ul className="border-line absolute z-10 mt-1 w-full overflow-hidden rounded-[12px] border bg-white shadow-md">
                    {JOB_OPTIONS.map((option) => (
                      <li
                        key={option}
                        tabIndex={0}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setValue('job', option, { shouldValidate: true })
                          if (option !== '대학생') {
                            setValue('university', '')
                            setValue('major', '')
                            setUniversityQuery('')
                          }
                          setJobOpen(false)
                        }}
                        className={cn(
                          'text-body1_m_16 hover:bg-color-neutral-99 cursor-pointer px-5 py-[13px]',
                          watchJob === option && 'bg-fill'
                        )}
                      >
                        {option}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {errors.job?.message && (
                <p className="text-caption3_r_13 text-color-red-50">
                  {errors.job.message}
                </p>
              )}
            </div>

            {watchJob === '대학생' && (
              <div className="flex w-full flex-col gap-3">
                <div className="flex w-full flex-col gap-1">
                  <label className="text-caption2_m_12">대학교</label>
                  <div
                    className="relative"
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setUniversityOpen(false)
                      }
                    }}
                    tabIndex={-1}
                  >
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="대학교 검색"
                        value={universityQuery}
                        onChange={(e) => {
                          setUniversityQuery(e.target.value)
                          setUniversityOpen(true)
                          if (watchUniversity) {
                            setValue('university', '', { shouldValidate: true })
                          }
                        }}
                        onFocus={() => setUniversityOpen(true)}
                        className="placeholder:text-body1_m_16 focus:border-primary border-line placeholder:text-color-neutral-90 h-[46px] w-full rounded-[12px] border bg-white px-5 py-[11px] pr-11 outline-none"
                      />
                      <IoSearchOutline
                        className="text-color-cool-neutral-60 absolute right-4 top-1/2 -translate-y-1/2"
                        size={18}
                      />
                    </div>
                    {universityOpen && universityQuery.length > 0 && (
                      <ul className="border-line absolute z-10 mt-1 max-h-[200px] w-full overflow-y-auto rounded-[12px] border bg-white shadow-md">
                        {filteredUniversities.length > 0 ? (
                          filteredUniversities.map((uni) => {
                            const displayName = getUniversityDisplayName(uni)
                            return (
                              <li
                                key={uni.id}
                                tabIndex={0}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setValue('university', displayName, {
                                    shouldValidate: true
                                  })
                                  setUniversityQuery(displayName)
                                  setUniversityOpen(false)
                                }}
                                className={cn(
                                  'text-body1_m_16 hover:bg-color-neutral-99 cursor-pointer px-5 py-[13px]',
                                  watchUniversity === displayName && 'bg-fill'
                                )}
                              >
                                {displayName}
                              </li>
                            )
                          })
                        ) : (
                          <li className="text-body1_m_16 text-color-cool-neutral-60 px-5 py-[13px]">
                            검색 결과가 없습니다
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                  {errors.university?.message && (
                    <p className="text-caption3_r_13 text-color-red-50">
                      {errors.university.message}
                    </p>
                  )}
                </div>

                {isSKKU && (
                  <div className="flex w-full flex-col gap-1">
                    <label className="text-caption2_m_12">학과</label>
                    <div
                      className="relative"
                      onBlur={(e) => {
                        if (
                          !e.currentTarget.contains(e.relatedTarget as Node)
                        ) {
                          setMajorOpen(false)
                        }
                      }}
                      tabIndex={-1}
                    >
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="학과 검색"
                          value={majorQuery}
                          onChange={(e) => {
                            setMajorQuery(e.target.value)
                            setMajorOpen(true)
                            setValue('major', '', { shouldValidate: true })
                          }}
                          onFocus={() => setMajorOpen(true)}
                          className="placeholder:text-body1_m_16 focus:border-primary border-line placeholder:text-color-neutral-90 h-[46px] w-full rounded-[12px] border bg-white px-5 py-[11px] pr-11 outline-none"
                        />
                        <IoSearchOutline
                          className="text-color-cool-neutral-60 absolute right-4 top-1/2 -translate-y-1/2"
                          size={18}
                        />
                      </div>
                      {majorOpen && majorQuery.length > 0 && (
                        <ul className="border-line absolute z-10 mt-1 max-h-[200px] w-full overflow-y-auto rounded-[12px] border bg-white shadow-md">
                          {filteredMajors.length > 0 ? (
                            filteredMajors.map((major) => {
                              const displayName = getKoreanMajorName(major)
                              return (
                                <li
                                  key={major}
                                  tabIndex={0}
                                  onMouseDown={(e) => e.preventDefault()}
                                  onClick={() => {
                                    setValue('major', displayName, {
                                      shouldValidate: true
                                    })
                                    setMajorQuery(displayName)
                                    setMajorOpen(false)
                                  }}
                                  className={cn(
                                    'text-body1_m_16 hover:bg-color-neutral-99 cursor-pointer px-5 py-[13px]',
                                    majorQuery === displayName && 'bg-fill'
                                  )}
                                >
                                  {displayName}
                                </li>
                              )
                            })
                          ) : (
                            <li className="text-body1_m_16 text-color-cool-neutral-60 px-5 py-[13px]">
                              검색 결과가 없습니다
                            </li>
                          )}
                        </ul>
                      )}
                    </div>
                    {errors.major?.message && (
                      <p className="text-caption3_r_13 text-color-red-50">
                        {errors.major.message}
                      </p>
                    )}
                  </div>
                )}

                {isSKKU && (
                  <div className="flex w-full flex-col gap-1">
                    <label className="text-caption2_m_12">학번</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="학번 10자리를 입력해주세요"
                      className={cn(
                        'placeholder:text-body1_m_16 placeholder:text-color-neutral-90 h-[46px] w-full rounded-[12px] border bg-white px-5 py-[11px] outline-none',
                        errors.studentId
                          ? 'border-error focus:border-error'
                          : 'focus:border-primary border-line'
                      )}
                      {...register('studentId')}
                    />
                    {errors.studentId?.message && (
                      <p className="text-caption3_r_13 text-color-red-50">
                        {errors.studentId.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex w-full flex-col gap-[6px]">
              <label className="text-caption2_m_12">이메일</label>
              <div className="flex gap-[6px]">
                {isSKKU ? (
                  <div
                    className={cn(
                      'flex h-[46px] min-w-0 flex-1 items-center gap-1 rounded-[12px] border bg-white px-5',
                      getEmailBorderClass()
                    )}
                  >
                    <input
                      type="text"
                      placeholder="codedang"
                      value={emailLocal}
                      onChange={(e) => setEmailLocal(e.target.value)}
                      disabled={emailVerified}
                      className="placeholder:text-body1_m_16 placeholder:text-color-neutral-90 min-w-0 flex-1 bg-transparent outline-none"
                    />
                    <span className="text-body1_m_16 text-color-neutral-30 shrink-0">
                      @skku.edu
                    </span>
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="이메일을 입력해주세요"
                    value={emailLocal}
                    onChange={(e) => setEmailLocal(e.target.value)}
                    disabled={emailVerified}
                    className={cn(
                      'placeholder:text-body1_m_16 placeholder:text-color-neutral-90 h-[46px] min-w-0 flex-1 rounded-[12px] border bg-white px-5 py-[11px] outline-none',
                      getEmailBorderClass()
                    )}
                  />
                )}
                <button
                  type="button"
                  onClick={sendEmail}
                  disabled={!emailLocal || emailVerified}
                  className="text-sub3_sb_16 border-primary text-primary h-[46px] shrink-0 rounded-[12px] border px-4 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {emailSent && !codeExpired && !emailVerified
                    ? '재발송'
                    : '인증 하기'}
                </button>
              </div>
              {errors.email?.message && (
                <p className="text-caption3_r_13 text-color-red-50">
                  {errors.email.message}
                </p>
              )}
              {emailVerified && (
                <p className="text-caption3_r_13 text-primary">
                  이메일 인증이 완료되었습니다
                </p>
              )}

              {emailSent && !emailVerified && (
                <div className="mt-1 flex gap-[6px]">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="메일로 도착한 인증 번호를 입력해주세요"
                      value={verificationCode}
                      onChange={(e) => {
                        const val = e.target.value
                          .replace(/\D/g, '')
                          .slice(0, 6)
                        setVerificationCode(val)
                        setPinError('')
                      }}
                      disabled={codeExpired}
                      className={cn(
                        'placeholder:text-body1_m_16 placeholder:text-color-neutral-90 h-[46px] w-full rounded-[12px] border bg-white px-5 py-[11px] pr-20 outline-none',
                        pinError || codeExpired
                          ? 'border-error focus:border-error'
                          : 'focus:border-primary border-line'
                      )}
                    />
                    {!codeExpired && (
                      <span className="text-caption3_r_13 text-color-red-50 absolute right-4 top-1/2 -translate-y-1/2">
                        {formatTimer()}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => verifyPin(verificationCode)}
                    disabled={verificationCode.length !== 6 || codeExpired}
                    className="text-sub3_sb_16 bg-primary h-[46px] shrink-0 rounded-[12px] px-4 text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    인증 확인
                  </button>
                </div>
              )}
              {codeExpired && (
                <p className="text-caption3_r_13 text-color-red-50">
                  인증 코드가 만료되었습니다. 재발송 버튼을 눌러주세요
                </p>
              )}
              {pinError && (
                <p className="text-caption3_r_13 text-color-red-50">
                  {pinError}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-12">
          <div className="flex w-full flex-col gap-[10px]">
            <div className="border-line border-b pb-[10px]">
              <AgreementCheckbox
                checked={isAllChecked}
                onChange={handleAllAgreementChange}
              >
                전체동의
              </AgreementCheckbox>
            </div>

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
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              'text-sub3_sb_16 flex h-[52px] w-full items-center justify-center rounded-[12px] transition-colors',
              canSubmit
                ? 'bg-primary hover:bg-primary-strong text-white'
                : 'bg-color-neutral-95 text-color-neutral-70 cursor-not-allowed'
            )}
          >
            가입하기
          </button>
        </div>
      </div>
    </form>
  )
}
