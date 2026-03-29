'use client'

import asteriskGray from '@/public/icons/asterisk-gray.svg'
import Image from 'next/image'
import { useState } from 'react'

interface SignUpFieldProps {
  label: string
  type?: string
  placeholder: string
}

export function SignUpField({
  label,
  type = 'text',
  placeholder
}: SignUpFieldProps) {
  return (
    <div className="flex w-full flex-col gap-1">
      <label className="text-caption2_m_12">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="placeholder:text-body1_m_16 h-[46px] w-full rounded-[12px] border border-[#D8D8D8] bg-white px-5 py-[11px] outline-none placeholder:text-[#C4C4C4]"
      />
    </div>
  )
}
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

type Agreements = {
  terms: boolean
  privacy: boolean
  minorPrivacy: boolean
  marketing: boolean
}

export function SignUpPage() {
  const [agreements, setAgreements] = useState<Agreements>({
    terms: false,
    privacy: false,
    minorPrivacy: false,
    marketing: false
  })

  const isAllChecked =
    agreements.terms &&
    agreements.privacy &&
    agreements.minorPrivacy &&
    agreements.marketing

  const handleAllAgreementChange = (checked: boolean) => {
    setAgreements({
      terms: checked,
      privacy: checked,
      minorPrivacy: checked,
      marketing: checked
    })
  }

  const handleAgreementChange = (key: keyof Agreements, checked: boolean) => {
    setAgreements((prev) => ({
      ...prev,
      [key]: checked
    }))
  }

  return (
    <div className="flex w-[500px] flex-col items-start rounded-[20px] border border-[#DCE3E5] bg-white px-6 py-7 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
      <div className="flex w-full flex-col gap-[48px]">
        <div className="flex w-full flex-col gap-5">
          <p className="text-head5_sb_24">회원가입</p>
          <div className="flex w-full flex-col gap-6">
            <SignUpField label="이름" type="text" placeholder="이름" />
            <SignUpField
              label="생년월일 6자리"
              type="text"
              placeholder="YYMMDD"
            />
            <SignUpField label="아이디" type="text" placeholder="아이디" />
            <div className="flex w-full flex-col gap-2">
              <label className="text-caption2_m_12">비밀번호</label>

              <div className="flex w-full flex-col gap-[6px]">
                <input
                  type="password"
                  placeholder="영문자, 숫자, 특수문자 포함 8-20자"
                  className="placeholder:text-body1_m_16 h-[46px] w-full rounded-[12px] border border-[#D8D8D8] bg-white px-5 py-[11px] outline-none placeholder:text-[#C4C4C4]"
                />
                <input
                  type="password"
                  placeholder="비밀번호 확인"
                  className="placeholder:text-body1_m_16 h-[46px] w-full rounded-[12px] border border-[#D8D8D8] bg-white px-5 py-[11px] outline-none placeholder:text-[#C4C4C4]"
                />
              </div>
            </div>
            <div className="flex w-full flex-col gap-[9px]">
              <SignUpField
                label="닉네임"
                type="text"
                placeholder="신나는 청사과"
              />
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
            <SignUpField label="직업" type="text" placeholder="직업" />
            <SignUpField
              label="이메일"
              type="text"
              placeholder="codedang@codedang.com"
            />
            <SignUpField
              label="전화번호"
              type="text"
              placeholder="010-1234-5678"
            />
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

          <button className="text-sub3_sb_16 flex h-[52px] w-full items-center justify-center rounded-[12px] bg-[#E5E5E5] text-[#9B9B9B]">
            가입하기
          </button>
        </div>
      </div>
    </div>
  )
}
