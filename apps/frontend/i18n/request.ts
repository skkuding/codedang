import { DEFAULT_LANGUAGE, ALL_LANGUAGES } from '@/tolgee/shared'
import { getRequestConfig } from 'next-intl/server'
import { cookies } from 'next/headers'

// eslint-disable-next-line
export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const localeCookie = cookieStore.get('NEXT_LOCALE')?.value
  const locale =
    localeCookie && ALL_LANGUAGES.includes(localeCookie)
      ? localeCookie
      : DEFAULT_LANGUAGE

  return {
    locale,
    messages: {}
  }
})
