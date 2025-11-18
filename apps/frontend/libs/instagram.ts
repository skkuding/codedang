import {
  GetSecretValueCommand,
  SecretsManagerClient
} from '@aws-sdk/client-secrets-manager'
import { unstable_cache } from 'next/cache'
import 'server-only'

const client = new SecretsManagerClient({ region: 'ap-northeast-2' })

/**
 * NOTE (중요):
 * - `unstable_cache`는 Next 서버 프로세스의 메모리에 캐시를 저장합니다. 이는 "인스턴스-로컬" 캐시이며,
 *   쿠버네티스와 같이 수평 스케일아웃(Horizontal scale-out)이 적용되면 각 파드/인스턴스마다 별도의 캐시를 가집니다.
 * - 현재는 단일 컨테이너로 운용 중이므로 문제가 되지 않지만, 추후 멀티 인스턴스 환경에서는 서로 다른 인스턴스가
 *   서로 다른 토큰 값을 갖게 되어 토큰 일관성 문제가 발생할 수 있습니다.
 *
 * 대안: 전역 무효화/동기화가 필요하면 Redis, PostgreSQL 등의 같은 중앙 저장소(또는 분산 캐시)를 사용하여 모든 인스턴스가
 *    동일한 토큰을 참조하게 합니다.
 *
 * 정리: 단일 인스턴스에서는 허용 가능한 구현이지만, HPA 등으로 수평 확장할 계획이 있다면 위 내용을 고려해
 * 코드를 수정하거나 중앙 캐시/무효화 전략을 도입하세요.
 */
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
  { revalidate: 86400 } // 1일
)

export async function fetchInstagramMedia() {
  let token = await getInstagramToken()
  const url = (t: string) =>
    `https://graph.instagram.com/v23.0/24748516551450633/media?access_token=${t}&fields=id,caption,media_url,permalink,timestamp,media_type&limit=4`

  let res = await fetch(url(token), {
    next: { revalidate: 86400, tags: ['instagram-media'] }
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
