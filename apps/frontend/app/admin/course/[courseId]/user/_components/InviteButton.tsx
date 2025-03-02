'use client'

import { ErrorMessage } from '@/app/admin/_components/ErrorMessage'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogTrigger,
  AlertDialogDescription
} from '@/components/shadcn/alert-dialog'
import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { Separator } from '@/components/shadcn/separator'
import { Switch } from '@/components/shadcn/switch'
import { TooltipProvider, TooltipTrigger } from '@/components/shadcn/tooltip'
import { CREATE_WHITE_LIST, DELETE_WHITE_LIST } from '@/graphql/course/mutation'
import { GET_COURSE, GET_WHITE_LIST } from '@/graphql/course/queries'
import {
  INVITE_USER,
  ISSUE_INVITATION,
  REVOKE_INVITATION
} from '@/graphql/user/mutation'
import { fetcherWithAuth } from '@/libs/utils'
import type { MemberRole } from '@/types/type'
import { useMutation, useQuery } from '@apollo/client'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { Tooltip, TooltipContent } from '@radix-ui/react-tooltip'
import { useCallback, useEffect, useState } from 'react'
import { CSVLink } from 'react-csv'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { FiPlusCircle, FiX } from 'react-icons/fi'
import { IoCloudUpload, IoCopyOutline } from 'react-icons/io5'
import { MdHelpOutline, MdOutlineEmail } from 'react-icons/md'
import { RxReload } from 'react-icons/rx'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { findUserSchema, inviteUserSchema } from '../_libs/schema'

/**
 * 어드민 테이블의 삭제 버튼 컴포넌트
 * @desctiption 선택된 행들을 삭제하는 기능
 * @param target
 * 삭제 대상 (problem or contest)
 * @param deleteTarget
 * 아이디를 전달받아 삭제 요청하는 함수
 * @param getCanDelete
 * 선택된 행들이 삭제 가능한지를 반환하는 함수
 * @param onSuccess
 * 삭제 성공 시 호출되는 함수
 * @param className
 * tailwind 클래스명
 */

interface InviteButtonProps {
  onSuccess: () => void
  params: {
    courseId: number
  }
}

