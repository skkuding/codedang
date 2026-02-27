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
          <DialogTitle className="text-head5_sb_24 pt-5">
            Unfreeze Leaderboard?
          </DialogTitle>
          <DialogDescription>
            <div className="text-body4_r_14 flex flex-col items-center pt-[14px] text-[#737373]">
              <p>The number of submissions, penalties,</p>
              <p>and correctness status will be visible to everyone.</p>
              <p>Rankings may change after the leaderboard is unfrozen.</p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-row items-center justify-center pl-0 sm:items-center sm:justify-center">
          <DialogClose asChild>
            <Button className="text-sub4_sb_14 flex h-[44px] w-[170px] flex-row items-center justify-center rounded-full border border-[#C4C4C4] bg-white text-[#8A8A8A] hover:bg-[#80808014]">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              className="text-sub4_sb_14 flex h-[44px] w-[170px] flex-row items-center justify-center rounded-full bg-[#3581FA] text-white"
              onClick={() => {
                toggleUnfreeze()
                setIsUnFrozen(!isUnFrozen)
              }}
            >
              Unfreeze
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
