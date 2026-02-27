import { createServerInstance } from '@tolgee/react/server'
import { getLocale } from 'next-intl/server'
import { TolgeeBase } from './shared'

export const { getTolgee, getTranslate, T } = createServerInstance({
  getLocale,
  createTolgee: async (language) => {
    return await TolgeeBase().init({
      observerOptions: {
        fullKeyEncode: true
      },
      language
    })
  }
})
