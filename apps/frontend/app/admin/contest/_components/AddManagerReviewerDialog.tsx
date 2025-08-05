'use client'

import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/shadcn/command'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/shadcn/dropdown-menu'
import { ALLOWED_DOMAINS } from '@/libs/constants'
import { cn, isHttpError, safeFetcherWithAuth } from '@/libs/utils'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { ChevronDown } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { FaTrash } from 'react-icons/fa6'
import { HiMiniPlusCircle } from 'react-icons/hi2'
import { PiWarningFill } from 'react-icons/pi'
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
  dropdown: string
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
    dropdown: 'Manager',
    error: ''
  })

  useEffect(() => {
    if (open) {
      setInputField({
        value: '',
        dropdown: 'Manager',
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
      <ScrollArea className="w-full">
        {/* 인풋 필드 */}
        <InputFieldTab
          users={users}
          inputField={inputField}
          setUsers={setUsers}
          setInputField={setInputField}
          participants={participants}
        />
        {/* selected users 블록 */}
        <div className="flex h-full flex-col">
          {/* ~ user(s) selected */}
          <div
            className={cn(
              'mt-1',
              users.length > 0 ? 'text-primary' : 'text-[#9B9B9B]'
            )}
          >
            {`${users.length} user(s) selected`}
          </div>
          {/* 유저탭 */}
          <div className="flex flex-col gap-2">
            {users.map((user) => (
              <SelectedUserTab
                key={user.email}
                curUser={user}
                setUsers={setUsers}
              />
            ))}
          </div>
        </div>
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
// 인풋 필드 + 드롭다운 메뉴 + 하단 추천 바
function InputFieldTab({
  users,
  inputField,
  setUsers,
  setInputField,
  participants
}: InputFieldTabProps) {
  // 인풋 필드 내에 이메일 변경 시
  const handleValueChange = (value: string) => {
    setInputField((prevField) => ({ ...prevField, value, error: '' }))
  }

  // 드롭다운 메뉴 변경 시 실행 함수
  const handleInputDropdownChange = (value: string) => {
    setInputField((prevField) => ({ ...prevField, dropdown: value }))
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
      // 정상적으로 추가됐으면 error 없애기
      setInputField((prevField) => ({ ...prevField, error: '' }))
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
    <Command className="gap-[6px]">
      <div className="flex flex-col">
        <div className="flex gap-2">
          <div className="relative w-full max-w-[346px] gap-2">
            <CommandInput
              className="ml-1 h-10 w-[300px] text-sm placeholder:text-neutral-300"
              placeholder="Please enter the e-mail"
              emailType={true}
              value={inputField.value}
              onValueChange={(value) => handleValueChange(value)}
            />
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              <CommandGroup className="px-0 pt-0">
                {ALLOWED_DOMAINS.map((domain) => {
                  const emailSuggestion = inputField.value.endsWith(
                    `@${domain}`
                  )
                    ? inputField.value
                    : `${inputField.value.replace(/@.*/, '')}@${domain}`
                  return (
                    <CommandItem
                      key={emailSuggestion}
                      value={emailSuggestion}
                      className="relative mt-1 w-full cursor-pointer justify-between rounded-full bg-gray-100 py-[10px] text-sm text-black"
                    >
                      <span className="ml-5">{emailSuggestion}</span>
                      <Button
                        variant="ghost"
                        className="absolute right-0 top-[1px] mr-[2px] mt-[2px] h-9 w-9 p-1 text-sm font-normal"
                        onClick={() => {
                          handleValueChange(emailSuggestion)
                          fetchUserData(emailSuggestion, inputField.dropdown)
                        }}
                      >
                        <HiMiniPlusCircle className="h-5 w-5 text-[#9B9B9B]" />
                      </Button>
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </CommandList>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="w-full">
              <Button
                variant="outline"
                className="h-10 pl-4 pr-2 text-sm font-normal"
              >
                {inputField.dropdown}
                <ChevronDown
                  className="ml-[10px] h-5 w-5 text-[#B0B0B0]"
                  width={24}
                  height={24}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full">
              <DropdownMenuCheckboxItem
                checked={inputField.dropdown === 'Manager'}
                onCheckedChange={() => handleInputDropdownChange('Manager')}
              >
                Manager
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={inputField.dropdown === 'Reviewer'}
                onCheckedChange={() => handleInputDropdownChange('Reviewer')}
              >
                Reviewer
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {inputField.error && (
          <div className="flex items-center gap-1">
            <PiWarningFill size={14} className="text-error" />
            <p className="text-error mt-1 text-xs">{inputField.error}</p>
          </div>
        )}
      </div>
    </Command>
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
    <div className="ml-1 h-10 w-[300px] text-sm">
      {/* email 표시 */}
      <div
        key={curUser.email}
        className="relative mt-1 w-full cursor-pointer justify-between rounded-full bg-gray-100 py-[10px] text-sm text-black"
      >
        <span className="ml-5">{curUser.email}</span>
        {/* 삭제버튼 */}
        <Button
          variant="ghost"
          className="absolute right-0 top-[1px] mr-[2px] mt-[2px] h-9 w-9 p-1 text-sm font-normal"
          onClick={() => handleDeleteUser()}
        >
          <FaTrash className="h-5 w-5 text-[#9B9B9B]" />
        </Button>
      </div>
      {/* 드롭다운 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="w-full">
          <Button
            variant="outline"
            className="h-10 pl-4 pr-2 text-sm font-normal"
          >
            {curUser.type}
            <ChevronDown
              className="ml-[10px] h-5 w-5 text-[#B0B0B0]"
              width={24}
              height={24}
            />
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
