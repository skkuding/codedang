'use client'

import { DropdownMenuItem } from '@/components/shadcn/dropdown-menu'
import { cn } from '@/libs/utils'
import { useTranslate } from '@tolgee/react'
import { LogOut, UserRoundCog } from 'lucide-react'
import type { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

interface AccountItemsProps {
  session: Session | null
  isAnyGroupLeader: boolean
  isAnyContestAdmin: boolean
  hasCreatePermission: boolean
  isUser: boolean
  isEditor: boolean
  showSignIn: () => void
  showSignUp: () => void
}

export function AccountItems({
  session,
  isAnyGroupLeader,
  isAnyContestAdmin,
  hasCreatePermission,
  isUser,
  isEditor,
  showSignIn,
  showSignUp
}: AccountItemsProps) {
  const { t } = useTranslate()

  if (session) {
    return (
      <>
        {(isAnyGroupLeader ||
          isAnyContestAdmin ||
          hasCreatePermission ||
          !isUser) && (
          <Link href="/admin">
            <DropdownMenuItem
              className={cn(
                'flex cursor-pointer items-center gap-1',
                isEditor
                  ? 'rounded-none text-white focus:bg-[#222939] focus:text-white'
                  : 'font-semibold'
              )}
            >
              <UserRoundCog className="size-4" /> {t('management')}
            </DropdownMenuItem>
          </Link>
        )}
        <Link href="/settings">
          <DropdownMenuItem
            className={cn(
              'flex cursor-pointer items-center gap-1',
              isEditor
                ? 'rounded-none text-white focus:bg-[#222939] focus:text-white'
                : 'font-semibold'
            )}
          >
            <UserRoundCog className="size-4" /> {t('settings')}
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem
          className={cn(
            'flex cursor-pointer items-center gap-1',
            isEditor
              ? 'rounded-none text-white focus:bg-[#222939] focus:text-white'
              : 'font-semibold'
          )}
          onClick={() => {
            signOut({ callbackUrl: '/', redirect: true })
          }}
        >
          <LogOut className="size-4" /> {t('log_out')}
        </DropdownMenuItem>
      </>
    )
  }

  return (
    <>
      <DropdownMenuItem
        className="flex cursor-pointer items-center gap-1 font-semibold"
        onClick={() => showSignIn()}
      >
        {t('log_in')}
      </DropdownMenuItem>
      <DropdownMenuItem
        className="flex cursor-pointer items-center gap-1 font-semibold"
        onClick={() => {
          showSignUp()
        }}
      >
        {t('sign_up')}
      </DropdownMenuItem>
    </>
  )
}
