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
import { ALLOWED_DOMAINS } from '@/libs/constants'
import { fetcherWithAuth } from '@/libs/utils'
import emailIcon from '@/public/icons/email-symbol.svg'
import plusIcon from '@/public/icons/plus-line.svg'
import type { MemberRole } from '@/types/type'
import { useMutation } from '@apollo/client'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { useTranslate } from '@tolgee/react'
import Image from 'next/image'
import { useCallback, useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { IoMdCloseCircle } from 'react-icons/io'
import { MdOutlineEmail } from 'react-icons/md'
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

type SelectedUserDisplay = {
  email: string
  role: 'Instructor' | 'Student'
  userId: number
}

export function InviteManually({ courseId }: InviteManuallyProps) {
  const { t } = useTranslate()
  const roles: MemberRole[] = ['Instructor', 'Student']
  const userId = 0
  const [inviteUser] = useMutation(INVITE_USER)
  const [selectedList, setSelectedList] = useState<SelectedUserDisplay[]>([])

  const [selectDomain, setSelectDomain] = useState(ALLOWED_DOMAINS[0])
  const [emailDomain, setEmailDomain] = useState(ALLOWED_DOMAINS[0])
  const [isDirectInputMode, setIsDirectInputMode] = useState(false)

  const emailDomains = [...ALLOWED_DOMAINS, t('enter_directly')]

  const handleSelectChange = (value: string) => {
    setSelectDomain(value)

    if (value === t('enter_directly')) {
      setIsDirectInputMode(true)
      setEmailDomain('')
    } else {
      setIsDirectInputMode(false)
      setEmailDomain(value)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const typedValue = e.target.value.replaceAll('@', '')
    setEmailDomain(`@${typedValue}`)
  }

  const handleRoleChange = (
    userId: number,
    newRole: 'Instructor' | 'Student'
  ) => {
    setSelectedList((currentList) =>
      currentList.map((user) =>
        user.userId === userId ? { ...user, role: newRole } : user
      )
    )
  }

  const onFind: SubmitHandler<FindUserInput> = async (data) => {
    const emailRevised =
      data.email +
      (emailDomain.startsWith('@') ? emailDomain : `@${emailDomain}`)

    try {
      const res = await fetcherWithAuth('user/email', {
        searchParams: { email: emailRevised }
      })

      if (!res.ok) {
        toast.error(t('failed_to_find_user'))
        return
      }

      const userInfo: UserInfo = await res.json()
      setSelectedList((prev) =>
        prev.some((u) => u.email === emailRevised)
          ? prev
          : [
              ...prev,
              {
                email: emailRevised,
                role: inviteWatch('isGroupLeader') ? 'Instructor' : 'Student',
                userId: userInfo.id
              }
            ]
      )
    } catch (err) {
      console.error(err)
      toast.error(t('unexpected_error_occurred'))
    }
  }

  const onInvite: SubmitHandler<InviteUserInput> = useCallback(async () => {
    if (selectedList.length === 0) {
      toast.error(t('no_user_selected_to_invite'))
      return
    }

    const invitePromises = selectedList.map((user) =>
      inviteUser({
        variables: {
          groupId: Number(courseId),
          isGroupLeader: user.role === 'Instructor',
          userId: user.userId
        }
      })
    )

    try {
      const results = await Promise.allSettled(invitePromises)

      const resultSuccess = results.some(
        (result) => result.status === 'fulfilled'
      )

      if (resultSuccess) {
        toast.success(t('invited_successfully'), {
          style: {
            background: '#F0F8FF',
            color: '#0973DC',
            borderRadius: '1000px',
            border: '1px solid rgba(255, 255, 255, 0.10)'
          },
          closeButton: false
        })

        setSelectedList([])
      } else {
        toast.error(t('failed_to_invite_user'))
      }
    } catch {
      toast.error(t('unexpected_error_occurred'))
    }
  }, [inviteUser, courseId, selectedList, t])

  const {
    watch: findWatch,
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

  return (
    <div>
      <form
        onSubmit={() => {
          findHandleSubmit(onFind)()
        }}
        aria-label={t('invite_user_form_aria_label')}
        className="flex flex-col gap-3 rounded-lg border p-[30px]"
      >
        <span className="font-pretendard text-lg">{t('invite_manually')}</span>

        <div className="border-line flex flex-col items-start self-stretch border-b pb-[30px]">
          <div className="flex items-center gap-[10px] self-stretch">
            <div className="flex flex-1 items-center gap-1">
              <div className="flex h-10 w-[216px] items-center gap-[10px] rounded-full border border-gray-300 px-5">
                <MdOutlineEmail
                  className={
                    findWatch('email')
                      ? 'text-color-neutral-30 h-6 w-6'
                      : 'text-color-neutral-70 h-6 w-6'
                  }
                />
                <Input
                  id="email"
                  {...findRegister('email')}
                  placeholder={t('enter_the_email_placeholder')}
                  className="pl aceholder:text-color-neutral-90 rounded-none border-none !bg-transparent pl-0 text-base autofill:!bg-transparent focus:outline-none focus:ring-0 focus-visible:border-none focus-visible:outline-none focus-visible:ring-0"
                />
              </div>

              <div className="relative flex h-10 w-[200px] items-center rounded-full border border-gray-300 bg-white">
                <Select
                  value={selectDomain}
                  onValueChange={handleSelectChange}
                  defaultValue="@skku.edu"
                >
                  <SelectTrigger className="flex gap-[6px] border-none bg-transparent px-[14px] text-base focus-visible:ring-0 focus-visible:ring-offset-0">
                    <div className="flex items-center gap-[6px]">
                      <Image src={emailIcon} alt="emailIcon" />

                      {selectDomain !== t('enter_directly') ? (
                        <SelectValue placeholder={ALLOWED_DOMAINS[0]} />
                      ) : (
                        <div className="flex-grow" />
                      )}
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-lg bg-white shadow-md">
                    {emailDomains.map((domain) => (
                      <SelectItem key={domain} value={domain}>
                        {domain === t('enter_directly')
                          ? domain
                          : domain.replace('@', '')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {isDirectInputMode && (
                  <div className="flex items-center rounded-lg text-base">
                    <Input
                      value={emailDomain.replace('@', '')}
                      placeholder={t('enter_directly')}
                      onChange={handleInputChange}
                      className="w-35 absolute left-[20px] h-10 border-none bg-transparent text-base shadow-none focus-visible:ring-0"
                    />
                  </div>
                )}
              </div>

              <div className="border-line w-30 flex h-10 items-start justify-center rounded-full border bg-white px-5">
                <Select
                  value={
                    inviteWatch('isGroupLeader') ? 'Instructor' : 'Student'
                  }
                  onValueChange={(value) => {
                    inviteSetValue('isGroupLeader', value === 'Instructor')
                  }}
                >
                  <SelectTrigger className="flex w-auto items-center gap-2 border-none bg-transparent text-base leading-[150%] tracking-[-0.48px] text-black focus:outline-none">
                    <SelectValue placeholder={t('student')} />
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
            </div>

            <div
              className="border-primary flex cursor-pointer items-center justify-center gap-1 rounded-full border bg-white px-[22px] py-[10px]"
              onClick={() => findHandleSubmit(onFind)()}
            >
              <Image src={plusIcon} alt="plusIcon" />
              <span className="text-primary text-[14px] font-medium">
                {t('add_button')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start gap-[10px] self-stretch">
          <span className="text-primary overflow-hidden text-ellipsis text-sm font-normal">
            {t('user_count', { count: selectedList.length })}
          </span>

          <div className="flex flex-col items-start gap-2 self-stretch">
            {selectedList.map((user) => (
              <div
                key={user.userId}
                className="flex items-center gap-[10px] self-stretch"
              >
                <div className="border-line flex h-10 flex-1 items-center justify-between rounded-full border bg-white px-5">
                  <div className="flex items-center gap-[10px]">
                    <MdOutlineEmail className="h-5 w-5 text-gray-400" />
                    <span className="text-base">{user.email}</span>
                  </div>
                  <IoMdCloseCircle
                    className="h-[18px] w-[18px] cursor-pointer text-gray-400"
                    onClick={() =>
                      setSelectedList((prev) =>
                        prev.filter((u) => u.email !== user.email)
                      )
                    }
                  />
                </div>

                <div className="border-line flex h-10 w-[120px] items-center justify-center gap-1 rounded-full border bg-white px-5">
                  <span className="text-base">
                    <Select
                      value={user.role}
                      onValueChange={(value: 'Instructor' | 'Student') => {
                        handleRoleChange(user.userId, value)
                      }}
                    >
                      <SelectTrigger className="flex w-auto items-center gap-2 border-none bg-transparent text-base leading-[150%] tracking-[-0.48px] text-black focus:outline-none">
                        <SelectValue placeholder={t('student')} />
                      </SelectTrigger>
                      <SelectContent className="rounded-lg bg-white shadow-md">
                        {roles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </span>
                </div>
              </div>
            ))}
          </div>
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

      <Button
        type="button"
        className="bg-primary hover:bg-primary-strong mt-[30px] h-11 w-full rounded-full text-base text-white"
        onClick={() => inviteHandleSubmit(onInvite)()}
      >
        {t('invite_button')}
      </Button>
    </div>
  )
}
