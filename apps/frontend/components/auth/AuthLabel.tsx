import { IoIosLock } from 'react-icons/io'
import { IoPerson } from 'react-icons/io5'

export function IDLabel() {
  return (
    <div className="flex items-center gap-1">
      <IoPerson className="text-primary h-4 w-4" />
      <span className="text-color-neutral-30 text-base font-normal">
        User ID
      </span>
    </div>
  )
}

export function PasswordLabel() {
  return (
    <div className="flex items-center gap-1">
      <IoIosLock className="text-primary h-4 w-4" />
      <span className="text-color-neutral-30 text-base font-normal">
        Password
      </span>
    </div>
  )
}
