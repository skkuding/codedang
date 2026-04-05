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

const heightClassMap: Record<NonNullable<SearchBarProps['height']>, string> = {
  sm: '!h-[36px]',
  md: '!h-[40px]',
  lg: '!h-[46px]'
}

const buildUrl = (pathname: string, params: URLSearchParams): Route =>
  `${pathname}${params.size ? `?${params}` : ''}` as Route

export function SearchBar({
  className,
  height = 'sm',
  fontSize
}: SearchBarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const search = searchParams.get('search')

  const { register, handleSubmit, reset } = useForm<Inputs>({
    defaultValues: { search: search ?? '' }
  })

  useEffect(() => {
    reset({ search: search ?? '' })
  }, [search, reset])

  const onSubmit = ({ search }: Inputs) => {
    const newParams = new URLSearchParams(searchParams.toString())
    search ? newParams.set('search', search) : newParams.delete('search')
    router.push(buildUrl(pathname, newParams), { scroll: false })
  }

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
      />
    </form>
  )
}
