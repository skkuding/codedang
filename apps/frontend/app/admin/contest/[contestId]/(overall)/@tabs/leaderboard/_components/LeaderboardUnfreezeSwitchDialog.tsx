'use client'

import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/shadcn/dialog'
import { Switch } from '@/components/shadcn/switch'
import { UPDATE_CONTEST } from '@/graphql/contest/mutations'
import { useMutation } from '@apollo/client'
import { useTranslate } from '@tolgee/react'
import { useState } from 'react'

interface LeaderboardUnfreezeDialogProps {
  contestId: number
  isUnFrozen: boolean
  activated: boolean
}

export function LeaderboardUnfreezeSwitchDialog({
  contestId,
  isUnFrozen,
  activated
}: LeaderboardUnfreezeDialogProps) {
  const [isUnfrozen, setIsUnFrozen] = useState<boolean>(isUnFrozen)
  const [updateContest] = useMutation(UPDATE_CONTEST)
  const { t } = useTranslate()

  const toggleUnfreeze = async () => {
    try {
      await updateContest({
        variables: {
          contestId,
          input: {
            unfreeze: !isUnfrozen
          }
        }
      })
    } catch (err) {
      console.error('Error updating contest:', err)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Switch
          disabled={isUnfrozen}
          checked={activated ? isUnfrozen : false}
          className={`h-[24px] w-[46px] aria-checked:bg-[#3581FA] ${!activated ? 'aria-[checked=false]:bg-[#C4C4C4]' : 'aria-[checked=false]:bg-[#80808014]'} `}
          thumbClassName="w-[18px] h-[18px] data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-[2px]"
        />
      </DialogTrigger>
      <DialogContent
        className="h-[269px] w-[424px] rounded-2xl"
        hideCloseButton={true}
        style={{
          boxShadow:
            '2px 2px 8px -1px rgba(0, 0, 0, 0.25), 1px 1px 8px 0px rgba(17, 17, 17, 0.15)'
        }}
      >
        <DialogHeader className="flex flex-col items-center">
          <DialogTitle className="pt-5 text-2xl font-semibold">
            {t('unfreeze_leaderboard')}
          </DialogTitle>
          <DialogDescription>
            <div className="flex flex-col items-center pt-[14px] text-[14px] text-[#737373]">
              <p>{t('submissions_visibility_notice_1')}</p>
              <p>{t('submissions_visibility_notice_2')}</p>
              <p>{t('ranking_change_notice')}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row items-center justify-center pl-0 sm:items-center sm:justify-center">
          <DialogClose asChild>
            <Button className="flex h-[44px] w-[170px] flex-row items-center justify-center rounded-full border border-[#C4C4C4] bg-white text-[14px] font-semibold text-[#8A8A8A] hover:bg-[#80808014]">
              {t('cancel')}
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className="flex h-[44px] w-[170px] flex-row items-center justify-center rounded-full bg-[#3581FA] text-[14px] font-semibold text-white"
              onClick={() => {
                toggleUnfreeze()
                setIsUnFrozen(!isUnFrozen)
              }}
            >
              {t('unfreeze')}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
