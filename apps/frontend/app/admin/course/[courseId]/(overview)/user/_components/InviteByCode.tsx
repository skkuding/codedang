import { AlertModal } from '@/components/AlertModal'
import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import { Switch } from '@/components/shadcn/switch'
import { Textarea } from '@/components/shadcn/textarea'
import { CREATE_WHITE_LIST, DELETE_WHITE_LIST } from '@/graphql/course/mutation'
import { GET_COURSE, GET_WHITE_LIST } from '@/graphql/course/queries'
import { ISSUE_INVITATION, REVOKE_INVITATION } from '@/graphql/user/mutation'
import PenIcon from '@/public/icons/pen.svg'
import PlusLineIcon from '@/public/icons/plus-line.svg'
import { useMutation, useQuery } from '@apollo/client'
import { useState } from 'react'
// import { CSVLink } from 'react-csv'
import { useForm } from 'react-hook-form'
import { FaTrash } from 'react-icons/fa'
import { IoCheckmarkCircle, IoCopyOutline } from 'react-icons/io5'
import { toast } from 'sonner'

interface InviteByCodeProps {
  courseId: string
}

interface InvitationCodeInput {
  invitationCode: string
}

export function InviteByCode({ courseId }: InviteByCodeProps) {
  const { getValues, reset } = useForm<InvitationCodeInput>()
  const [issueInvitation] = useMutation(ISSUE_INVITATION)
  const [revokeInvitation] = useMutation(REVOKE_INVITATION)

  const [isCodeInvitationEnabled, setIsCodeInvitationEnabled] = useState(false)
  const [isWhiteListEnabled, setIsWhiteListEnabled] = useState(false)
  const [isRevokeInvitationModalOpen, setIsRevokeInvitationModalOpen] =
    useState(false)

  const [whiteListStudentIds, setWhiteListStudentIds] = useState<string[]>([])
  const [whitelistInput, setWhitelistInput] = useState('')
  const [isSubmittingWhitelist, setIsSubmittingWhitelist] = useState(false)
  const [isReplacingWhitelist, setIsReplacingWhitelist] = useState(false)
  const [newStudentId, setNewStudentId] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState('')

  const [isDeleteWhitelistModalOpen, setIsDeleteWhitelistModalOpen] =
    useState(false)
  const [deleteTargetIndex, setDeleteTargetIndex] = useState<number | null>(
    null
  )

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
      toast.error(`Failed to fetch invitation code: ${error.message}`)
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
      console.error('Failed to update invitation code:', error)
    }
  }

  const [createWhitelist] = useMutation(CREATE_WHITE_LIST)
  const [deleteWhitelist] = useMutation(DELETE_WHITE_LIST)

  // NOTE: 엑셀 업로드 방식에서 텍스트 붙여넣기 방식으로 변경 (기존 로직은 롤백 대비용으로 주석 보존)
  // const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = event.target.files?.[0]
  //   if (!file) {
  //     return
  //   }
  //   setFileName(file.name.replace(/\.[^/.]+$/, '.csv')) // 파일 이름 저장
  //
  //   const reader = new FileReader()
  //   reader.onload = async (e) => {
  //     const data = new Uint8Array(e.target?.result as ArrayBuffer)
  //     const workbook = XLSX.read(data, { type: 'array' })
  //     const sheetName = workbook.SheetNames[0]
  //     const sheet = workbook.Sheets[sheetName]
  //
  //     // Excel 데이터를 JSON 형태로 변환
  //     const jsonData = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })
  //
  //     // 첫 번째 행을 헤더로 설정
  //     const headers = jsonData[0].map((header: string) => header.trim()) // 공백 제거
  //     const dataRows = jsonData.slice(1) // 실제 데이터 행
  //
  //     // "studentId" 컬럼 찾기 (유동적으로)
  //     const studentIdIndex = headers.findIndex((header) =>
  //       header.includes('studentId')
  //     )
  //
  //     if (studentIdIndex === -1) {
  //       toast.error("Cannot find 'studentId' Column")
  //       return
  //     }
  //
  //     // studentId 데이터만 추출 (문자열에서 숫자만 추출)
  //     const studentIdList = Array.from(
  //       new Set(
  //         dataRows
  //           .map((row) => row[studentIdIndex]?.toString() ?? '') // null 또는 undefined 방지
  //           .filter((id) => id.trim() !== '') // 빈 문자열 제거
  //       )
  //     )
  //
  //     setWhiteListStudentIds(studentIdList ?? [])
  //     /** 화이트리스트 생성 요청 */
  //     try {
  //       const { data } = await createWhitelist({
  //         variables: {
  //           groupId: Number(courseId),
  //           studentIds: studentIdList
  //         }
  //       })
  //       setWhitelistCount(data?.createWhitelist ?? 0)
  //       setIsUploaded(true)
  //     } catch (error) {
  //       console.error('Create white list error:', error)
  //     }
  //   }
  //
  //   reader.readAsArrayBuffer(file)
  // }

  const submitWhitelist = async (
    studentIds: string[],
    successMessage = 'Successfully registered.'
  ) => {
    setIsSubmittingWhitelist(true)
    try {
      await createWhitelist({
        variables: {
          groupId: Number(courseId),
          studentIds
        }
      })
      setWhiteListStudentIds(studentIds)
      toast.success(successMessage)
      return true
    } catch (error) {
      console.error('Create white list error:', error)
      const message = error instanceof Error ? error.message : String(error)
      toast.error(`Failed to update whitelist: ${message}`)
      return false
    } finally {
      setIsSubmittingWhitelist(false)
    }
  }

  const handleBulkSubmit = async () => {
    const studentIdList = Array.from(
      new Set(
        whitelistInput
          .split(/[\n,\t]+/)
          .map((id) => id.trim())
          .filter((id) => id !== '')
      )
    )

    if (studentIdList.length === 0) {
      toast.error('Please enter at least one student ID')
      return
    }

    if (await submitWhitelist(studentIdList)) {
      setWhitelistInput('')
      setIsReplacingWhitelist(false)
    }
  }

  const handleAddStudent = async () => {
    const trimmed = newStudentId.trim()
    if (!trimmed) {
      toast.error('Please enter a student ID')
      return
    }
    if (whiteListStudentIds.includes(trimmed)) {
      toast.error('This student ID is already in the whitelist')
      return
    }

    if (await submitWhitelist([...whiteListStudentIds, trimmed])) {
      setNewStudentId('')
    }
  }

  const handleDeleteStudent = async (index: number) => {
    if (
      await submitWhitelist(
        whiteListStudentIds.filter((_, i) => i !== index),
        'Successfully deleted.'
      )
    ) {
      setDeleteTargetIndex(null)
    }
  }

  const handleEditSave = async (index: number) => {
    const trimmed = editingValue.trim()
    if (!trimmed) {
      toast.error('Student ID cannot be empty')
      return
    }

    const updated = [...whiteListStudentIds]
    updated[index] = trimmed
    if (await submitWhitelist(updated)) {
      setEditingIndex(null)
    }
  }

  return (
    <div className="flex flex-col gap-[30px] rounded-lg border p-[30px]">
      <div className="flex items-center gap-[10px]">
        <span className="text-lg">Invite by Invitation Code</span>
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
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-[10px]">
              <span className="text-base text-[#5C5C5C]">
                Only approved accounts can enter
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
                title="Disable Student Whitelist"
                description="The student ID whitelist will be deleted, and anyone will be able to join the course with an invitation code."
                primaryButton={{
                  text: 'Ok',
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
                  {whiteListStudentIds.length === 0 || isReplacingWhitelist
                    ? 'Paste student IDs below, one per line (or separated by commas). When you submit, the existing whitelist is deleted and replaced.'
                    : 'Edit, remove, or add student IDs individually below.'}

                  {/* NOTE: 텍스트 붙여넣기 방식으로 변경되며 더 이상 필요하지 않아 주석 처리
                  <li>
                    Current Whitelist:{' '}
                    <CSVLink
                      data={whiteListStudentIds.map((id) => ({
                        studentId: id
                      }))}
                      headers={[{ label: 'studentId', key: 'studentId' }]}
                      filename="Whitelist.csv"
                      className="text-primary underline"
                    >
                      Whitelist.csv
                    </CSVLink>
                  </li>
                  */}
                </ul>
                {/* NOTE: 엑셀 업로드 방식에서 텍스트 붙여넣기 방식으로 변경 (기존 UI는 롤백 대비용으로 주석 보존)
                <label className="flex h-[40px] w-full cursor-pointer items-center justify-center gap-[10px] rounded-full border border-[#D8D8D8] bg-white px-[28px] py-[12px] transition hover:border-gray-300 hover:bg-gray-50">
                  <IoCloudUpload size={20} className="text-gray-700" />
                  <span className="text-body2_m_14 text-gray-700">
                    Upload File (Excel)
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv, .xlsx, .xls"
                    onChange={handleFileUpload}
                  />
                </label>
                */}
                {whiteListStudentIds.length === 0 || isReplacingWhitelist ? (
                  <>
                    <Textarea
                      value={whitelistInput}
                      onChange={(e) => setWhitelistInput(e.target.value)}
                      placeholder={'e.g.\n2024123456\n2024123457\n2024123458'}
                      disabled={isSubmittingWhitelist}
                      className="h-[120px] resize-none overflow-y-auto bg-white [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar]:w-1"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        className="bg-primary h-[40px] flex-1 rounded-full"
                        onClick={handleBulkSubmit}
                        disabled={isSubmittingWhitelist}
                      >
                        Submit
                      </Button>
                      {whiteListStudentIds.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          aria-label="Cancel"
                          className="h-[40px] rounded-full"
                          onClick={() => {
                            setIsReplacingWhitelist(false)
                            setWhitelistInput('')
                          }}
                          disabled={isSubmittingWhitelist}
                        >
                          <FaTrash className="h-4 w-4 text-gray-400" />
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex max-h-[240px] flex-col gap-2 overflow-y-auto [scrollbar-width:thin] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar]:w-1">
                      {whiteListStudentIds.map((studentId, index) => (
                        <div
                          key={`${studentId}-${index}`}
                          className="border-line flex h-10 shrink-0 items-center gap-[10px] rounded-full border bg-white px-5"
                        >
                          {editingIndex === index ? (
                            <>
                              <Input
                                value={editingValue}
                                onChange={(e) =>
                                  setEditingValue(e.target.value)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleEditSave(index)
                                  }
                                }}
                                autoFocus
                                className="h-8 flex-1 rounded-none border-none bg-transparent px-0 focus-visible:ring-0"
                              />
                              <IoCheckmarkCircle
                                className="text-primary h-[18px] w-[18px] shrink-0 cursor-pointer"
                                onClick={() => handleEditSave(index)}
                              />
                              <FaTrash
                                className="h-4 w-4 shrink-0 cursor-pointer text-gray-400"
                                onClick={() => setEditingIndex(null)}
                              />
                            </>
                          ) : (
                            <>
                              <span className="flex-1 truncate text-base">
                                {studentId}
                              </span>
                              <PenIcon
                                className="h-4 w-4 shrink-0 cursor-pointer text-gray-400"
                                onClick={() => {
                                  setEditingIndex(index)
                                  setEditingValue(studentId)
                                }}
                              />
                              <FaTrash
                                className="h-3 w-3 shrink-0 cursor-pointer text-gray-400"
                                onClick={() => setDeleteTargetIndex(index)}
                              />
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    <AlertModal
                      open={deleteTargetIndex !== null}
                      onOpenChange={(open) => {
                        if (!open) {
                          setDeleteTargetIndex(null)
                        }
                      }}
                      type="warning"
                      title="Remove Student ID"
                      description={
                        deleteTargetIndex !== null
                          ? `Remove ${whiteListStudentIds[deleteTargetIndex]} from the whitelist?`
                          : undefined
                      }
                      primaryButton={{
                        text: 'Delete',
                        onClick: () => {
                          if (deleteTargetIndex !== null) {
                            handleDeleteStudent(deleteTargetIndex)
                          }
                        },
                        variant: 'default',
                        disabled: isSubmittingWhitelist
                      }}
                    />
                    <div className="flex items-center gap-[10px]">
                      <Input
                        value={newStudentId}
                        onChange={(e) => setNewStudentId(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddStudent()
                          }
                        }}
                        placeholder="Enter a student ID"
                        disabled={isSubmittingWhitelist}
                        className="h-10 flex-1 rounded-full"
                      />
                      <div
                        className="border-primary flex h-10 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-full border bg-white px-[22px] duration-200 hover:bg-blue-50"
                        onClick={handleAddStudent}
                      >
                        <PlusLineIcon />
                        <span className="text-primary text-[14px] font-medium">
                          Add
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-primary self-start text-sm underline"
                      onClick={() => setIsReplacingWhitelist(true)}
                    >
                      Replace entire list
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
      <AlertModal
        type="warning"
        title=" Disable Invitation Code"
        description=" Students will no longer be able to join the course using the invitation code."
        primaryButton={{
          text: 'Ok',
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
