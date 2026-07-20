import { create } from 'zustand'

interface SocialAuthStore {
  oauthToken: string | null
  setOauthToken: (oauthToken: string) => void
  clearOauthToken: () => void
}

export const useSocialAuthStore = create<SocialAuthStore>((set) => ({
  oauthToken: null,
  setOauthToken: (oauthToken: string) => set({ oauthToken }),
  clearOauthToken: () => set({ oauthToken: null })
}))
