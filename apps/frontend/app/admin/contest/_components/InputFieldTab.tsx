import { Button } from '@/components/shadcn/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem
} from '@/components/shadcn/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectGroup
} from '@/components/shadcn/select'
import { Textarea } from '@/components/shadcn/textarea'
import { ALLOWED_DOMAINS } from '@/libs/constants'
import { isHttpError, safeFetcherWithAuth } from '@/libs/utils'
import { useTranslate } from '@tolgee/react'
import { useEffect, useRef, useState } from 'react'
import { BiEnvelope } from 'react-icons/bi'
import { FaChevronDown } from 'react-icons/fa6'
import { HiMiniAtSymbol, HiMiniPlus } from 'react-icons/hi2'
import { toast } from 'sonner'
import type { ContestManagerReviewer } from '../_libs/schemas'

interface InputFieldInterface {
  value: string
  domain: string
  role: string
}

// TODO: handle strictly null userProfile
interface UserResInterface {
  username: string
  id: number
  userProfile?: {
    realName: string
  }
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

export function InputFieldTab({
  users,
  inputField,
  setUsers,
  setInputField,
  participants
}: InputFieldTabProps) {
  const { t } = useTranslate()
  const [isDirect, setIsDirect] = useState(false)
  const inputDirectRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isDirect && inputDirectRef.current) {
      inputDirectRef.current.focus()
    }
  }, [isDirect])

  const handleDomainDropdownChange = (value: string) => {
    if (value === 'Enter directly') {
      setInputField((prevField) => ({ ...prevField, domain: '' }))
      setIsDirect(true)
    } else {
      setInputField((prevField) => ({ ...prevField, domain: value }))
      setIsDirect(false)
    }
  }

  const handleRoleDropdownChange = (value: string) => {
    setInputField((prevField) => ({ ...prevField, role: value }))
  }

  const fetchUserData = async () => {
    try {
      const email = `${inputField.value}@${inputField.domain}`
      const role = inputField.role
      const res: UserResInterface = await safeFetcherWithAuth
        .get('user/email', {
          searchParams: {
            email
          }
        })
        .json()

      const isParticipant = participants.some(
        (participant) => participant.user.email === email
      )
      if (isParticipant) {
        toast.error(t('error_email_registered_as_participant'))
        return
      }

      const isSelected = users.some((user) => user.email === email)
      if (isSelected) {
        toast.error(t('error_email_already_selected'))
        return
      }

      setUsers((prevUsers) => [
        {
          id: res.id,
          email,
          username: res.username,
          realName: res.userProfile?.realName ?? '',
          type: role
        },
        ...prevUsers
      ])
      setInputField((prevField) => ({ ...prevField, value: '' }))
    } catch (error) {
      const errorMessage =
        isHttpError(error) && error.response.status === 404
          ? t('error_no_user_exists')
          : t('error_invalid_email_format')
      toast.error(errorMessage)
      return
    }
  }

  return (
    <div className="flex w-full justify-between">
      <div className="flex w-full gap-[4px]">
        <div className="border-color-line-default flex max-w-[245px] flex-1 items-center gap-[10px] rounded-full border-[1px] border-solid px-[20px]">
          <div className="grid place-content-center">
            <BiEnvelope
              size={18}
              className={
                inputField.value
                  ? `text-color-neutral-30`
                  : `text-color-neutral-70`
              }
            />
          </div>
          <Textarea
            id="email-input"
            value={inputField.value}
            placeholder={t('placeholder_enter_email')}
            className="min-h-none placeholder:text-color-neutral-90 max-h-[24px] resize-none truncate rounded-none border-none p-0 text-base font-normal shadow-none focus-visible:ring-0"
            onChange={(value) =>
              setInputField((prevField) => ({
                ...prevField,
                value: value.target.value
              }))
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                fetchUserData()
              }
            }}
          />
        </div>
        {isDirect ? (
          <div className="border-color-line-default flex h-[40px] max-w-[245px] flex-1 items-center gap-[6px] rounded-full border-[1px] border-solid pl-4 pr-2 text-base font-normal">
            <div className="grid size-[20px] place-content-center">
              <HiMiniAtSymbol size={16.67} className="text-color-neutral-30" />
            </div>
            <div className="min-w-[170px]">
              <Textarea
                ref={inputDirectRef}
                value={inputField.domain}
                placeholder={t('placeholder_enter_directly')}
                className="min-h-none placeholder:text-color-neutral-90 z-100 max-h-[24px] resize-none truncate rounded-none border-none p-0 text-base font-normal shadow-none focus-visible:ring-0"
                onChange={(value) =>
                  setInputField((prevField) => ({
                    ...prevField,
                    domain: value.target.value
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    fetchUserData()
                  }
                }}
              />
            </div>
            <Select
              onValueChange={handleDomainDropdownChange}
              value={t('select_enter_directly')}
            >
              <SelectTrigger className="max-w-[16px] border-none bg-transparent p-0 focus:ring-0 focus:ring-offset-0">
                <div className="grid place-content-center">
                  <FaChevronDown size={16} className="text-color-neutral-90" />
                </div>
              </SelectTrigger>
              <SelectContent
                className={`w-[245px] -translate-x-[218px] bg-white`}
              >
                <SelectGroup>
                  {ALLOWED_DOMAINS.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain}
                    </SelectItem>
                  ))}
                  <SelectItem key={'Enter directly'} value="Enter directly">
                    {t('select_enter_directly')}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <Select
            value={ALLOWED_DOMAINS[0]}
            onValueChange={handleDomainDropdownChange}
          >
            <SelectTrigger className="text-color-common-0 flex h-[40px] max-w-[245px] flex-1 gap-[6px] rounded-full pl-4 pr-2 text-base font-normal focus:ring-0 focus:ring-offset-0">
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
              <div className="grid place-content-center">
                <FaChevronDown size={16} className="text-color-neutral-90" />
              </div>
            </SelectTrigger>
            <SelectContent
              className={`max-w-[245px] bg-white ${isDirect && '-translate-x-[101px]'}`}
            >
              <SelectGroup>
                {ALLOWED_DOMAINS.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
                <SelectItem key={'Enter directly'} value="Enter directly">
                  {t('select_enter_directly')}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="text-color-common-0 flex h-[40px] max-w-[120px] flex-none items-center gap-[4px] px-[19.5px] text-base font-normal"
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
              {t('role_manager')}
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={inputField.role === 'Reviewer'}
              onCheckedChange={() => handleRoleDropdownChange('Reviewer')}
            >
              {t('role_reviewer')}
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Button
        variant="outline"
        className="border-color-blue-50 hover:bg-color-blue-80 h-full w-full max-w-[90px] cursor-pointer border-[1px]"
        onClick={() => fetchUserData()}
      >
        <div className="text-color-blue-50 flex h-full items-center gap-[4px] px-[22px]">
          <HiMiniPlus size={16} />
          <p className="text-sm font-medium">{t('button_add')}</p>
        </div>
      </Button>
    </div>
  )
}
