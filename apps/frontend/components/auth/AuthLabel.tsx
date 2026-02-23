import { useTranslate } from '@tolgee/react'
import { GiGraduateCap } from 'react-icons/gi'
import { IoIosLock, IoMdListBox } from 'react-icons/io'
import { IoPerson } from 'react-icons/io5'

export function IDLabel() {
  const { t } = useTranslate()
  return (
    <div className="flex items-center gap-1">
      <IoPerson className="text-primary h-4 w-4" />
      <span className="text-color-neutral-30 text-base font-normal">
        {t('user_id')}
      </span>
    </div>
  )
}

export function PasswordLabel() {
  const { t } = useTranslate()
  return (
    <div className="flex items-center gap-1">
      <IoIosLock className="text-primary h-4 w-4" />
      <span className="text-color-neutral-30 text-base font-normal">
        {t('password')}
      </span>
    </div>
  )
}

export function RealNameLabel() {
  const { t } = useTranslate()
  return (
    <div className="flex items-center gap-1">
      <IoPerson className="text-primary h-4 w-4" />
      <span className="text-color-neutral-30 text-base font-normal">
        {t('name')}
      </span>
    </div>
  )
}

export function StudentIDLabel() {
  const { t } = useTranslate()
  return (
    <div className="flex items-center gap-1">
      <GiGraduateCap className="text-primary h-4 w-4" />
      <span className="text-color-neutral-30 text-base font-normal">
        {t('student_id')}
      </span>
    </div>
  )
}

export function MajorLabel() {
  const { t } = useTranslate()
  return (
    <div className="flex items-center gap-1">
      <IoMdListBox className="text-primary h-4 w-4" />
      <span className="text-color-neutral-30 text-base font-normal">
        {t('first_major')}
      </span>
    </div>
  )
}
