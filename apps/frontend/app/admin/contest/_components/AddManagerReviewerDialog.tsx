'use client'

import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/shadcn/dropdown-menu'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@/components/shadcn/select'
import { Textarea } from '@/components/shadcn/textarea'
import { ALLOWED_DOMAINS } from '@/libs/constants'
import { isHttpError, safeFetcherWithAuth } from '@/libs/utils'
import { SelectGroup } from '@radix-ui/react-select'
import React, { useEffect, useState } from 'react'
import { FaChevronDown, FaCircleExclamation } from 'react-icons/fa6'
import {
  HiMiniAtSymbol,
  HiMiniPlus,
  HiMiniPlusCircle,
  HiMiniXCircle,
  HiOutlineEnvelope
} from 'react-icons/hi2'
import type { ContestManagerReviewer } from '../_libs/schemas'

interface AddManagerReviewerDialogProps {
  managers: ContestManagerReviewer[]
  setManagers: (managers: ContestManagerReviewer[]) => void
  participants?: {
    userId: number
    user: {
      username: string
      email: string
    }
  }[]
}
interface InputFieldInterface {
  value: string
  domain: string
  role: string
  error: string
}

// TODO: handle strictly null userProfile
interface UserResInterface {
  username: string
  id: number
  userProfile?: {
    realName: string
  }
}

