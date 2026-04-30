'use client'

import type { InputProps } from '@/components/shadcn/input'
import { SearchInput } from '@/components/shadcn/search-input'
import type { Route } from 'next'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

interface URLSearchBarProps {
  placeholder?: string
  containerClassName?: string
  className?: string
  sizeVariant?: InputProps['sizeVariant']
}

interface Inputs {
  search: string
}

const buildUrl = (pathname: string, params: URLSearchParams): Route =>
  `${pathname}${params.size ? `?${params}` : ''}` as Route

export function URLSearchBar({
  placeholder = 'Search',
  containerClassName,
  className,
  sizeVariant = 'sm'
}: URLSearchBarProps) {
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
    <form onSubmit={handleSubmit(onSubmit)}>
      <SearchInput
        placeholder={placeholder}
        sizeVariant={sizeVariant}
        containerClassName={containerClassName}
        className={className}
        {...register('search')}
      />
    </form>
  )
}
