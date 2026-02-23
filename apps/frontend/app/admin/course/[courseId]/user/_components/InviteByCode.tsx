import { AlertModal } from '@/components/AlertModal'
import { Button } from '@/components/shadcn/button'
import { Switch } from '@/components/shadcn/switch'
import { CREATE_WHITE_LIST, DELETE_WHITE_LIST } from '@/graphql/course/mutation'
import { GET_COURSE, GET_WHITE_LIST } from '@/graphql/course/queries'
import { ISSUE_INVITATION, REVOKE_INVITATION } from '@/graphql/user/mutation'
import { useMutation, useQuery } from '@apollo/client'
import { useTranslate } from '@tolgee/react'
import { useEffect, useState } from 'react'
import { CSVLink } from 'react-csv'
import { useForm } from 'react-hook-form'
import { IoCloudUpload, IoCopyOutline } from 'react-icons/io5'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

interface InviteByCodeProps {
  courseId: string
}

interface InvitationCodeInput {
  invitationCode: string
}

export function InviteByCode({ courseId }: InviteByCodeProps) {
  const { t } = useTranslate()
  const { getValues, reset } = useForm<InvitationCodeInput>()
  const [issueInvitation] = useMutation(ISSUE_INVITATION)
  const [revokeInvitation] = useMutation(REVOKE_INVITATION)

  const [isCodeInvitationEnabled, setIsCodeInvitationEnabled] = useState(false)
  const [isWhiteListEnabled, setIsWhiteListEnabled] = useState(false)
  const [isRevokeInvitationModalOpen, setIsRevokeInvitationModalOpen] =
    useState(false)

  const [isUploaded, setIsUploaded] = useState(false)
  const [whiteListStudentIds, setWhiteListStudentIds] = useState<string[]>([])
  const [whitelistCount, setWhitelistCount] = useState<number | null>(null)
  const [fileName, setFileName] = useState<string>(
    t('whitelist_default_filename')
  )

  const [isDeleteWhitelistModalOpen, setIsDeleteWhitelistModalOpen] =
    useState(false)

  useQuery(GET_WHITE_LIST, {
    variables: { groupId: Number(courseId) },
    onCompleted: (data) => {
      setWhiteListStudentIds(data?.getWhitelist)
      setIsWhiteListEnabled(Boolean(data?.getWhitelist?.length))
    },
    onError: (error) => {
      toast.error(`Failed to fetch whitelist: ${error.message}`)
    }
  })
  useQuery(GET_COURSE, {
    variables: { groupId: Number(courseId) },
    onCompleted: (data) => {
      setIsCodeInvitationEnabled(Boolean(data?.getCourse.invitation))
      if (data?.getCourse.invitation) {
        reset({
          invitationCode: data.getCourse.invitation
        })
      }
    },
    onError: (error) => {
      toast.error(
        t('failed_to_fetch_invitation_code_error', { error: error.message })
      )
    }
  })

  const updateInvitationCode = async () => {
    try {
      const { data } = await issueInvitation({
        variables: { groupId: Number(courseId) }
      })
      if (data?.issueInvitation) {
        reset({ invitationCode: data.issueInvitation })
      }
    } catch (error) {
      console.error(
        t('failed_to_update_invitation_code_error', {
          error: (error as Error).message
        })
      )
    }
  }

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
        toast.error(t('cannot_find_student_id_column_error'))
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

      setWhiteListStudentIds(studentIdList ?? [])
      /** 화이트리스트 생성 요청 */
      try {
        const { data } = await createWhitelist({
          variables: {
            groupId: Number(courseId),
            studentIds: studentIdList
          }
        })
        setWhitelistCount(data?.createWhitelist ?? 0)
        setIsUploaded(true)
      } catch (error) {
        console.error(
          t('create_white_list_error', { error: (error as Error).message })
        )
      }
    }

    reader.readAsArrayBuffer(file)
  }

  useEffect(() => {
    if (isUploaded && whitelistCount) {
      toast.success(
        t('whitelist_registered_success_message', { count: whitelistCount })
      )
    }
  }, [courseId, isUploaded, whitelistCount, t])

  return (
    <div className="flex flex-col gap-[30px] rounded-lg border p-[30px]">
      <div className="flex items-center gap-[10px]">
        <span className="text-lg">{t('invite_by_invitation_code_label')}</span>
        <Switch
          checked={isCodeInvitationEnabled}
          onCheckedChange={(checked) => {
            if (!checked) {
              setIsRevokeInvitationModalOpen(true)
            } else {
              updateInvitationCode()
              setIsCodeInvitationEnabled(true)
            }
          }}
        />
      </div>
      {isCodeInvitationEnabled && (
        <>
          <div className="flex items-center justify-center gap-2 pl-10">
            {getValues('invitationCode')
              ?.split('')
              .map((char, index) => (
                <div
                  key={index}
                  className="rounded-xs flex h-[42px] w-[42px] items-center justify-center bg-gray-100 text-lg text-[#5C5C5C]"
                >
                  {char}
                </div>
              ))}
            <Button
              type="button"
              className="bg-primary flex h-[36px] w-[72px] rounded-full"
              onClick={() => {
                const invitationCode = getValues('invitationCode')
                toast.success(t('copied_successfully_message'), {
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
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-[10px]">
              <span className="text-base text-[#5C5C5C]">
                {t('only_approved_accounts_can_enter_label')}
              </span>
              <Switch
                checked={isWhiteListEnabled}
                onCheckedChange={(checked) => {
                  if (!checked) {
                    if (whiteListStudentIds.length > 0) {
                      setIsDeleteWhitelistModalOpen(true)
                    } else {
                      setIsWhiteListEnabled(false)
                    }
                  } else {
                    setIsWhiteListEnabled(true)
                  }
                }}
              />
              <AlertModal
                open={isDeleteWhitelistModalOpen}
                onOpenChange={setIsDeleteWhitelistModalOpen}
                type="warning"
                title={t('disable_student_whitelist_title')}
                description={t('disable_student_whitelist_description')}
                primaryButton={{
                  text: t('ok_button'),
                  onClick: async () => {
                    await deleteWhitelist({
                      variables: { groupId: Number(courseId) }
                    })
                    setWhiteListStudentIds([])
                    setIsWhiteListEnabled(false)
                  },
                  variant: 'default'
                }}
              />
            </div>
            {isWhiteListEnabled && (
              <div className="bg-fill flex flex-col gap-[18px] rounded-lg p-[20px]">
                <ul className="list-inside list-disc space-y-2.5 text-sm text-[#8A8A8A]">
                  <li>
                    {t('upload_new_file_warning')}
                    <div className="pl-5">
                      {t('download_sample_file_prompt')}{' '}
                      <a
                        href="/Whitelist_Sample.csv"
                        download="Whitelist_Sample.csv"
                        className="text-primary underline"
                      >
                        {t('download_here_link')}
                      </a>
                    </div>
                  </li>
                  <li>
                    {t('current_whitelist_label')}{' '}
                    <CSVLink
                      data={whiteListStudentIds.map((id) => ({
                        studentId: id
                      }))}
                      headers={[{ label: 'studentId', key: 'studentId' }]}
                      filename={fileName}
                      className="text-primary underline"
                    >
                      {fileName}
                    </CSVLink>
                  </li>
                </ul>
                <label className="flex h-[40px] w-full cursor-pointer items-center justify-center gap-[10px] rounded-full border border-[#D8D8D8] bg-white px-[28px] py-[12px]">
                  <IoCloudUpload size={20} className="text-gray-700" />
                  <span className="text-sm font-medium text-gray-700">
                    {t('upload_file_excel_label')}
                  </span>
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
        </>
      )}
      <AlertModal
        type="warning"
        title={t('disable_invitation_code_title')}
        description={t('disable_invitation_code_description')}
        primaryButton={{
          text: t('ok_button'),
          onClick: async () => {
            await revokeInvitation({
              variables: { groupId: Number(courseId) }
            })
            setIsCodeInvitationEnabled(false)
          },
          variant: 'default'
        }}
        open={isRevokeInvitationModalOpen}
        onOpenChange={setIsRevokeInvitationModalOpen}
      />
    </div>
  )
}
