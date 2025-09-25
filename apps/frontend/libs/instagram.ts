import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'
import { cache } from 'react'
import 'server-only'

const client = new SecretsManagerClient({ region: process.env.AWS_REGION })

export const getInstagramToken = cache(async () => {
  const command = new GetSecretValueCommand({
    SecretId: 'Codedang-Instagram-Token'
  })
  const response = await client.send(command)
  const secret = JSON.parse(response.SecretString || '{}')

  if (!secret.access_token) {
    console.error('access_token missing from secret - manual setup required')
    throw new ReferenceError(
      'No access_token found in the secret. If you just created the secret, please set an initial value manually.'
    )
  }

  return secret.access_token
})

export async function fetchInstagramMedia() {
  const token = await getInstagramToken()
  if (!token) {
    throw new Error('Instagram access token is not available')
  }
  const url = `https://graph.instagram.com/v23.0/24748516551450633/media?access_token=${token}&fields=id,caption,media_url,permalink,timestamp,media_type`

  const res = await fetch(url, {
    next: { revalidate: 604800, tags: ['instagram-media'] }
  })
  if (!res.ok) {
    throw new Error(`Instagram API failed: ${res.status}`)
  }
  return res.json()
}
