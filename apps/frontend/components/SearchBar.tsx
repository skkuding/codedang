'use client'

import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import type { Route } from 'next'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from './ui/input'

interface Inputs {
  search: string
}

interface SearchBarProps {
  className?: string
}

export default function SearchBar({ className }: SearchBarProps) {
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
    } else newParam.delete('search')
    const newParamString = newParam.toString()
    router.push(
      `${pathname}${newParamString ? '?' + newParamString : ''}` as Route,
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
      <Search className="text-muted-foreground absolute left-2 top-3 h-4 w-4" />
      <Input
        placeholder="Search"
        className="px-8"
        {...register('search')}
        defaultValue={search ?? ''}
      />
    </form>
  )
}
