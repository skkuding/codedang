import { DevTools, Tolgee, FormatSimple, BackendFetch } from '@tolgee/web'

const apiKey = process.env.NEXT_PUBLIC_TOLGEE_API_KEY
const apiUrl =
  process.env.NEXT_PUBLIC_TOLGEE_API_URL || 'https://tolgee.jwoojin.com'
const cdnUrl =
  process.env.NEXT_PUBLIC_TOLGEE_CDN_URL ||
  'https://assets.jwoojin.com/95fee5c1df61c243a07e39498efd9644'

export const ALL_LANGUAGES = ['en', 'ko-KR']
export const DEFAULT_LANGUAGE = 'ko-KR'

export function TolgeeBase() {
  return Tolgee()
    .use(FormatSimple())
    .use(DevTools())
    .use(
      BackendFetch({
        prefix: cdnUrl,
        next: {
          revalidate: 60, // 60 seconds
          tags: ['tolgee-translations']
        }
      })
    )
    .updateDefaults({
      apiKey,
      apiUrl,
      defaultLanguage: DEFAULT_LANGUAGE,
      availableLanguages: ALL_LANGUAGES,
      fallbackLanguage: 'en'
    })
}
