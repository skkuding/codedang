import { getServerSession as getServerSessionOriginal } from 'next-auth'
import { authOptions } from './authOptions'

export const getServerSession = () => getServerSessionOriginal(authOptions)
