import {
  GetSecretValueCommand,
  PutSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'

export const handler = async () => {
  console.log('Instagram token refresh started')

  try {
    const client = new SecretsManagerClient({ region: 'ap-northeast-2' })

    const oldToken = await getCurrentInstagramToken(client)
    console.log('Current token retrieved successfully')

    const newToken = await fetchNewInstagramToken(oldToken)
    console.log('New token fetched from Instagram API')

    const putCommand = new PutSecretValueCommand({
      SecretId: process.env.SECRET_ARN,
      SecretString: JSON.stringify({
        access_token: newToken
      })
    })
    await client.send(putCommand)
    console.log('New token saved to Secrets Manager')

    return { statusCode: 200, body: 'Token refreshed successfully' }
  } catch (error) {
    console.error('Token refresh failed:', error.message)
    throw error // can be observed in CloudWatch Logs
  }
}

async function getCurrentInstagramToken(secretsManagerClient) {
  const getCommand = new GetSecretValueCommand({
    SecretId: process.env.SECRET_ARN
  })

  const response = await secretsManagerClient.send(getCommand)
  const secret = JSON.parse(response.SecretString || '{}')

  if (!secret.access_token) {
    console.error('access_token missing from secret - manual setup required')
    throw new ReferenceError(
      'No access_token found in the secret. If you just created the secret, please set an initial value manually.'
    )
  }

  return secret.access_token
}

async function fetchNewInstagramToken(oldToken) {
  const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${oldToken}`

  const response = await fetch(refreshUrl)
  if (!response.ok) {
    console.error(
      `Instagram API error: ${response.status} ${response.statusText}`
    )
    throw new Error(
      `Failed to refresh token: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()
  if (!data.access_token) {
    console.error('Instagram API returned invalid response - no access_token')
    throw new ReferenceError('No access_token found in the response')
  }

  return data.access_token
}
