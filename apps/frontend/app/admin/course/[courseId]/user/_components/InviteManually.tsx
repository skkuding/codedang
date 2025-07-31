'use client'

import { ErrorMessage } from '@/app/admin/_components/ErrorMessage'
import { Button } from '@/components/shadcn/button'
import { Input } from '@/components/shadcn/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { INVITE_USER } from '@/graphql/user/mutation'
import { fetcherWithAuth } from '@/libs/utils'
import type { MemberRole } from '@/types/type'
import { useMutation } from '@apollo/client'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useCallback, useEffect, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { MdOutlineEmail, MdOutlineAddCircle } from 'react-icons/md'
import { toast } from 'sonner'
import { findUserSchema, inviteUserSchema } from '../_libs/schema'

interface InviteUserInput {
  groupId: number
  userId: number
  isGroupLeader: boolean
}

interface FindUserInput {
  email: string
}

interface InviteManuallyProps {
  courseId: string
}

interface UserInfo {
  userName: string
  id: number
}

type SearchedUserDisplay = {
  email: string
  role: 'Instructor' | 'Student'
}

type InvitedUserDisplay = {
  email: string
  role: 'Instructor' | 'Student'
}

export function InviteManually({ courseId }: InviteManuallyProps) {
  const roles: MemberRole[] = ['Instructor', 'Student']
  const [searchedUserId, setSearchedUserId] = useState(0)
  const [userId, setUserId] = useState(0)

  const [invitedList, setInvitedList] = useState<InvitedUserDisplay[]>([])
  const [inviteUser] = useMutation(INVITE_USER)

  const [searchedList, setSearchedList] = useState<SearchedUserDisplay[]>([])
  const [selectedList, setSelectedList] = useState<SearchedUserDisplay[]>([])

  const onFind: SubmitHandler<FindUserInput> = async (data) => {
    try {
      const res = await fetcherWithAuth('user/email', {
        searchParams: { email: data.email }
      })

      if (!res.ok) {
        toast.error('Failed to find user')
        setSearchedList([])
        return
      }

      const userInfo: UserInfo = await res.json()
      setSearchedUserId(userInfo.id)
      setSearchedList([
        {
          email: data.email,
          role: inviteWatch('isGroupLeader') ? 'Instructor' : 'Student'
        }
      ])
    } catch (err) {
      console.error(err)
      toast.error('Unexpected error occurred')
    }
  }

  const onInvite: SubmitHandler<InviteUserInput> = useCallback(
    async (data) => {
      if (!userId) {
        toast.error('No user selected to invite')
        return
      }

      try {
        const result = await inviteUser({
          variables: {
            groupId: Number(courseId),
            isGroupLeader: data.isGroupLeader,
            userId
          }
        })

        setInvitedList((prevList) => [
          ...prevList,
          {
            email: result.data?.inviteUser.user.email ?? '',
            role: result.data?.inviteUser.isGroupLeader
              ? 'Instructor'
              : 'Student'
          }
        ])

        toast.success('Invited Successfully!', {
          style: {
            background: '#F0F8FF',
            color: '#0973DC',
            borderRadius: '1000px',
            border: '1px solid rgba(255, 255, 255, 0.10)',
            maxWidth: '200px'
          },
          closeButton: false
        })
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
      groupId: Number(courseId),
      isGroupLeader: false
    }
  })

  // useEffect(() => {
  //   if (userId !== 0) {
  //     inviteHandleSubmit(onInvite)()
  //   }
  // }, [inviteHandleSubmit, onInvite, userId])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        findHandleSubmit(onFind)()
      }}
      aria-label="Invite user"
      className="flex flex-col gap-[20px] rounded-lg border p-[30px]"
    >
      <span className="text-lg">Invite Manually</span>
      <div className="flex w-full flex-col gap-4">
        <div className="flex h-[40px] items-center rounded-full border border-gray-300 px-5 py-2">
          <MdOutlineEmail className="h-5 w-5 text-gray-400" />

          <Input
            id="email"
            {...findRegister('email')}
            placeholder="Please enter the e-mail"
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

        {searchedList.map((user) => (
          <div className="flex items-center gap-[10px] self-stretch">
            <div className="flex h-10 flex-[1_0_0] items-center justify-between rounded-full bg-gray-100 px-5">
              <div className="flex items-center gap-[10px]">
                <MdOutlineEmail className="h-5 w-5 text-gray-400" />
                <span className="text-sm">{user.email}</span>
              </div>
              <MdOutlineAddCircle
                className="h-[18px] w-[18px] cursor-pointer text-gray-400"
                onClick={() =>
                  selectedList.includes(user)
                    ? console.log('no')
                    : setSelectedList((prev) => [...prev, user])
                }
              />
            </div>

            <div className="flex h-10 w-[120px] items-center justify-center gap-1 rounded-full bg-gray-100 px-5">
              <span className="text-sm">{user.role}</span>
            </div>
          </div>
        ))}

        <Button
          type="button"
          className="bg-primary hover:bg-primary-strong h-[44px] w-full rounded-full text-sm font-semibold text-white"
          onClick={() => inviteHandleSubmit(onInvite)()}
        >
          Invite
        </Button>
      </div>
      {findErrors.email && <ErrorMessage message={findErrors.email.message} />}
      {inviteErrors.groupId && (
        <ErrorMessage message={inviteErrors.groupId.message} />
      )}
      {inviteErrors.userId && (
        <ErrorMessage message={inviteErrors.userId.message} />
      )}
      {inviteErrors.isGroupLeader && (
        <ErrorMessage message={inviteErrors.isGroupLeader.message} />
      )}
      {invitedList.length === 0 && <div className="mt-[60px]" />}

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
    </form>
  )
}