export function InviteButton({ onSuccess, params }: InviteButtonProps) {
  const { courseId } = params
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false)

  const handleOpenChange = (isOpen: boolean) => {
    setIsAlertDialogOpen(isOpen)
    if (!isOpen) {
      onSuccess() // 다이얼로그가 닫힐 때 실행
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsAlertDialogOpen(true)}
        className="flex gap-2"
      >
        <FiPlusCircle />
        Invite
      </Button>
      <AlertDialog open={isAlertDialogOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent className="max-w-lg p-8">
          <AlertDialogCancel className="absolute right-4 top-4 border-none">
            <FiX className="h-5 w-5" />
          </AlertDialogCancel>
          <AlertDialogHeader>
            <AlertDialogTitle className="mb-4 text-xl">Invite</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex flex-col gap-3">
            <InviteManually courseId={courseId} />
            <Separator className="my-6" />
            <InviteByCode courseId={courseId} />
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

interface InviteUserInput {
  groupId: number
  userId: number
  isGroupLeader: boolean
}

interface FindUserInput {
  email: string
}

interface InviteManuallyProps {
  courseId: number
}

interface UserInfo {
  userName: string
  id: number
}

function InviteManually({ courseId }: InviteManuallyProps) {
  const roles: MemberRole[] = ['Instructor', 'Student']
  const [userId, setUserId] = useState(0)
  const [invitedList, setInvitedList] = useState<string[]>([''])

  const [inviteUser] = useMutation(INVITE_USER)

  const onFind: SubmitHandler<FindUserInput> = async (data) => {
    const res = await fetcherWithAuth('user/email', {
      searchParams: {
        email: data.email
      }
    })
    if (res.ok) {
      const userInfo: UserInfo = await res.json()
      setUserId(userInfo.id)
    } else {
      toast.error('Failed to find user')
    }
  }

  const onInvite: SubmitHandler<InviteUserInput> = useCallback(
    async (data) => {
      console.log('onInvite')

      const updatePromise = inviteUser({
        variables: {
          groupId: courseId,
          isGroupLeader: data.isGroupLeader,
          userId
        }
      })

      try {
        const result = await updatePromise
        setInvitedList((prevList) => [
          ...prevList,
          `${result.data?.inviteUser.user.email} - ${result.data?.inviteUser.isGroupLeader ? 'Instructor' : 'Student'}`
        ])
        toast.success('Success to invite user')
      } catch {
        toast.error('Failed to invite user')
      }
    },
    [inviteUser, courseId, userId, setInvitedList] // 의존성 배열 설정
  )
  // email검증
  const {
    register: findRegister,
    handleSubmit: findHandleSubmit,
    formState: { errors: findErrors }
  } = useForm<FindUserInput>({
    resolver: valibotResolver(findUserSchema)
  })

  // 실제invite
  const {
    watch: inviteWatch,
    handleSubmit: inviteHandleSubmit,
    setValue: inviteSetValue,
    formState: { errors: inviteErrors }
  } = useForm<InviteUserInput>({
    resolver: valibotResolver(inviteUserSchema),
    defaultValues: {
      userId,
      groupId: courseId,
      isGroupLeader: false
    }
  })

  useEffect(() => {
    if (userId !== 0) {
      inviteHandleSubmit(onInvite)()
    }
  }, [inviteHandleSubmit, onInvite, userId])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        findHandleSubmit(onFind)()
      }}
      aria-label="Invite user"
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-2">
        <span className="text-base font-bold">Invite Manually</span>
        <div className="mt-4 flex justify-start gap-4">
          <div className="flex flex-col">
            <div className="flex justify-between">
              <div className="flex items-center rounded-lg border border-gray-300 px-2">
                <MdOutlineEmail className="h-8 w-12 text-gray-400" />
                <Input
                  id="email"
                  {...findRegister('email')}
                  placeholder="Email Address"
                  className="border-none"
                />

                <Select
                  value={
                    inviteWatch('isGroupLeader') ? 'Instructor' : 'Student'
                  }
                  onValueChange={(value) => {
                    inviteSetValue('isGroupLeader', value === 'Instructor')
                  }}
                >
                  <SelectTrigger className="border-none text-gray-500">
                    <SelectValue>
                      {inviteWatch('isGroupLeader') ? 'Instructor' : 'Student'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-md border border-none bg-white shadow-md">
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {invitedList.length > 1 && (
              <div className="flex flex-col rounded-md border border-gray-300">
                {invitedList.map((user) => (
                  <span key={user} className="ml-3 p-1 text-gray-500">
                    {user}
                  </span>
                ))}
              </div>
            )}
          </div>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary-strong ml-2 px-5"
          >
            Invite
          </Button>
        </div>
        {findErrors.email && (
          <ErrorMessage message={findErrors.email.message} />
        )}
        {inviteErrors.groupId && (
          <ErrorMessage message={inviteErrors.groupId.message} />
        )}
        {inviteErrors.userId && (
          <ErrorMessage message={inviteErrors.userId.message} />
        )}
        {inviteErrors.isGroupLeader && (
          <ErrorMessage message={inviteErrors.isGroupLeader.message} />
        )}
      </div>
    </form>
  )
}

interface InviteByCodeProps {
  courseId: number
}

interface InvitationCodeInput {
  issueInvitation: string
}

