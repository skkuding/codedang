import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { baseUrl } from './vars'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const fetcher = async <T>(path: string, options?: RequestInit) => {
  const res = await fetch(baseUrl + path, {
    ...options,
    headers: {
      ...options?.headers,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json'
    }
  })
  // TODO: handle error cases
  return (await res.json()) as T
}
