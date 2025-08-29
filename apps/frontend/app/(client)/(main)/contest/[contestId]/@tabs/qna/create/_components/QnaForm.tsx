'use client'

import { AlertModal } from '@/components/AlertModal'
import { fetcherWithAuth } from '@/libs/utils'
import infoBlueIcon from '@/public/icons/icon-info-blue.svg'
import type {
  ContestTop,
  ProblemDataTop,
  ProblemOption,
  QnaFormData
} from '@/types/type'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useSession } from 'next-auth/react'
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
  const { data: session } = useSession()

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
  const [permissionModalOpen, setPermissionModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [problemOptions, setProblemOptions] = useState<ProblemOption[]>([
    { value: '', label: 'General' }
  ])
  const [isLoadingProblems, setIsLoadingProblems] = useState(true)
  const [isContestStarted, setIsContestStarted] = useState(false)
  const [contest, setContest] = useState<ContestTop | null>(null)
  const [canCreateQnA, setCanCreateQnA] = useState(false)
  const [isPrivilegedRole, setIsPrivilegedRole] = useState(false)

  const watchedValues = watch()

  const isFormValid =
    watchedValues.title?.trim().length > 0 &&
    watchedValues.content?.trim().length > 0 &&
    isValid

  useEffect(() => {
    // 로그인하지 않은 사용자는 바로 리다이렉션
    if (!session) {
      router.push(`/contest/${contestId}/qna`)
      return
    }

    const checkPermissionAndFetch = async () => {
      try {
        const contestResponse = await fetcherWithAuth.get(
          `contest/${contestId}`
        )

        if (!contestResponse.ok) {
          router.push(`/contest/${contestId}/qna`)
          return
        }

        const contestData: ContestTop = await contestResponse.json()

        const now = new Date()
        const startTime = new Date(contestData.startTime)
        const endTime = new Date(contestData.endTime)
        const contestStarted = now >= startTime
        const isOngoing = now >= startTime && now < endTime

        // 권한 체크
        const canCreate =
          session &&
          (contestData.isRegistered ||
            contestData.isPrivilegedRole ||
            !isOngoing)

        // 권한이 없으면 바로 리다이렉션 (에러 없이)
        if (!canCreate) {
          router.push(`/contest/${contestId}/qna`)
          return
        }

        // 권한이 있는 경우에만 상태 설정 및 문제 로딩
        setContest(contestData)
        setIsContestStarted(contestStarted)
        setCanCreateQnA(canCreate)
        setIsPrivilegedRole(contestData.isPrivilegedRole)

        // 문제 목록 가져오기
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
          setProblemOptions([{ value: '', label: 'General' }])
        }
      } catch (error) {
        console.error('Error:', error)
        router.push(`/contest/${contestId}/qna`)
      } finally {
        setIsLoadingProblems(false)
      }
    }

    checkPermissionAndFetch()
  }, [contestId, session, router])

  const handlePostClick = () => {
    if (!canCreateQnA) {
      setPermissionModalOpen(true)
      return
    }

    if (isFormValid) {
      setModalOpen(true)
    }
  }

  const gotoQuestionList = () => {
    router.push(`/contest/${contestId}/qna`)
  }

  const handleSubmit = async () => {
    if (!canCreateQnA) {
      setPermissionModalOpen(true)
      return
    }

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

  // 로딩 중이거나 로그인하지 않은 경우 (리다이렉션 처리 중)
  if (!session || isLoadingProblems || !contest) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-2xl font-bold">Redirecting...</div>
      </div>
    )
  }

  return (
    <>
      <div className="mb-[30px] flex items-center">
        <h1 className="font-pretendard text-2xl font-medium leading-[28.8px] tracking-[-0.72px] text-black">
          Post New Question
        </h1>
      </div>

      <div className="flex min-h-[36px] w-full items-center gap-[14px] rounded-[1000px] border border-[#D8D8D8] bg-[#FFFFFF] px-[30px] py-[11px]">
        <ProblemSelector
          watch={watch}
          isLoadingProblems={isLoadingProblems}
          isDropdownOpen={isDropdownOpen}
          onToggleDropdown={() => setIsDropdownOpen(!isDropdownOpen)}
        />
        <Title control={control} />
      </div>

      {!isContestStarted && !isLoadingProblems && !isPrivilegedRole && (
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
        isPrivilegedRole={isPrivilegedRole}
        isContestStarted={isContestStarted}
      />

      <Content control={control} watch={watch} />

      <SubmitButton
        isFormValid={isFormValid}
        isLoadingProblems={isLoadingProblems}
        onSubmit={handlePostClick}
        canCreateQnA={canCreateQnA}
      />

      {/* 질문 제출 확인 모달 */}
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

      {/* 권한 없음 모달 */}
      <AlertModal
        open={permissionModalOpen}
        onOpenChange={setPermissionModalOpen}
        size="sm"
        title="Permission Required"
        description="You don't have permission to create questions in this contest. Please check your registration status or contact the contest organizer."
        onClose={() => setPermissionModalOpen(false)}
        primaryButton={{
          text: 'Go to Q&A List',
          onClick: gotoQuestionList
        }}
        type="warning"
      />
    </>
  )
}