function InviteByCode({ courseId }: InviteByCodeProps) {
  const [isInviteByCodeEnabled, setIsInviteByCodeEnabled] = useState(false) // 기본값: 숨김
  const [isApprovalRequired, setIsApprovalRequired] = useState(false)
  const [issueInvitation] = useMutation(ISSUE_INVITATION)
  const [revokeInvitation] = useMutation(REVOKE_INVITATION)
  const [createWhitelist] = useMutation(CREATE_WHITE_LIST)
  const [deleteWhitelist] = useMutation(DELETE_WHITE_LIST, {
    refetchQueries: [
      { query: GET_WHITE_LIST, variables: { groupId: courseId } }
    ]
  })
  const [isUploaded, setIsUploaded] = useState(false)
  const [studentIds, setstudentIds] = useState<string[]>([])
  const [whitelistCount, setWhitelistCount] = useState<number | null>(null)
  const [fileName, setFileName] = useState<string>('Whitelist.csv')
  const [isRevokeInvitationModalOpen, setIsRevokeInvitationModalOpen] =
    useState(false)
  const [isDeleteWhitelistModalOpen, setIsDeleteWhitelistModalOpen] =
    useState(false)

  useQuery(GET_WHITE_LIST, {
    variables: { groupId: courseId },
    onCompleted: (data) => {
      setstudentIds(data?.getWhitelist)
      setIsApprovalRequired(data?.getWhitelist.length > 0)
    }
  })

  useQuery(GET_COURSE, {
    variables: { groupId: courseId },
    onCompleted: (data) => {
      setIsInviteByCodeEnabled(Boolean(data?.getCourse.invitation))
      if (data?.getCourse.invitation) {
        reset({
          issueInvitation: data.getCourse.invitation
        })
      }
    }
  })

  const { register, getValues, reset } = useForm<InvitationCodeInput>()

  const handleUpdateButtonClick = async () => {
    try {
      const result = await issueInvitation({ variables: { groupId: courseId } })

      if (result.data) {
        const data = result.data.issueInvitation
        console.log('Issue Invitation:', data)
        reset({
          issueInvitation: data
        })
      }
    } catch (error) {
      console.error('Issue invitation error:', error)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }
    setFileName(file.name.replace(/\.[^/.]+$/, '.csv')) // 파일 이름 저장

    const reader = new FileReader()
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const sheet = workbook.Sheets[sheetName]

      // Excel 데이터를 JSON 형태로 변환
      const jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })

      // 첫 번째 행을 헤더로 설정
      const headers = jsonData[0].map((header: string) => header.trim()) // 공백 제거
      const dataRows = jsonData.slice(1) // 실제 데이터 행

      // "studentId" 컬럼 찾기 (유동적으로)
      const studentIdIndex = headers.findIndex((header) =>
        header.includes('studentId')
      )

      if (studentIdIndex === -1) {
        toast.error("Cannot find 'studentId' Column")
        return
      }

      // studentId 데이터만 추출 (문자열에서 숫자만 추출)
      const studentIdList = Array.from(
        new Set(
          dataRows
            .map((row) => row[studentIdIndex]?.toString() ?? '') // null 또는 undefined 방지
            .filter((id) => id.trim() !== '') // 빈 문자열 제거
        )
      )

      setstudentIds(studentIdList ?? [])
      /** 화이트리스트 생성 요청 */
      try {
        const { data } = await createWhitelist({
          variables: { groupId: courseId, studentIds: studentIdList }
        })
        console.log(data)
        setWhitelistCount(data?.createWhitelist ?? 0)
        setIsUploaded(true)
        console.log(data?.createWhitelist)
      } catch (error) {
        console.error('Create white list error:', error)
      }
    }

    reader.readAsArrayBuffer(file)
  }

  useEffect(() => {
    if (isUploaded && whitelistCount) {
      toast.success(`${whitelistCount} studentIds are registered.`)
      console.log(courseId)
    }
  }, [courseId, isUploaded, whitelistCount])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        handleUpdateButtonClick()
      }}
      aria-label="Invite user"
      className="flex flex-col gap-3"
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <span className="text-base font-bold">Invite by Invitation Code</span>
          <Switch
            checked={isInviteByCodeEnabled}
            onCheckedChange={(checked) => {
              if (!checked) {
                setIsRevokeInvitationModalOpen(true)
              } else {
                handleUpdateButtonClick()
                setIsInviteByCodeEnabled(true)
              }
            }} // 상태 토글
          />
        </div>
        <AlertDialog
          open={isRevokeInvitationModalOpen}
          onOpenChange={setIsRevokeInvitationModalOpen}
        >
          <AlertDialogContent className="p-8">
            <AlertDialogHeader>
              <AlertDialogTitle className="mb-4 text-xl">
                Disable Invitation Code
              </AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogDescription>
              Students will no longer be able to join the course using the
              invitation code.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel className="px-4 py-2 text-neutral-400">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction asChild>
                <Button
                  type="button"
                  onClick={async () => {
                    await revokeInvitation({ variables: { groupId: courseId } })
                    setIsInviteByCodeEnabled(false)
                    setIsRevokeInvitationModalOpen(false)
                  }}
                >
                  Ok
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {isInviteByCodeEnabled && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-start gap-4">
              <Input
                id="issueInvitation"
                className="w-[194px]"
                readOnly
                {...register('issueInvitation')}
              />
              <div className="flex gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      className="bg-primary hover:bg-primary-strong px-6"
                    >
                      <RxReload size={17} strokeWidth={0.5} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-lg p-8">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="mb-4 text-xl">
                        Update Invitation Code
                      </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                      The previous invitation code will no longer be available.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="px-4 py-2 text-neutral-400">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button
                          type="button"
                          onClick={() => handleUpdateButtonClick()}
                        >
                          Ok
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  type="button"
                  className="bg-primary hover:bg-primary-strong px-6"
                  onClick={() => {
                    const invitationCode = getValues('issueInvitation') // 현재 입력된 값 가져오기
                    toast.success('Copied Successfully')
                    navigator.clipboard.writeText(invitationCode) // 클립보드에 복사
                  }}
                >
                  <IoCopyOutline
                    size={20}
                    className="h-5 w-5 stroke-current text-white drop-shadow-md filter"
                  />
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {/* <span className="text-sm font-bold">Invitation Code Setting</span> */}
              <div className="flex gap-2">
                <span className="text-sm font-bold">
                  Only approved accounts can enter
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button">
                        <MdHelpOutline className="text-gray-400 hover:text-gray-700" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="mb-2 bg-white px-4 py-2 text-xs font-normal shadow-md"
                    >
                      When you upload a file, the existing whitelist is{' '}
                      <span className="font-medium">deleted</span> and replaced.
                      <br />
                      You can download the sample file{' '}
                      <a href="/Whitelist_Sample.csv" className="text-primary">
                        here
                      </a>
                      .
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Switch
                  checked={isApprovalRequired}
                  onCheckedChange={(checked) => {
                    if (!checked) {
                      if (studentIds.length > 0) {
                        setIsDeleteWhitelistModalOpen(true)
                      } else {
                        setIsApprovalRequired(false)
                      }
                    } else {
                      setIsApprovalRequired(true)
                    }
                  }}
                />
                <AlertDialog
                  open={isDeleteWhitelistModalOpen}
                  onOpenChange={setIsDeleteWhitelistModalOpen}
                >
                  <AlertDialogContent className="max-w-lg p-8">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="mb-4 text-xl">
                        Disable Student Whitelist
                      </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription>
                      The student ID whitelist will be deleted, and anyone will
                      be able to join the course with an invitation code.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="px-4 py-2 text-neutral-400">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button
                          type="button"
                          onClick={async () => {
                            await deleteWhitelist({
                              variables: { groupId: courseId }
                            })
                            setstudentIds([])
                            setIsApprovalRequired(false)
                            setIsDeleteWhitelistModalOpen(false)
                          }}
                        >
                          Ok
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {isApprovalRequired && (
                <div className="flex flex-col gap-2">
                  {studentIds.length > 0 && (
                    <span className="text-xs">
                      Current Whitelist:{' '}
                      <CSVLink
                        data={studentIds.map((id) => ({ studentId: id }))}
                        headers={[{ label: 'studentId', key: 'studentId' }]}
                        filename={fileName}
                        className="text-primary mb-2 text-xs"
                      >
                        {fileName}
                      </CSVLink>
                    </span>
                  )}
                  <label className="flex cursor-pointer items-center gap-2">
                    <IoCloudUpload size={20} />
                    <span className="text-xs">Upload File (Excel)</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".csv, .xlsx, .xls"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
