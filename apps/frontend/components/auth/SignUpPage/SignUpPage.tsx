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
    <div className="flex w-full flex-col gap-2">
      <label className="text-caption2_m_12">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="placeholder:text-body1_m_16 h-[46px] w-full rounded-[12px] border border-[#D8D8D8] bg-white px-5 py-[11px] outline-none placeholder:text-[#C4C4C4]"
      />
    </div>
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
          <p className="text-[24px] font-semibold text-black">회원가입</p>
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
            <label className="text-caption2_m_12 flex items-center gap-[6px]">
              <input
                type="checkbox"
                checked={isAllChecked}
                onChange={(e) => handleAllAgreementChange(e.target.checked)}
              />
              <span>전체동의</span>
            </label>

            <div className="border-b border-[#D8D8D8]" />
            <label className="text-caption2_m_12 flex items-center gap-[6px]">
              <input
                type="checkbox"
                checked={agreements.terms}
                onChange={(e) =>
                  handleAgreementChange('terms', e.target.checked)
                }
              />
              <span>이용약관 동의</span>
            </label>
            <label className="text-caption2_m_12 flex items-center gap-[6px]">
              <input
                type="checkbox"
                checked={agreements.privacy}
                onChange={(e) =>
                  handleAgreementChange('privacy', e.target.checked)
                }
              />
              <span>코드당 개인정보 수집 및 이용 동의</span>
            </label>
            <label className="text-caption2_m_12 flex items-center gap-[6px]">
              <input
                type="checkbox"
                checked={agreements.minorPrivacy}
                onChange={(e) =>
                  handleAgreementChange('minorPrivacy', e.target.checked)
                }
              />
              <span>14세미만 개인정보 이용 보호</span>
            </label>
            <label className="text-caption2_m_12 flex items-center gap-[6px]">
              <input
                type="checkbox"
                checked={agreements.marketing}
                onChange={(e) =>
                  handleAgreementChange('marketing', e.target.checked)
                }
              />
              <span>[선택] 마케팅 활용 동의 및 광고 수신 동의</span>
            </label>
          </div>

          <button className="text-sub3_sb_16 flex h-[52px] w-full items-center justify-center rounded-[12px] bg-[#E5E5E5] text-[#9B9B9B]">
            가입하기
          </button>
        </div>
      </div>
    </div>
  )
}
