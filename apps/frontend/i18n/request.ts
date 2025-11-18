import { getRequestConfig } from 'next-intl/server'

export const requestConfig = getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale
  return {
    locale: locale ?? 'en',
    messages: { locale: locale ?? 'en' } // do this to make next-intl not emit any warnings
  }
})
