'use client'

import { AlertModal } from '@/components/AlertModal'
import { Button } from '@/components/shadcn/button'
import { Card, CardContent } from '@/components/shadcn/card'
import { Input } from '@/components/shadcn/input'
import { Textarea } from '@/components/shadcn/textarea'
import penIcon from '@/public/icons/pen.svg'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface DetailQnaProps {
  onBackToList: () => void
}

export function DetailQna({ onBackToList }: DetailQnaProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedProblem, setSelectedProblem] = useState('')
  const [selectedProblemLabel, setSelectedProblemLabel] = useState('General')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const problemOptions = [
    { value: '', label: 'General' },
    { value: '1', label: 'A. 데이터가 EVEN 하지 않아요' },
    { value: '2', label: 'B. 수열 문제(였던 것)' },
    { value: '3', label: 'C. 구간을 적당히 나눠주세요' },
    { value: '4', label: 'D. 가파른 경사' },
    { value: '5', label: 'E. 평지' },
    { value: '6', label: 'F. 엘리베이터' },
    { value: '7', label: 'G. 글자 수 노출' },
    { value: '8', label: 'H. 최고난이도 문제' },
    { value: '9', label: 'I. 트리 읽기' },
    { value: '10', label: 'J. 가장 쉬운 문제' },
    { value: '11', label: 'K. 격자 (Easy)' },
    { value: '12', label: 'L. 격자 (Hard)' }
  ]

  const handleProblemSelect = (value: string, label: string) => {
    setSelectedProblem(value)
    setSelectedProblemLabel(label)
    setIsDropdownOpen(false)
  }

  const handlePost = () => {
    setModalOpen(true)
  }

  const gotoQuestionList = () => {
    onBackToList()
  }

  return (
    <div className="flex w-[1440px] flex-col px-[116px] pt-[80px]">
      {/* Header */}
      <div className="mb-[30px] flex items-center">
        <h1 className="font-pretendard text-2xl font-medium leading-[120%] tracking-[-0.72px] text-black">
          Post New Question
        </h1>
      </div>

      <div className="mb-[10px] flex min-h-[36px] w-full items-center gap-[14px] rounded-[1000px] border border-[#D8D8D8] bg-[#FFFFFF] px-[30px] py-[11px]">
        <div className="flex">
          <div
            className="flex max-w-[86px] items-center border-r border-[#D8D8D8] bg-white pr-[10px]"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="font-pretendard mr-[6px] !w-[54px] overflow-hidden truncate text-base font-medium not-italic leading-[22.4px] tracking-[-0.48px] text-[#5C5C5C]">
              {selectedProblemLabel}
            </span>
            <ChevronDown className={`h-4 w-4 text-[#C4C4C4]`} />
          </div>
        </div>
        <div className="flex w-full !p-0">
          <Input
            id="title"
            placeholder="Enter a question title"
            value={title}
            maxLength={70}
            onChange={(e) => setTitle(e.target.value)}
            className="font-pretendard truncate border-none p-0 text-base font-normal leading-[24px] tracking-[-0.48px] text-[#5C5C5C] caret-transparent ring-0 placeholder:text-[#C4C4C4] focus:placeholder:text-transparent focus-visible:ring-0"
          />
        </div>
      </div>
      {isDropdownOpen && (
        <Card className="mb-[10px] w-full">
          <CardContent className="flex flex-col gap-3 rounded-[12px] p-5">
            {problemOptions.map((option) => (
              <div
                key={option.value}
                className="flex items-center space-x-[14px]"
                onClick={() => handleProblemSelect(option.value, option.label)}
              >
                <input
                  type="radio"
                  name="problem-select"
                  value={option.value}
                  checked={selectedProblem === option.value}
                  onChange={() => {}} // Controlled by onClick
                  className="h-4 w-4 text-blue-600"
                />
                <label
                  className={`font-pretendard truncate text-sm font-normal not-italic leading-normal tracking-[-0.42px] ${selectedProblem === option.value ? 'text-[#3581FA]' : 'text-black'}`}
                >
                  {option.label}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
      <div className="mb-[40px] flex min-h-[280px] w-full flex-col gap-[10px] rounded-[12px] border border-[#D8D8D8] p-[30px]">
        <Textarea
          id="content"
          placeholder="Enter a question"
          value={content}
          maxLength={400}
          onChange={(e) => setContent(e.target.value)}
          className="font-pretendard h-full min-h-[188px] resize-none !border-none !p-0 text-base font-normal not-italic leading-normal tracking-[-0.48px] text-[#5C5C5C] shadow-none placeholder:text-[#C4C4C4] focus:placeholder:text-transparent focus-visible:ring-0"
        />
        <div className="font-pretendard h-[22px] w-full text-right text-base font-medium not-italic leading-[140%] tracking-[-0.48px] text-[#B0B0B0]">{`${content.length}/400`}</div>
      </div>
      <Button
        className="mb-[120px] flex h-[46px] w-full items-center justify-center gap-[6px] !px-6 !py-3"
        onClick={() => {
          handlePost()
        }}
      >
        <Image src={penIcon} alt="pen" width={16} height={16} />
        <span className="font-pretendard text-base font-medium not-italic leading-[140%] tracking-[-0.48px] text-white">
          Post
        </span>
      </Button>
      <AlertModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        size="sm"
        title="Question Submit"
        description="Your question has been successfully submitted. Our team will review it and respond shortly."
        onClose={() => setModalOpen(false)}
        primaryButton={{
          text: 'Confirm',
          onClick: gotoQuestionList
        }}
        type="confirm"
      />
    </div>
  )
}
