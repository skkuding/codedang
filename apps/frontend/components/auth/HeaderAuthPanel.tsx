'use client'

import { NotificationDropdown } from '@/components/notification/NotificationDropdown'
import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shadcn/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/shadcn/dropdown-menu'
import { cn, safeFetcherWithAuth } from '@/libs/utils'
import { useAuthModalStore } from '@/stores/authModal'
import type { Course } from '@/types/type'
import { ContestRole, type UserContest } from '@generated/graphql'
import { ChevronDown } from 'lucide-react'
import type { Session } from 'next-auth'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BiSolidUser } from 'react-icons/bi'
import { AccountItems } from './AccountItems'
import { AuthModal } from './AuthModal'
import { UpdateInformation } from './UpdateInformation'

interface HeaderAuthPanelProps {
  session: Session | null
  group?: 'default' | 'editor'
}

interface HeaderAuthUser {
  role: string
  studentId: string
  major: string
  canCreateCourse: boolean
  canCreateContest: boolean
}

export function HeaderAuthPanel({
  session,
  group = 'default'
}: HeaderAuthPanelProps) {
  const { currentModal, hideModal, showSignIn, showSignUp } = useAuthModalStore(
    (state) => state
  )
  const isUser = session?.user.role === 'User'

  const isEditor = group === 'editor'
  const [isUserInfoIncomplete, setIsUserInfoIncomplete] = useState(false)
  const pathname = usePathname()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [hasCreatePermission, setHasCreatePermission] = useState(false)
  const [isAnyGroupLeader, setIsAnyGroupLeader] = useState(false)
  const [isAnyContestAdmin, setIsAnyContestAdmin] = useState(false)

  useEffect(() => {
    if (!session) {
      return
    }

    const fetchUserInfo = async () => {
      try {
        const user: HeaderAuthUser = await safeFetcherWithAuth
          .get('user')
          .json()

        const isUserInfoIncomplete =
          user.role === 'User' &&
          (user.studentId === '0000000000' || user.major === 'none')

        setIsUserInfoIncomplete(isUserInfoIncomplete)

        setHasCreatePermission(user.canCreateCourse || user.canCreateContest)
      } catch (error) {
        console.error('Error fetching user info:', error)
      }
    }

    const checkIsAnyGroupLeader = async () => {
      try {
        const courses: Course[] = await safeFetcherWithAuth
          .get('course/joined')
          .json()

        const isAnyGroupLeader = courses.some((course) => course.isGroupLeader)
        setIsAnyGroupLeader(isAnyGroupLeader)
      } catch (error) {
        console.error('Error fetching group leader role:', error)
      }
    }

    const checkIsAnyContestAdmin = async () => {
      try {
        const response: UserContest[] = await safeFetcherWithAuth
          .get('contest/role')
          .json()

        const isAnyContestAdmin = response.some((userContest) => {
          return (
            userContest.role !== ContestRole.Participant &&
            userContest.role !== ContestRole.Reviewer
          )
        })
        setIsAnyContestAdmin(isAnyContestAdmin)
      } catch (error) {
        console.error('Error fetching contest roles:', error)
      }
    }
    fetchUserInfo()
    checkIsAnyGroupLeader()
    checkIsAnyContestAdmin()
  }, [session, pathname])

  const shouldUpdateUserInfo =
    isUserInfoIncomplete && pathname.split('/').pop() !== 'settings'

  return (
    <div className="ml-2 flex items-center gap-2">
      {session ? (
        <>
          <DropdownMenu onOpenChange={(open) => setIsDropdownOpen(open)}>
            <DropdownMenuTrigger
              className={cn(
                'hidden items-center gap-2 rounded-md px-4 py-1 lg:flex',
                isEditor ? 'border-0 ring-offset-0' : 'bg-primary text-white'
              )}
            >
              <BiSolidUser
                className={cn(
                  'h-4 w-4',
                  isEditor ? 'size-6 rounded-none text-gray-300' : 'text-white'
                )}
              />
              {!isEditor && (
                <p className="font-semibold text-white">
                  {session?.user.username}
                </p>
              )}
              <ChevronDown
                className={cn('w-4 text-white', isDropdownOpen && 'rotate-180')}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className={cn(
                'hidden lg:block',
                isEditor &&
                  'rounded-xs mr-5 border-none bg-[#4C5565] px-0 font-normal text-white'
              )}
            >
              <AccountItems
                session={session}
                isAnyGroupLeader={isAnyGroupLeader}
                isAnyContestAdmin={isAnyContestAdmin}
                hasCreatePermission={hasCreatePermission}
                isUser={isUser}
                isEditor={isEditor}
                showSignIn={showSignIn}
                showSignUp={showSignUp}
              />
            </DropdownMenuContent>
          </DropdownMenu>
          <NotificationDropdown isEditor={isEditor} />
          <Dialog open={shouldUpdateUserInfo}>
            <DialogContent
              className="min-h-120 max-w-82"
              hideCloseButton={true}
            >
              <UpdateInformation />
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <Dialog open={currentModal !== ''} onOpenChange={hideModal}>
          <DialogTrigger asChild>
            <Button
              onClick={() => showSignIn()}
              variant={'outline'}
              className={cn(
                'border-primary text-primary mr-3 hidden bg-transparent px-5 py-1 text-sm font-semibold hover:bg-[#EAF3FF] active:bg-[#D7E5FE] lg:block',
                isEditor &&
                  'h-8 border-none bg-[#EAF3FF] text-[11px] hover:bg-[#D7E5FE]'
              )}
            >
              Log In
            </Button>
          </DialogTrigger>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                showSignUp()
              }}
              className={cn(
                'hidden px-5 py-1 text-sm font-semibold lg:block',
                isEditor && 'h-8 text-[11px]'
              )}
            >
              Sign Up
            </Button>
          </DialogTrigger>
          <DialogContent
            onOpenAutoFocus={(e) => {
              e.preventDefault()
            }}
            onInteractOutside={(e) => {
              e.preventDefault()
            }}
            className="!h-[620px] !w-[380px] rounded-[10px]"
          >
            <DialogHeader className="hidden">
              <DialogTitle />
            </DialogHeader>
            <AuthModal />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
