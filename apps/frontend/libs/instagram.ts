import {
  SecretsManagerClient,
  GetSecretValueCommand
} from '@aws-sdk/client-secrets-manager'
import { cache } from 'react'
import 'server-only'

const client = new SecretsManagerClient({ region: process.env.AWS_REGION })

export const getInstagramToken = cache(async () => {
  const command = new GetSecretValueCommand({
    SecretId: 'Instagram_Access_Token'
  })
  const response = await client.send(command)
  const secret = JSON.parse(response.SecretString || '{}')

  const token = secret.access_token
  if (!token) {
    throw new Error('Instagram_Access_Token not found in secret.')
  }
  return token
})

export async function fetchInstagramMedia() {
  const token = await getInstagramToken()
  if (!token) {
    throw new Error('Instagram access token is not available')
  }
  const url = `https://graph.instagram.com/v23.0/24748516551450633/media?access_token=${token}&fields=id,caption,media_url,permalink,timestamp,media_type`

  const res = await fetch(url, { cache: 'force-cache' })
  if (!res.ok) {
    throw new Error(`Instagram API failed: ${res.status}`)
  }
  return res.json()
}
