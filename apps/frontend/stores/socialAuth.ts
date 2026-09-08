import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface SocialAuthStore {
  oauthToken: string | null
  setOauthToken: (oauthToken: string) => void
  clearOauthToken: () => void
}

export const useSocialAuthStore = create<SocialAuthStore>()(
  persist(
    (set) => ({
      oauthToken: null,
      setOauthToken: (oauthToken: string) => set({ oauthToken }),
      clearOauthToken: () => set({ oauthToken: null })
    }),
    { name: 'social-auth', storage: createJSONStorage(() => sessionStorage) }
  )
)
