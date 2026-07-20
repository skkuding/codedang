const STORAGE_KEY = 'social-login-promo-dismissed-date'

const getTodayString = () => new Date().toDateString()

export const isSocialLoginPromoDismissedToday = () => {
  if (typeof window === 'undefined') {
    return false
  }
  return localStorage.getItem(STORAGE_KEY) === getTodayString()
}

export const dismissSocialLoginPromoForToday = () => {
  localStorage.setItem(STORAGE_KEY, getTodayString())
}
