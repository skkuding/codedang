import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'
import { unstable_cache } from 'next/cache'
import 'server-only'

const client = new SecretsManagerClient({ region: 'ap-northeast-2' })

export const getInstagramToken = unstable_cache(
  async () => {
    let secret: { access_token?: string } = {}
    try {
      const command = new GetSecretValueCommand({
        SecretId: 'Codedang-Instagram-Token'
      })
      const response = await client.send(command)
      secret = JSON.parse(response.SecretString || '{}')
    } catch (error) {
      console.error('Error fetching secret from AWS Secrets Manager:', error)
      throw new Error('Failed to fetch Instagram access token')
    }

    if (!secret.access_token) {
      console.error('access_token missing from secret - manual setup required')
      throw new ReferenceError(
        'No access_token found in the secret. If you just created the secret, please set an initial value manually.'
      )
    }

    return secret.access_token
  },
  ['instagram-token'],
  { revalidate: 86400 }
)

export async function fetchInstagramMedia() {
  let token = await getInstagramToken()
  const url = (t: string) =>
    `https://graph.instagram.com/v23.0/24748516551450633/media?access_token=${t}&fields=id,caption,media_url,permalink,timestamp,media_type&limit=4`

  let res = await fetch(url(token), {
    next: { revalidate: 604800, tags: ['instagram-media'] }
  })

  if (res.status === 400 || res.status === 401) {
    console.warn('Instagram token may be expired. Refetching from AWS...')

    const command = new GetSecretValueCommand({
      SecretId: 'Codedang-Instagram-Token'
    })
    const response = await client.send(command)
    const secret = JSON.parse(response.SecretString || '{}')
    token = secret.access_token

    res = await fetch(url(token))
  }

  if (!res.ok) {
    throw new Error(`Instagram API failed: ${res.status}`)
  }

  return res.json()
}
