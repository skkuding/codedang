import { GiGraduateCap } from 'react-icons/gi'
import { IoIosLock, IoMdListBox } from 'react-icons/io'
import { IoPerson } from 'react-icons/io5'

export function IDLabel() {
  return (
    <div className="flex items-center gap-1">
      <IoPerson className="text-primary h-4 w-4" />
      <span className="text-color-neutral-30 text-body3_r_16">User ID</span>
    </div>
  )
}

export function PasswordLabel() {
  return (
    <div className="flex items-center gap-1">
      <IoIosLock className="text-primary h-4 w-4" />
      <span className="text-color-neutral-30 text-body3_r_16">Password</span>
    </div>
  )
}

export function RealNameLabel() {
  return (
    <div className="flex items-center gap-1">
      <IoPerson className="text-primary h-4 w-4" />
      <span className="text-color-neutral-30 text-body3_r_16">Name</span>
    </div>
  )
}

export function StudentIDLabel() {
  return (
    <div className="flex items-center gap-1">
      <GiGraduateCap className="text-primary h-4 w-4" />
      <span className="text-color-neutral-30 text-body3_r_16">Student ID</span>
    </div>
  )
}

export function MajorLabel() {
  return (
    <div className="flex items-center gap-1">
      <IoMdListBox className="text-primary h-4 w-4" />
      <span className="text-color-neutral-30 text-body3_r_16">First Major</span>
    </div>
  )
}
