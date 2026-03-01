'use client'

import { Input } from '@/components/shadcn/input'
import { cn } from '@/libs/utils'
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
  height?: 'sm' | 'md' | 'lg'
  fontSize?: 'base' | 'lg'
}

const heightClassMap = {
  sm: '!h-[36px]',
  md: '!h-[40px]',
  lg: '!h-[46px]'
}

export function SearchBar({
  className,
  height = 'sm',
  fontSize
}: SearchBarProps) {
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
      className={cn('relative min-w-[184px] max-w-[580px]', className)}
      onSubmit={handleSubmit(onSubmit)}
    >
      <IoSearch
        className="text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
        color="#C4C4C4"
      />
      <Input
        placeholder="Search"
        sizeVariant="sm"
        className={cn(
          'rounded-full px-8 placeholder:text-[#C4C4C4]',
          heightClassMap[height],
          fontSize === 'lg'
            ? 'text-lg placeholder:text-lg'
            : 'text-base placeholder:text-base'
        )}
        {...register('search')}
        defaultValue={search ?? ''}
      />
    </form>
  )
}