export function AddManagerReviewerDialog({
  managers,
  setManagers,
  participants = []
}: AddManagerReviewerDialogProps) {
  const [open, setOpen] = useState(false) // State to manage the open state of the dialog
  const [users, setUsers] = useState<ContestManagerReviewer[]>([]) // State to manage the list of selected users
  const [inputField, setInputField] = useState({
    value: '',
    domain: `${ALLOWED_DOMAINS[0]}`,
    role: 'Manager',
    error: ''
  })

  useEffect(() => {
    if (open) {
      setInputField({
        value: '',
        domain: `${ALLOWED_DOMAINS[0]}`,
        role: 'Manager',
        error: ''
      })
      setUsers([]) // Reset users when the dialog opens
    }
  }, [open])

  // users에 저장된 유저들을 매니저에 추가
  const handleInvite = () => {
    const validUsers: ContestManagerReviewer[] = users.filter(
      (user) => user !== null
    )

    // 중복 이메일 제거
    const existingEmails = new Set(managers.map((manager) => manager.email))
    const uniqueValidUsers = validUsers.filter(
      (field, index, self) =>
        !existingEmails.has(field.email) &&
        self.findIndex((f) => f.email === field.email) === index
    )

    setManagers([...managers, ...uniqueValidUsers])
    setOpen(false)
  }

  return (
    <Modal
      trigger={
        <Button
          type="button"
          className="flex h-[36px] w-[100px] items-center gap-1 px-0"
        >
          <HiMiniPlusCircle className="h-5 w-5" />
          <div className="text-sm font-bold">Add</div>
        </Button>
      }
      open={open}
      onOpenChange={setOpen}
      size="lg"
      type="custom"
      title="Add Contest Manager / Reviewer"
      headerDescription="Easily register managers and judges to help run the Contest."
      primaryButton={{ text: 'Invite', onClick: handleInvite }}
      onClose={() => setOpen(false)}
    >
      {/* children으로 넣을 부분 */}
      <ScrollArea className="h-full w-full tracking-[-3%]">
        <div className="flex flex-col gap-[30px]">
          {/* 인풋 필드 */}
          <InputFieldTab
            users={users}
            inputField={inputField}
            setUsers={setUsers}
            setInputField={setInputField}
            participants={participants}
          />
          {/* selected users 블록 */}
          <div className="flex min-h-[293px] flex-col gap-[10px] rounded-2xl border border-solid border-[#D8D8D8] p-[30px]">
            {/* ~ user(s) selected */}
            <div className="text-primary mt-1 text-sm">
              {`${users.length} user(s) selected`}
            </div>
            {/* 유저탭 */}
            {users.length === 0 ? (
              <div className="bg-color-neutral-99 text-color-neutral-80 flex grow flex-col items-center justify-center gap-[6.4px] rounded-lg">
                <div className="grid size-[25.2px] place-content-center">
                  <FaCircleExclamation />
                </div>
                <p>No users have been selected yet</p>
              </div>
            ) : (
              <div className="mb-[2px] flex flex-col gap-[8px]">
                {users.map((user) => (
                  <SelectedUserTab
                    key={user.email}
                    curUser={user}
                    setUsers={setUsers}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        <ScrollBar className="ml-[16px] w-[4px]" />
      </ScrollArea>
    </Modal>
  )
}
interface InputFieldTabProps {
  users: ContestManagerReviewer[]
  inputField: InputFieldInterface
  setUsers: React.Dispatch<React.SetStateAction<ContestManagerReviewer[]>>
  setInputField: React.Dispatch<React.SetStateAction<InputFieldInterface>>
  participants: {
    userId: number
    user: {
      username: string
      email: string
    }
  }[]
}

// TODO: 하단 추천 바 구현 시 inputField에 error가 있으면 추천 바가 뜨지 않도록 설정! (자동적으로 유저 추가 불가)
// 인풋 필드 + 드롭다운 메뉴
function InputFieldTab({
  users,
  inputField,
  setUsers,
  setInputField,
  participants
}: InputFieldTabProps) {
  const [isDirect, setIsDirect] = useState(false)

  // 도메인 드롭다운 메뉴 변경 시 실행 함수
  const handleDomainDropdownChange = (value: string) => {
    if (value === 'Enter directly') {
      setInputField((prevField) => ({ ...prevField, domain: '' }))
      setIsDirect(true)
    } else {
      setInputField((prevField) => ({ ...prevField, domain: value }))
      setIsDirect(false)
    }
  }

  // 역할 드롭다운 메뉴 변경 시 실행 함수
  const handleRoleDropdownChange = (value: string) => {
    setInputField((prevField) => ({ ...prevField, role: value }))
  }

  // inputField의 값이 valid하면 users에 추가하는 함수 (추천 이메일 옆에 + 버튼)
  // 1. 실제 존재하는 이메일(유저)인지 확인
  // 2. participants로 등록된 유저가 아닌지 확인
  // 3. 이미 users에 포함된 유저가 아닌지 확인
  const fetchUserData = async (email: string, dropdownValue: string) => {
    try {
      const res: UserResInterface = await safeFetcherWithAuth
        .get('user/email', {
          searchParams: {
            email
          }
        })
        .json()

      // contest participants에 등록된 유저인지 확인
      const isParticipant = participants.some(
        (participant) => participant.user.email === email
      )
      if (isParticipant) {
        setInputField((prevField) => ({
          ...prevField,
          error: 'This email is already registered as contest participant'
        }))

        return
      }

      // 이미 users에 포함된 유저인지 확인
      const isSelected = users.some((user) => user.email === email)
      if (isSelected) {
        setInputField((prevField) => ({
          ...prevField,
          error: 'This email is already selected'
        }))

        return
      }

      // 위 조건을 모두 만족하면 users에 맨앞에 추가
      setUsers((prevUsers) => [
        {
          id: res.id,
          email,
          username: res.username,
          realName: res.userProfile?.realName ?? '',
          type: dropdownValue
        },
        ...prevUsers
      ])
      // 정상적으로 추가됐으면 InputField 비우기
      setInputField((prevField) => ({ ...prevField, value: '', error: '' }))
    } catch (error) {
      const errorMessage =
        isHttpError(error) && error.response.status === 404
          ? 'No user exists with this email'
          : 'Invalid email format'
      setInputField((prevField) => ({ ...prevField, error: errorMessage }))
    }
  }

  // TODO: 해당되는 컴포넌트 작성
  return (
    <div className="flex w-full justify-between gap-[10px]">
      {/* input + email dropdown + role dropdown */}
      <div className="flex w-full gap-[4px]">
        {/* email input */}
        <div className="border-color-line-default flex items-center gap-[10px] rounded-full border-[1px] border-solid px-[20px]">
          <div className="grid size-[18px] place-content-center">
            <HiOutlineEnvelope className="text-color-neutral-70" />
          </div>
          <Textarea
            value={inputField.value}
            placeholder="Enter the e-mail"
            className="min-h-none placeholder:text-color-neutral-90 max-h-[24px] resize-none truncate border-none p-0 text-base font-normal shadow-none focus-visible:ring-0"
            onChange={(value) =>
              setInputField((prevField) => ({
                ...prevField,
                value: value.target.value
              }))
            }
          />
        </div>

        {/* email dropdown */}
        {isDirect ? (
          <div className="border-color-line-default flex h-[40px] w-full max-w-[246px] items-center gap-[6px] rounded-full border-[1px] border-solid pl-4 pr-2 text-base font-normal">
            <div className="grid size-[20px] place-content-center">
              <HiMiniAtSymbol size={16.67} className="text-color-neutral-30" />
            </div>
            <div className="min-w-[170px]">
              <Textarea
                value={inputField.domain}
                placeholder="Enter directly"
                className="min-h-none placeholder:text-color-neutral-90 z-100 max-h-[24px] resize-none truncate border-none p-0 text-base font-normal shadow-none focus-visible:ring-0"
                onChange={(value) =>
                  setInputField((prevField) => ({
                    ...prevField,
                    domain: value.target.value
                  }))
                }
              />
            </div>
            <Select onValueChange={handleDomainDropdownChange}>
              <SelectTrigger asChild>
                <Button variant="ghost" className="p-0">
                  <FaChevronDown className="text-color-neutral-90" />
                </Button>
              </SelectTrigger>
              <SelectContent
                className={`w-[246px] ${isDirect && '-translate-x-[101px]'}`}
              >
                <SelectGroup>
                  {ALLOWED_DOMAINS.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain}
                    </SelectItem>
                  ))}
                  <SelectItem key={'Enter directly'} value="Enter directly">
                    Enter directly
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <Select onValueChange={handleDomainDropdownChange}>
            <SelectTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="text-color-common-0 flex h-[40px] w-full max-w-[246px] gap-[6px] pl-4 pr-2 text-base font-normal"
              >
                <div className="flex items-center gap-[6px]">
                  <div className="grid size-[20px] place-content-center">
                    <HiMiniAtSymbol
                      size={16.67}
                      className="text-color-neutral-30"
                    />
                  </div>
                  <div className="min-w-[170px]">
                    <p className="text-color-common-0 text-left text-base">
                      {inputField.domain}
                    </p>
                  </div>
                </div>
                <div className="grid size-[16px] place-content-center">
                  <FaChevronDown className="text-color-neutral-90" />
                </div>
              </Button>
            </SelectTrigger>
            <SelectContent
              className={`w-[246px] ${isDirect && '-translate-x-[101px]'}`}
            >
              <SelectGroup>
                {ALLOWED_DOMAINS.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
                <SelectItem key={'Enter directly'} value="Enter directly">
                  Enter directly
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}

        {/* role dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="text-color-common-0 flex h-[40px] items-center gap-[4px] px-[19.5px] text-base font-normal"
            >
              <p className="min-w-[67px] text-center">{inputField.role}</p>
              <div className="grid size-[16px] place-content-center">
                <FaChevronDown className="text-color-neutral-90" />
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full">
            <DropdownMenuCheckboxItem
              checked={inputField.role === 'Manager'}
              onCheckedChange={() => handleRoleDropdownChange('Manager')}
            >
              Manager
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={inputField.role === 'Reviewer'}
              onCheckedChange={() => handleRoleDropdownChange('Reviewer')}
            >
              Reviewer
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {/* + 버튼 */}
      <Button
        variant="outline"
        className="border-color-blue-50 hover:bg-color-blue-80 h-full cursor-pointer border-[1px]"
        onClick={() =>
          fetchUserData(
            `${inputField.value}@${inputField.domain}`,
            inputField.role
          )
        }
      >
        <div className="text-color-blue-50 flex h-full items-center gap-[4px] px-[22px]">
          <HiMiniPlus size={16} />
          <p className="text-sm font-medium">Add</p>
        </div>
      </Button>
    </div>
  )
}

interface SelectedUserTabProps {
  curUser: ContestManagerReviewer
  setUsers: React.Dispatch<React.SetStateAction<ContestManagerReviewer[]>>
}

// selected users 박스에 있는 각 유저 탭 (이메일 + 드롭다운 메뉴)
function SelectedUserTab({ curUser, setUsers }: SelectedUserTabProps) {
  // 현재 유저의 권한 바꾸기
  const handleUserDropdownChange = (value: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === curUser.id ? { ...user, type: value } : user
      )
    )
  }

  // 현재 유저를 users에서 삭제
  const handleDeleteUser = () => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== curUser.id))
  }

  return (
    <div className="flex gap-[10px] text-base">
      {/* email 표시 박스 */}
      <div className="flex h-10 w-full max-w-[530px] cursor-pointer items-center justify-between rounded-full border border-solid border-[#D8D8D8] px-[10px] py-[10px] text-black">
        <div className="ml-[10px] flex items-center gap-[10px]">
          <HiOutlineEnvelope className="h-5 w-5 text-[#9B9B9B]" />
          <span>{curUser.email}</span>
        </div>

        {/* 삭제버튼 */}
        <Button
          variant="ghost"
          className="h-9 w-9 p-1 text-sm font-normal"
          onClick={() => handleDeleteUser()}
        >
          <HiMiniXCircle className="h-5 w-5 text-[#B0B0B0]" />
        </Button>
      </div>
      {/* 드롭다운 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="grow">
          <Button variant="outline" className="h-10 pl-4 pr-2 font-normal">
            <p className="min-w-[67px] text-center">{curUser.type}</p>
            <div className="grid size-[16px] place-content-center">
              <FaChevronDown className="text-color-neutral-90" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full">
          <DropdownMenuCheckboxItem
            checked={curUser.type === 'Manager'}
            onCheckedChange={() => handleUserDropdownChange('Manager')}
          >
            Manager
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={curUser.type === 'Reviewer'}
            onCheckedChange={() => handleUserDropdownChange('Reviewer')}
          >
            Reviewer
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
