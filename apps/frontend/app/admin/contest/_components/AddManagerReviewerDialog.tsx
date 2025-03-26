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
import { GET_USERS } from '@/graphql/user/queries'
import { cn } from '@/libs/utils'
import { useSuspenseQuery } from '@apollo/client/react/hooks/useSuspenseQuery'
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
}

export function AddManagerReviewerDialog({
  managers,
  setManagers
}: AddManagerReviewerDialogProps) {
  const [inputCount, setInputCount] = useState(1) // State to manage the number of CommandInput components
  const [values, setValues] = useState<string[]>(['']) // State to manage the values of each CommandInput
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null) // State to manage the focused input index
  const [dropdownValues, setDropdownValues] = useState<string[]>(['Manager']) // State to manage the selected dropdown values for each CommandInput
  const [selectedNum, setSelectedNum] = useState<number>(0)
  const [open, setOpen] = useState(false) // State to manage the open state of the dialog

  useEffect(() => {
    if (open) {
      setValues([''])
      setDropdownValues(['Manager'])
      setInputCount(1)
    }
  }, [open])

  const { data } = useSuspenseQuery(GET_USERS, {
    variables: {
      take: 5000
    }
  })

  const users = data.getUsers.map((user) => ({
    id: Number(user.id),
    email: user.email,
    username: user.username,
    realName: user.userProfile ? user.userProfile.realName : '',
    role: user.role
  }))

  const handleAddInput = () => {
    setInputCount((prevCount) => prevCount + 1)
    setValues((prevValues) => [...prevValues, ''])
    setDropdownValues((prevValues) => [...prevValues, 'Manager'])
  }

  const handleValueChange = (index: number, value: string) => {
    setValues((prevValues) => {
      const newValues = [...prevValues]
      newValues[index] = value
      return newValues
    })
  }

  const handleDropdownChange = (index: number, value: string) => {
    setDropdownValues((prevValues) => {
      const newValues = [...prevValues]
      newValues[index] = value
      return newValues
    })
  }

  const handleDeleteInput = (index: number) => {
    setValues((prevValues) => prevValues.filter((_, i) => i !== index))
    setDropdownValues((prevValues) => prevValues.filter((_, i) => i !== index))
    setInputCount((prevCount) => prevCount - 1)
  }

  const handleSave = () => {
    const newManagers: ContestManagerReviewer[] = values.map((email, index) => {
      const user = users.find((user) => user.email === email)
      return {
        id: user?.id || 0,
        email,
        username: user?.username || '',
        realName: user?.realName || '',
        type: dropdownValues[index]
      }
    })
    setManagers([...managers, ...newManagers])
    setOpen(false) // Close the dialog
  }

  useEffect(() => {
    setSelectedNum(
      values.filter((value) => users.some((user) => user.email === value))
        .length
    )
  }, [values, users])

  const hasDuplicate = (value: string, index: number) =>
    values.filter((v, i) => v === value && i !== index).length > 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="flex h-[36px] w-[100px] items-center gap-1 px-0"
          onClick={() => {
            console.log('values:', values)
            console.log('dropdownValues:', dropdownValues)
            console.log('managers:', managers)
          }}
        >
          <HiMiniPlusCircle className="h-5 w-5" />
          <div className="text-sm font-bold">Add</div>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[580px] px-10 py-[60px]">
        <DialogHeader className="justify-center gap-7">
          <DialogTitle className="text-center text-2xl">
            Add Contest Manager / Reviewer
          </DialogTitle>
          <DialogDescription
            className={cn(selectedNum > 0 ? 'text-primary' : 'text-[#9B9B9B]')}
          >
            {`${selectedNum} user(s) selected`}
          </DialogDescription>
        </DialogHeader>

        <Command className="gap-[6px]">
          {[...Array(inputCount)].map((_, index) => {
            return (
              <div key={index} className="flex flex-col">
                <div className="flex gap-2">
                  <div className="w-full max-w-[498px] gap-2">
                    <CommandInput
                      value={values[index]}
                      onValueChange={(value) => handleValueChange(index, value)}
                      emailType={true}
                      placeholder="Search Email"
                      className="ml-1 h-10 w-[300px] text-sm placeholder:text-neutral-300"
                      onFocus={() => {
                        setFocusedIndex(index)
                      }} // Set focused index on focus
                    />
                    {focusedIndex === index && values[index] && (
                      <CommandList>
                        <CommandEmpty>No results found.</CommandEmpty>
                        <CommandGroup className="px-0 pt-0">
                          {users
                            .filter((user) =>
                              user.email.includes(values[index])
                            )
                            .map((user) => (
                              <CommandItem
                                className="mt-1 w-full justify-between rounded-full bg-gray-100 py-[10px] text-sm text-black"
                                key={user.email}
                                value={user.email}
                                onSelect={() => {
                                  handleValueChange(index, user.email)
                                  setFocusedIndex(null) // Reset focused index on selection
                                }}
                              >
                                <span className="ml-5">{user.email}</span>
                                <HiMiniPlusCircle className="h-5 w-5 text-[#9B9B9B]" />
                              </CommandItem>
                            ))}
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
                        {dropdownValues[index]}{' '}
                        <ChevronDown
                          className="ml-[10px] h-5 w-5 text-[#B0B0B0]"
                          width={24}
                          height={24}
                        />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-full">
                      <DropdownMenuCheckboxItem
                        checked={dropdownValues[index] === 'Manager'}
                        onCheckedChange={() =>
                          handleDropdownChange(index, 'Manager')
                        }
                      >
                        Manager
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={dropdownValues[index] === 'Reviewer'}
                        onCheckedChange={() =>
                          handleDropdownChange(index, 'Reviewer')
                        }
                      >
                        Reviewer
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="ghost"
                    className="h-10 w-10 p-0"
                    onClick={() => handleDeleteInput(index)}
                  >
                    <FaTrash className="h-5 w-5 text-[#B0B0B0]" />
                  </Button>
                </div>
                {hasDuplicate(values[index], index) && (
                  <div className="flex items-center gap-1">
                    <PiWarningFill size={14} className="text-error" />
                    <p className="text-error text-xs">
                      This email address has already been added
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </Command>

        <div className="mt-2 space-y-[6px]">
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
