import { SetMetadata } from '@nestjs/common'

export const IS_AUTH_NOT_NEEDED_KEY = 'auth-not-needed'
export const AuthNotNeeded = () => SetMetadata(IS_AUTH_NOT_NEEDED_KEY, true)
