import { useEffect, useState } from 'react'
import { useLocalStorage } from 'react-use'

export const useStorage = <T>(key: string, initialValue?: T) => {
  const [value, setValue] = useLocalStorage(key, initialValue)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return { value: initialValue, setValue } as const
  }
  return { value, setValue } as const
}
