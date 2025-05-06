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
import { Switch } from '@/components/shadcn/switch'
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
import { useCallback, useEffect, useState } from 'react'
import { CSVLink } from 'react-csv'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { FaCirclePlus } from 'react-icons/fa6'
import { FiX } from 'react-icons/fi'
import { IoCloudUpload, IoCopyOutline } from 'react-icons/io5'
import { MdOutlineEmail } from 'react-icons/md'
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
      onSuccess()
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setIsAlertDialogOpen(true)}
        className="flex items-center gap-2"
      >
        <FaCirclePlus />
        Invite
      </Button>
      <AlertDialog open={isAlertDialogOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent className="flex h-[693px] w-[580px] flex-col overflow-hidden">
          <AlertDialogCancel className="absolute right-4 top-4 border-none">
            <FiX className="h-5 w-5" />
          </AlertDialogCancel>
          <div className="flex justify-center">
            <h2 className="m-0 mb-[28px] pt-[60px] text-center text-xl font-bold">
              Invite Member
            </h2>
          </div>

          <div className="flex flex-1 flex-col gap-6 overflow-hidden px-4">
            <InviteByCode
              courseId={courseId}
              isAlertDialogOpen={isAlertDialogOpen}
            />
            <InviteManually courseId={courseId} />
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

type InvitedUserDisplay = {
  email: string
  role: 'Instructor' | 'Student'
}

function InviteManually({ courseId }: InviteManuallyProps) {
  const roles: MemberRole[] = ['Instructor', 'Student']
  const [userId, setUserId] = useState(0)

  const [invitedList, setInvitedList] = useState<InvitedUserDisplay[]>([])
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
      toast.success('Invited Successfully !', {
        style: {
          background: '#F0F8FF',
          color: '#0973DC',
          borderRadius: '1000px',
          border: '1px solid rgba(255, 255, 255, 0.10)',
          maxWidth: '200px'
        },
        closeButton: false
      })
    } else {
      toast.error('Failed to find user')
    }
  }

  const onInvite: SubmitHandler<InviteUserInput> = useCallback(
    async (data) => {
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
          {
            email: result.data?.inviteUser.user.email ?? '',
            role: result.data?.inviteUser.isGroupLeader
              ? 'Instructor'
              : 'Student'
          }
        ])
      } catch {
        toast.error('Failed to invite user')
      }
    },
    [inviteUser, courseId, userId, setInvitedList]
  )

  const {
    register: findRegister,
    handleSubmit: findHandleSubmit,
    formState: { errors: findErrors }
  } = useForm<FindUserInput>({
    resolver: valibotResolver(findUserSchema)
  })

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
    <div className="flex flex-1 flex-col overflow-hidden">
      <form
        onSubmit={(event) => {
          event.preventDefault()
          findHandleSubmit(onFind)()
        }}
        aria-label="Invite user"
        className="flex flex-col gap-4"
      >
        <span className="text-base font-bold">Invite Manually</span>

        <div className="flex w-full max-w-[500px] flex-col gap-4">
          <div className="flex h-[44px] items-center rounded-full border border-gray-300 px-4 py-2">
            <MdOutlineEmail className="h-5 w-5 text-gray-400" />

            <Input
              id="email"
              {...findRegister('email')}
              placeholder="Email Address"
              className="flex-1 border-none !bg-transparent pl-2 text-sm placeholder:text-gray-400 autofill:!bg-transparent focus:outline-none focus:ring-0 focus-visible:border-none focus-visible:outline-none focus-visible:ring-0"
            />

            <Select
              value={inviteWatch('isGroupLeader') ? 'Instructor' : 'Student'}
              onValueChange={(value) => {
                inviteSetValue('isGroupLeader', value === 'Instructor')
              }}
            >
              <SelectTrigger className="w-auto min-w-[80px] border-none bg-transparent text-sm text-gray-500 focus:outline-none">
                <SelectValue placeholder="Student" />
              </SelectTrigger>
              <SelectContent className="rounded-lg bg-white shadow-md">
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            className="bg-primary hover:bg-primary-strong h-[44px] w-full rounded-full text-sm font-semibold text-white"
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
      </form>

      {/* 초대 유저 리스트 영역 */}
      {invitedList.length > 0 && (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto pt-2">
          {invitedList.map((user) => (
            <div
              key={user.email}
              className="flex h-[42px] w-full items-start justify-between rounded-full bg-gray-100 px-[24px] py-[10px]"
            >
              <span className="text-sm text-gray-800">{user.email}</span>
              <span className="text-sm text-gray-400">{user.role}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface InviteByCodeProps {
  courseId: number
  isAlertDialogOpen: boolean
}

interface InvitationCodeInput {
  issueInvitation: string
}

function InviteByCode({ courseId, isAlertDialogOpen }: InviteByCodeProps) {
  const [isInviteByCodeEnabled, setIsInviteByCodeEnabled] = useState(false)
  const [isApprovalRequired, setIsApprovalRequired] = useState(false)
  const [issueInvitation] = useMutation(ISSUE_INVITATION)
  const [revokeInvitation] = useMutation(REVOKE_INVITATION)
  const [createWhitelist] = useMutation(CREATE_WHITE_LIST, {
    refetchQueries: [
      { query: GET_WHITE_LIST, variables: { groupId: courseId } }
    ]
  })
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

  const { refetch: refetchWhiteList } = useQuery(GET_WHITE_LIST, {
    variables: { groupId: courseId },
    onCompleted: (data) => {
      setstudentIds(data?.getWhitelist)
      setIsApprovalRequired(data?.getWhitelist.length > 0)
    }
  })
  const { refetch: refetchInvitationCode } = useQuery(GET_COURSE, {
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

  useEffect(() => {
    if (isAlertDialogOpen) {
      refetchWhiteList()
      refetchInvitationCode()
    }
  }, [isAlertDialogOpen, refetchInvitationCode, refetchWhiteList])

  const { getValues, reset } = useForm<InvitationCodeInput>()

  const handleUpdateButtonClick = async () => {
    try {
      const result = await issueInvitation({ variables: { groupId: courseId } })

      if (result.data) {
        const data = result.data.issueInvitation
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
        setWhitelistCount(data?.createWhitelist ?? 0)
        setIsUploaded(true)
      } catch (error) {
        console.error('Create white list error:', error)
      }
    }

    reader.readAsArrayBuffer(file)
  }

  useEffect(() => {
    if (isUploaded && whitelistCount) {
      toast.success(`${whitelistCount} studentIds are registered.`)
    }
  }, [courseId, isUploaded, whitelistCount])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        handleUpdateButtonClick()
      }}
      aria-label="Invite user"
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col gap-4">
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
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 pl-10">
              {getValues('issueInvitation')
                ?.split('')
                .map((char, index) => (
                  <div
                    key={index}
                    className="flex h-[42px] w-[42px] items-center justify-center rounded bg-gray-100 text-lg text-[#5C5C5C]"
                  >
                    {char}
                  </div>
                ))}
              <div className="flex gap-2">
                <Button
                  type="button"
                  className="flex h-[42px] w-[60px] items-center justify-center rounded-[21px] bg-[#3581FA]"
                  onClick={() => {
                    const invitationCode = getValues('issueInvitation')
                    toast.success('Copied Successfully !', {
                      style: {
                        background: '#F0F8FF',
                        color: '#0973DC',
                        borderRadius: '1000px',
                        border: '1px solid rgba(255, 255, 255, 0.10)',
                        maxWidth: '200px'
                      },
                      closeButton: false
                    })
                    navigator.clipboard.writeText(invitationCode)
                  }}
                >
                  <IoCopyOutline size={20} className="text-white" />
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {/* <span className="text-sm font-bold">Invitation Code Setting</span> */}
              <div className="flex items-center gap-4">
                <span className="text-sm text-[#5C5C5C]">
                  Only approved accounts can enter
                </span>

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
                  <ul className="list-inside list-disc text-xs text-[#8A8A8A]">
                    <li>
                      When you upload a new file, the existing whitelist is
                      deleted and replaced.
                      <div className="pl-4">
                        You can download the sample file{' '}
                        <a
                          href="/Whitelist_Sample.csv"
                          className="text-primary underline"
                        >
                          here
                        </a>
                        .
                      </div>
                    </li>
                    <li>
                      Current Whitelist:{' '}
                      <CSVLink
                        data={studentIds.map((id) => ({ studentId: id }))}
                        headers={[{ label: 'studentId', key: 'studentId' }]}
                        filename={fileName}
                        className="text-primary underline"
                      >
                        {fileName}
                      </CSVLink>
                    </li>
                  </ul>

                  <div className="flex w-full">
                    <label className="flex w-[500px] cursor-pointer items-center justify-center gap-[10px] rounded-full border border-[#D8D8D8] bg-white px-[28px] py-[12px]">
                      <IoCloudUpload size={20} className="text-gray-700" />
                      <span className="text-sm font-medium text-gray-700">
                        Upload File (Excel)
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".csv, .xlsx, .xls"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
