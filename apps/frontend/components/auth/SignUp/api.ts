import { safeFetcher } from '@/libs/utils'

const sendEmail = async (email: string) => {
  await safeFetcher.post('email-auth/send-email/register-new', {
    json: { email }
  })
}

export const SignUpApi = {
  sendEmail
}
