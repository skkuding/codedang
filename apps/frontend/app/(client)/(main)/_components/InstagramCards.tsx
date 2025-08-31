'use client'

import type { Post, InstagramApiResponse } from '@/types/instagram'
import { useEffect, useState } from 'react'

export function InstagramCards() {
  const [posts, setPosts] = useState<Post[]>([])
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/my_api/instagram')

        if (!res.ok) {
          throw new Error(`API 요청 실패: ${res.status} ${res.statusText}`)
        }

        const data: InstagramApiResponse = await res.json()
        setPosts(data.data || [])
      } catch (e) {
        console.error('인스타그램 게시물을 불러오는 데 실패했습니다:', e)
      }
    }
    fetchPosts()
  }, []) //처음에 한 번만 실행.
  console.log('인스타그램 게시물:', posts)

  // eslint-disable-next-line
  return <></>
}
