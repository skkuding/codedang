import { Button } from '@/components/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/shadcn/dropdown-menu'
import React from 'react'
import { BiEnvelope } from 'react-icons/bi'
import { FaChevronDown } from 'react-icons/fa6'
import { HiMiniXCircle } from 'react-icons/hi2'
import type { ContestManagerReviewer } from '../_libs/schemas'

interface SelectedUserTabProps {
  curUser: ContestManagerReviewer
  setUsers: React.Dispatch<React.SetStateAction<ContestManagerReviewer[]>>
}

export function SelectedUserTab({ curUser, setUsers }: SelectedUserTabProps) {
  const handleUserDropdownChange = (value: string) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === curUser.id ? { ...user, type: value } : user
      )
    )
  }

  const handleDeleteUser = () => {
    setUsers((prevUsers) => prevUsers.filter((user) => user.id !== curUser.id))
  }

  return (
    <div className="text-body3_r_16 flex gap-[10px]">
      <div className="border-color-line-default flex h-10 w-full max-w-[530px] cursor-pointer items-center justify-between rounded-full border border-solid px-[10px] py-[10px] text-black">
        <div className="ml-[10px] flex items-center gap-[10px]">
          <div className="grid place-content-center">
            <BiEnvelope size={18} className="text-color-neutral-70" />
          </div>
          <span>{curUser.email}</span>
        </div>

        <Button
          variant="ghost"
          className="text-body4_r_14 h-9 w-9 p-1"
          onClick={() => handleDeleteUser()}
        >
          <HiMiniXCircle className="text-color-neutral-80 h-5 w-5" />
        </Button>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="grow">
          <Button
            variant="outline"
            className="text-color-common-0 text-body3_r_16 h-10 pl-4 pr-2"
          >
            <p className="min-w-[67px] text-center">{curUser.type}</p>
            <div className="grid size-[16px] place-content-center">
              <FaChevronDown className="text-color-neutral-90" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="text-body3_r_16 w-full">
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
