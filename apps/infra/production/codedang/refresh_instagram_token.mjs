import {
  GetSecretValueCommand,
  PutSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'

export const handler = async () => {
  const client = new SecretsManagerClient({ region: 'ap-northeast-2' })

  // get old token
  const getCommand = new GetSecretValueCommand({
    SecretId: process.env.SECRET_ARN
  })
  const response = await client.send(getCommand)
  const secret = JSON.parse(response.SecretString || '{}')
  const oldToken = secret.access_token

  // get new token
  const newToken = await fetchNewInstagramToken(oldToken)

  // update Secrets Manager with new token
  const putCommand = new PutSecretValueCommand({
    SecretId: process.env.SECRET_ARN,
    SecretString: JSON.stringify({
      access_token: newToken
    })
  })
  await client.send(putCommand)

  return { statusCode: 200, body: 'Token refreshed' }
}

async function fetchNewInstagramToken(oldToken) {
  const refreshUrl = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${oldToken}`
  const response = await fetch(refreshUrl)
  const data = await response.json()
  const { access_token: newToken } = data
  return newToken
}
