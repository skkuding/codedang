'use client'

import { AlertModal } from '@/components/AlertModal'
import { Button } from '@/components/shadcn/button'
import { Card, CardContent } from '@/components/shadcn/card'
import { Textarea } from '@/components/shadcn/textarea'
import { fetcherWithAuth } from '@/libs/utils'
import penIcon from '@/public/icons/pen.svg'
import type { ProblemDataTop, Contest } from '@/types/type'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { toast } from 'sonner'
import * as v from 'valibot'

interface QnaFormData {
  title: string
  content: string
  selectedProblem: string
  selectedProblemLabel: string
}

interface ProblemOption {
  value: string
  label: string
}

const schema = v.object({
  title: v.pipe(v.string(), v.trim()),
  content: v.pipe(v.string(), v.trim()),
  selectedProblem: v.string(),
  selectedProblemLabel: v.string()
})

export default function Page() {
  const params = useParams()
  const router = useRouter()
  const contestId = params.contestId as string

  const {
    control,
    watch,
    setValue,
    getValues,
    formState: { isValid }
  } = useForm<QnaFormData>({
    resolver: valibotResolver(schema),
    defaultValues: {
      title: '',
      content: '',
      selectedProblem: '',
      selectedProblemLabel: 'General'
    },
    mode: 'onChange'
  })

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [problemOptions, setProblemOptions] = useState<ProblemOption[]>([
    { value: '', label: 'General' }
  ])
  const [isLoadingProblems, setIsLoadingProblems] = useState(true)
  const [isContestStarted, setIsContestStarted] = useState(false)

  const watchedValues = watch()
  const contentLength = watchedValues.content?.length || 0

  const isFormValid =
    watchedValues.title?.trim().length > 0 &&
    watchedValues.content?.trim().length > 0 &&
    isValid

  useEffect(() => {
    const fetchContestAndProblems = async () => {
      try {
        setIsLoadingProblems(true)

        const contestResponse = await fetcherWithAuth.get(
          `contest/${contestId}`
        )

        if (!contestResponse.ok) {
          console.error('Failed to fetch contest info')
          toast.error('Failed to load contest information')
          return
        }

        const contestData: Contest = await contestResponse.json()
        const now = new Date()
        const startTime = new Date(contestData.startTime)
        const contestStarted = now >= startTime

        setIsContestStarted(contestStarted)

        if (!contestStarted) {
          setProblemOptions([{ value: '', label: 'General' }])
          setIsLoadingProblems(false)
          return
        }

        const problemResponse = await fetcherWithAuth.get(
          `contest/${contestId}/problem`
        )

        if (problemResponse.ok) {
          const problemData: ProblemDataTop = await problemResponse.json()

          const options: ProblemOption[] = [
            { value: '', label: 'General' },
            ...problemData.data.map((problem, index) => ({
              value: problem.order.toString(),
              label: `${String.fromCharCode(65 + index)}. ${problem.title}`
            }))
          ]

          setProblemOptions(options)
        } else {
          console.error('Failed to fetch problems')
          toast.error('Failed to load problems')
        }
      } catch (error) {
        console.error('Error fetching contest/problems:', error)
        toast.error('An error occurred while loading data')
      } finally {
        setIsLoadingProblems(false)
      }
    }

    fetchContestAndProblems()
  }, [contestId])

  const handleProblemSelect = (value: string, label: string) => {
    setValue('selectedProblem', value, { shouldValidate: true })
    setValue('selectedProblemLabel', label, { shouldValidate: true })
    setIsDropdownOpen(false)
  }

  const handlePostClick = () => {
    if (isFormValid) {
      setModalOpen(true)
    }
  }

  const gotoQuestionList = () => {
    router.push(`/contest/${contestId}/qna`)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      const formData = getValues()
      console.log('Submitting form data:', formData)

      const requestBody = {
        title: formData.title.trim(),
        content: formData.content.trim()
      }

      let apiUrl = `contest/${contestId}/qna`
      if (formData.selectedProblem !== '') {
        apiUrl += `?problem-order=${formData.selectedProblem}`
      }

      const response = await fetcherWithAuth.post(apiUrl, {
        json: requestBody
      })

      if (response.ok) {
        console.log('QnA created successfully')
        toast.success('Question submitted successfully')
        setModalOpen(false)
        gotoQuestionList()
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Failed to create QnA:', errorData)
        toast.error('Failed to submit question')
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('An error occurred while submitting the question')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex w-[1440px] flex-col px-[116px] pt-[80px]">
      <div className="mb-[30px] flex items-center">
        <h1 className="font-pretendard text-2xl font-medium leading-[120%] tracking-[-0.72px] text-black">
          Post New Question
        </h1>
      </div>

      <div className="mb-[10px] flex min-h-[36px] w-full items-center gap-[14px] rounded-[1000px] border border-[#D8D8D8] bg-[#FFFFFF] px-[30px] py-[11px]">
        <div className="flex">
          <div
            className="flex max-w-[86px] cursor-pointer items-center border-r border-[#D8D8D8] bg-white pr-[10px]"
            onClick={() =>
              !isLoadingProblems && setIsDropdownOpen(!isDropdownOpen)
            }
          >
            <span className="font-pretendard mr-[6px] !w-[54px] overflow-hidden truncate text-base font-medium not-italic leading-[22.4px] tracking-[-0.48px] text-[#5C5C5C]">
              {isLoadingProblems
                ? 'Loading...'
                : watchedValues.selectedProblemLabel}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-[#C4C4C4] ${isDropdownOpen ? 'rotate-270' : ''} transition-transform ${isLoadingProblems ? 'opacity-50' : ''}`}
            />
          </div>
        </div>
        <div className="flex w-full !p-0">
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                id="title"
                placeholder="Enter a question title"
                className="font-pretendard h-[24px] min-h-[24px] resize-none truncate border-none p-0 text-base font-normal leading-[22px] tracking-[-0.48px] text-[#5C5C5C] shadow-none ring-0 placeholder:text-[#C4C4C4] focus:placeholder:text-transparent focus-visible:ring-0"
                maxLength={35}
                rows={1}
              />
            )}
          />
        </div>
      </div>

      {!isContestStarted && !isLoadingProblems && (
        <div className="mb-2 text-xs text-gray-500">
          Contest has not started yet. Only General questions are available.
        </div>
      )}

      {isDropdownOpen && !isLoadingProblems && (
        <Card className="mb-[10px] w-full">
          <CardContent className="flex flex-col gap-3 rounded-[12px] p-5">
            {problemOptions.map((option) => (
              <div
                key={option.value}
                className="flex cursor-pointer items-center space-x-[14px] rounded p-1 hover:bg-gray-50"
                onClick={() => handleProblemSelect(option.value, option.label)}
              >
                <input
                  type="radio"
                  name="problem-select"
                  value={option.value}
                  checked={watchedValues.selectedProblem === option.value}
                  onChange={() => {}}
                  className="h-4 w-4 text-blue-600"
                />
                <label
                  className={`font-pretendard cursor-pointer truncate text-sm font-normal not-italic leading-normal tracking-[-0.42px] ${
                    watchedValues.selectedProblem === option.value
                      ? 'text-[#3581FA]'
                      : 'text-black'
                  }`}
                >
                  {option.label}
                </label>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="mb-[40px] flex min-h-[280px] w-full flex-col gap-[10px] rounded-[12px] border border-[#D8D8D8] p-[30px]">
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              id="content"
              placeholder="Enter a question"
              className="font-pretendard h-full min-h-[188px] resize-none !border-none !p-0 text-base font-normal not-italic leading-normal tracking-[-0.48px] text-[#5C5C5C] shadow-none placeholder:text-[#C4C4C4] focus:placeholder:text-transparent focus-visible:ring-0"
              maxLength={400}
            />
          )}
        />
        <div className="font-pretendard h-[22px] w-full text-right text-base font-medium not-italic leading-[140%] tracking-[-0.48px] text-[#B0B0B0]">
          {`${contentLength}/400`}
        </div>
      </div>

      <Button
        onClick={handlePostClick}
        className="mb-[120px] flex h-[46px] w-full items-center justify-center gap-[6px] !px-6 !py-3"
        disabled={!isFormValid || isLoadingProblems}
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
        description="Your question has been successfully submitted.\nOur team will review it and respond shortly."
        onClose={() => setModalOpen(false)}
        primaryButton={{
          text: isSubmitting ? 'Submitting...' : 'Confirm',
          onClick: handleSubmit
        }}
        type="confirm"
      />
    </div>
  )
}
