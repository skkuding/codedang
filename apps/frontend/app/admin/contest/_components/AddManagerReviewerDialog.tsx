'use client'

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shadcn/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/shadcn/dropdown-menu'
import { ALLOWED_DOMAINS } from '@/libs/constants'
import { cn, isHttpError, safeFetcherWithAuth } from '@/libs/utils'
import { ChevronDown, Plus } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { FaTrash } from 'react-icons/fa6'
import { HiCheckCircle } from 'react-icons/hi'
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

interface UserResInterface {
  username: string
  id: number
  userProfile?: {
    realName: string
  }
}

const generateUniqueId = () => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

export function AddManagerReviewerDialog({
  managers,
  setManagers,
  participants = []
}: AddManagerReviewerDialogProps) {
  const [open, setOpen] = useState(false) // State to manage the open state of the dialog
  const [users, setUsers] = useState<ContestManagerReviewer[]>([]) // State to manage the list of users
  const [focusedInputId, setFocusedInputId] = useState<string | null>(null) // State to manage the focused input field
  const [inputFields, setInputFields] = useState([
    { id: generateUniqueId(), value: '', dropdown: 'Manager', error: '' }
  ])

  useEffect(() => {
    if (open) {
      setInputFields([
        { id: generateUniqueId(), value: '', dropdown: 'Manager', error: '' }
      ])
      setUsers([]) // Reset users when the dialog opens
    }
  }, [open])

  const handleValueChange = (id: string, value: string) => {
    setInputFields((prevFields) =>
      prevFields.map((field) =>
        field.id === id
          ? {
              ...field,
              value,
              error: hasDuplicate(value, id)
                ? 'This email address has already been added'
                : ''
            }
          : field
      )
    )
  }

  const handleDropdownChange = (id: string, value: string) => {
    setInputFields((prevFields) =>
      prevFields.map((field) =>
        field.id === id ? { ...field, dropdown: value } : field
      )
    )
  }

  const handleDeleteInput = (id: string) => {
    setInputFields((prevFields) =>
      prevFields.filter((field) => field.id !== id)
    )
    setUsers((prevUsers) => {
      const uniqueUsers = prevUsers.filter(
        (user, index, self) =>
          self.findIndex((u) => u.email === user.email && u.id === user.id) ===
          index
      )
      return uniqueUsers
    })
  }

  const handleAddInput = () => {
    setInputFields((prevFields) => [
      ...prevFields,
      { id: generateUniqueId(), value: '', dropdown: 'Manager', error: '' } // Generate a new unique ID
    ])
  }

  const handleSave = () => {
    const validInputFields: ContestManagerReviewer[] = inputFields
      .map((inputField) => {
        const user = users.find((user) => user.email === inputField.value)
        if (!user || inputField.error || !inputField.value.trim()) {
          return null
        }
        return {
          id: user.id,
          email: user.email,
          username: user.username,
          realName: user.realName,
          type: inputField.dropdown
        }
      })
      .filter((user): user is ContestManagerReviewer => user !== null)

    // 중복 이메일 제거
    const existingEmails = new Set(managers.map((manager) => manager.email))
    const uniqueValidInputFields = validInputFields.filter(
      (field, index, self) =>
        !existingEmails.has(field.email) &&
        self.findIndex((f) => f.email === field.email) === index
    )

    setManagers([...managers, ...uniqueValidInputFields])
    setOpen(false)
  }

  // 실제 존재하는 이메일(유저)인지 확인하는 함수
  const fetchUserData = async (
    email: string,
    id: string,
    dropdownValue: string
  ) => {
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
        setInputFields((prevFields) =>
          prevFields.map((field) =>
            field.id === id
              ? {
                  ...field,
                  error:
                    'This email is already registered as contest participant'
                }
              : field
          )
        )
        return
      }
      // 이미 선택된 유저인지 확인
      const alreadySelected = users.some((user) => user.email === email)
      if (alreadySelected) {
        setInputFields((prevFields) =>
          prevFields.map((field) =>
            field.id === id
              ? {
                  ...field,
                  error: 'This email has already been selected'
                }
              : field
          )
        )
        return
      }

      // 존재하는 이메일이고, participants로 등록된 유저가 아니고, 이미 users에 포함되지 않은 경우에만 추가
      // userProfile이 존재하지 않다면 realName 값을 ''로 지정.
      setUsers((prevUsers) => [
        ...prevUsers,
        {
          id: res.id,
          email,
          username: res.username,
          realName: res.userProfile ? res.userProfile.realName : '',
          type: dropdownValue
        }
      ])
      setInputFields((prevFields) =>
        prevFields.map((field) =>
          field.id === id ? { ...field, error: '' } : field
        )
      )
    } catch (error) {
      const errorMessage =
        isHttpError(error) && error.response.status === 404
          ? 'No user exists with this email'
          : 'Invalid email format'
      setInputFields((prevFields) =>
        prevFields.map((field) =>
          field.id === id ? { ...field, error: errorMessage } : field
        )
      )
    }
  }

  const hasDuplicate = (value: string, id: string) =>
    inputFields.some((field) => field.value === value && field.id !== id)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="flex h-[36px] w-[100px] items-center gap-1 px-0"
        >
          <HiMiniPlusCircle className="h-5 w-5" />
          <div className="text-sm font-bold">Add</div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[580px] gap-[6px] px-10 py-[60px] sm:rounded-2xl">
        <DialogHeader className="justify-center gap-7">
          <DialogTitle className="text-center text-2xl">
            Add Contest Manager / Reviewer
          </DialogTitle>
          <DialogDescription
            className={cn(
              'mt-1',
              users.length > 0 ? 'text-primary' : 'text-[#9B9B9B]'
            )}
          >
            {`${users.length} user(s) selected`}
          </DialogDescription>
        </DialogHeader>

        {inputFields.map((inputField) => (
          <Command key={inputField.id} className="h-full gap-[6px]">
            <div className="flex flex-col">
              <div className="flex gap-2">
                <div className="relative w-full max-w-[346px] gap-2">
                  <CommandInput
                    className="ml-1 h-10 w-[300px] text-sm placeholder:text-neutral-300"
                    placeholder="Search Email"
                    emailType={true}
                    onFocus={() => setFocusedInputId(inputField.id)}
                    value={inputField.value}
                    onValueChange={(value) =>
                      handleValueChange(inputField.id, value)
                    }
                  />
                  <Button
                    variant="ghost"
                    className="absolute right-0 top-[1px] mr-[2px] mt-[2px] h-9 w-9 p-1 text-sm font-normal"
                    onClick={() => {
                      handleValueChange(inputField.id, inputField.value)
                      setFocusedInputId(null)
                      fetchUserData(
                        inputField.value,
                        inputField.id,
                        inputField.dropdown
                      )
                    }}
                  >
                    <HiMiniPlusCircle className="h-5 w-5 text-[#9B9B9B]" />
                  </Button>

                  {focusedInputId === inputField.id && inputField.value && (
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
                              onSelect={() => {
                                handleValueChange(
                                  inputField.id,
                                  emailSuggestion
                                )
                                setFocusedInputId(null)
                                fetchUserData(
                                  emailSuggestion,
                                  inputField.id,
                                  inputField.dropdown
                                ) // fetch user data only when CommandItem is selected
                              }}
                            >
                              <span className="ml-5">{emailSuggestion}</span>
                              <HiMiniPlusCircle className="absolute right-2 h-5 w-5 text-[#9B9B9B]" />
                            </CommandItem>
                          )
                        })}
                      </CommandGroup>
                    </CommandList>
                  )}
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
                      onCheckedChange={() =>
                        handleDropdownChange(inputField.id, 'Manager')
                      }
                    >
                      Manager
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={inputField.dropdown === 'Reviewer'}
                      onCheckedChange={() =>
                        handleDropdownChange(inputField.id, 'Reviewer')
                      }
                    >
                      Reviewer
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button
                  variant="ghost"
                  className="h-10 w-10 p-0"
                  onClick={() => handleDeleteInput(inputField.id)}
                >
                  <FaTrash className="h-5 w-5 text-[#9B9B9B]" />
                </Button>
              </div>
              {inputField.error && (
                <div className="flex items-center gap-1">
                  <PiWarningFill size={14} className="text-error" />
                  <p className="text-error mt-1 text-xs">{inputField.error}</p>
                </div>
              )}
            </div>
          </Command>
        ))}

        <div className="mt-4 space-y-[6px]">
          <Button
            onClick={handleAddInput}
            className="flex w-full items-center justify-center gap-1 bg-[#80808029] text-[#333333E5] hover:bg-neutral-300"
          >
            <Plus size={16} />
            Add
          </Button>
          <Button
            onClick={handleSave}
            className="flex w-full items-center justify-center gap-1 text-white"
          >
            <HiCheckCircle className="text-lg" />
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
