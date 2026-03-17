import { useSuspenseQuery } from '@tanstack/react-query'

export function GeneratorPage() {
  // 스켈레톤 확인을 위한 더미코드
  useSuspenseQuery({
    queryKey: ['SongJunGyu'],
    queryFn: () =>
      new Promise((resolve) => {
        setTimeout(() => {
          resolve('')
        }, 5000)
      })
  })

  return <div>This is Generator page</div>
}
