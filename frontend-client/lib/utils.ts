import { type ClassValue, clsx } from 'clsx'
import ky from 'ky'
import { twMerge } from 'tailwind-merge'
import { baseUrl } from './vars'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const fetcher = ky.create({
  prefixUrl: baseUrl,
  throwHttpErrors: false
})
