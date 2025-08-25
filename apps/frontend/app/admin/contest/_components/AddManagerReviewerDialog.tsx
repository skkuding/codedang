'use client'

import { Modal } from '@/components/Modal'
import { Button } from '@/components/shadcn/button'
import { ScrollArea, ScrollBar } from '@/components/shadcn/scroll-area'
import { ALLOWED_DOMAINS } from '@/libs/constants'
import React, { useEffect, useState } from 'react'
import { FaCircleExclamation } from 'react-icons/fa6'
import { HiMiniPlusCircle } from 'react-icons/hi2'
import type { ContestManagerReviewer } from '../_libs/schemas'
import { InputFieldTab } from './InputFieldTab'
import { SelectedUserTab } from './SelectedUserTab'

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

export function AddManagerReviewerDialog({
  managers,
  setManagers,
  participants = []
}: AddManagerReviewerDialogProps) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<ContestManagerReviewer[]>([])
  const [inputField, setInputField] = useState({
    value: '',
    domain: `${ALLOWED_DOMAINS[0]}`,
    role: 'Manager'
  })

  useEffect(() => {
    if (open) {
      setInputField({
        value: '',
        domain: `${ALLOWED_DOMAINS[0]}`,
        role: 'Manager'
      })
      setUsers([])
    }
  }, [open])

  const handleInvite = () => {
    const validUsers = users.filter((user) => user !== null)
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
          <span className="text-sm font-bold">Add</span>
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
      <div className="flex h-full flex-col gap-[30px]">
        <InputFieldTab
          users={users}
          inputField={inputField}
          setUsers={setUsers}
          setInputField={setInputField}
          participants={participants}
        />
        <ScrollArea className="relative max-h-[293px] w-full p-0 tracking-[-3%]">
          <div className="border-color-line-default flex min-h-[293px] flex-col gap-[10px] rounded-2xl border border-solid p-[30px]">
            <div className="text-primary mt-1 text-sm">
              {`${users.length} user(s) selected`}
            </div>
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
          <ScrollBar orientation="vertical" />
        </ScrollArea>
      </div>
    </Modal>
  )
}
