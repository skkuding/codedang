import { SwitchField } from '@/app/admin/_components/SwitchField'
import React from 'react'

export function FreezeSection() {
  return (
    <div className="flex h-[114px] w-[641px] flex-col justify-evenly rounded-xl border border-[#80808040] bg-[#80808014] px-7">
      <SwitchField
        name="invitationCode"
        title="Invitation Code"
        type="number"
        formElement="input"
        placeholder="Enter a invitation code"
      />
      <SwitchField
        name="invitationCode"
        title="Invitation Code"
        type="number"
        formElement="input"
        placeholder="Enter a invitation code"
      />
    </div>
  )
}
