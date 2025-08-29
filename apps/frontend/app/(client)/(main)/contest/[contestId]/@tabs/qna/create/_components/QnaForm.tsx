'use client'

import { AlertModal } from '@/components/AlertModal'
import { fetcherWithAuth } from '@/libs/utils'
import infoBlueIcon from '@/public/icons/icon-info-blue.svg'
import type {
  Contest,
  ProblemDataTop,
  ProblemOption,
  QnaFormData
} from '@/types/type'
import { valibotResolver } from '@hookform/resolvers/valibot'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as v from 'valibot'
import { Content } from './Content'
import { ProblemDropdown } from './ProblemDropdown'
import { ProblemSelector } from './ProblemSelector'
import { SubmitButton } from './SubmitButton'
import { Title } from './Title'

const schema = v.object({
  title: v.pipe(v.string(), v.trim()),
  content: v.pipe(v.string(), v.trim()),
  selectedProblem: v.string(),
  selectedProblemLabel: v.string()
})

export function QnaForm() {
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
    <>
      <div className="flex min-h-[36px] w-full items-center gap-[14px] rounded-[1000px] border border-[#D8D8D8] bg-[#FFFFFF] px-[30px] py-[11px]">
        <ProblemSelector
          watch={watch}
          isLoadingProblems={isLoadingProblems}
          isDropdownOpen={isDropdownOpen}
          onToggleDropdown={() => setIsDropdownOpen(!isDropdownOpen)}
        />
        <Title control={control} />
      </div>

      {!isContestStarted && !isLoadingProblems && (
        <div className="mt-[4px] flex">
          <Image
            src={infoBlueIcon}
            alt="info"
            width={16}
            height={16}
            className="ml-2 mr-[2px]"
          />
          <span className="text-primary text-xs font-normal leading-[16.8px] tracking-[-0.36px]">
            Contest has not started yet. Only General questions are available.
          </span>
        </div>
      )}

      <ProblemDropdown
        watch={watch}
        setValue={setValue}
        problemOptions={problemOptions}
        isOpen={isDropdownOpen && !isLoadingProblems}
        onClose={() => setIsDropdownOpen(false)}
      />

      <Content control={control} watch={watch} />

      <SubmitButton
        isFormValid={isFormValid}
        isLoadingProblems={isLoadingProblems}
        onSubmit={handlePostClick}
      />

      <AlertModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        size="sm"
        title="Question Submit"
        description={`Are you sure you want to submit this question?\nOnce submitted, you cannot edit it.`}
        onClose={() => setModalOpen(false)}
        primaryButton={{
          text: isSubmitting ? 'Submitting...' : 'Confirm',
          onClick: handleSubmit
        }}
        type="confirm"
      />
    </>
  )
}
