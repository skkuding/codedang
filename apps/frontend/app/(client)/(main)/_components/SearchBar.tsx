'use client'

import { Input } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
import { useTranslate } from '@tolgee/react'
import type { Route } from 'next'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { IoSearch } from 'react-icons/io5'

interface Inputs {
  search: string
}

interface SearchBarProps {
  className?: string
}

export function SearchBar({ className }: SearchBarProps) {
  const { t } = useTranslate()
  const router = useRouter()
  const pathname = usePathname()
  const searchParam = useSearchParams()
  const search = searchParam.get('search')
  const { register, handleSubmit, setValue } = useForm<Inputs>()
  const onSubmit = (data: Inputs) => {
    const newParam = new URLSearchParams()
    // set all searchParam to newParam
    searchParam.forEach((value, key) => newParam.set(key, value))
    // set search data to newParam
    if (data.search) {
      newParam.set('search', data.search)
    } else {
      newParam.delete('search')
    }
    const newParamString = newParam.toString()
    router.push(
      `${pathname}${newParamString ? `?${newParamString}` : ''}` as Route,
      {
        scroll: false
      }
    )
  }

  useEffect(() => {
    // set search value from searchParam when page is loaded
    setValue('search', search ?? '')
  }, [search, setValue])

  return (
    <form
      className={cn('relative', className)}
      onSubmit={handleSubmit(onSubmit)}
    >
      <IoSearch
        className="text-muted-foreground absolute left-3 top-[10px] h-4 w-4"
        color="#C4C4C4"
      />
      <Input
        placeholder={t('search_bar_placeholder')}
        className="h-9 rounded-full px-8 placeholder:text-[#8A8A8A]"
        {...register('search')}
        defaultValue={search ?? ''}
      />
    </form>
  )
}
