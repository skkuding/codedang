'use client'

import RightArrowIcon from '@/public/icons/arrow-right-narrow.svg'
import type { Post, InstagramApiResponse } from '@/types/instagram'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { InstagramCard } from './InstagramCard'

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
  }, [])

  return (
    <div className="w-full max-w-[1360px]">
      <div className="mb-7 flex items-center justify-between">
        <span className="text-head1_b_40">
          우리의 최신 소식은 여기에 있어요
        </span>
        <div className="flex flex-col items-center justify-center">
          <Link
            href="https://www.instagram.com/skkuding/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-color-neutral-30 hover:text-color-neutral-10 flex items-center justify-center gap-1"
          >
            <span className="text-sub2_m_18">인스타그램 바로가기</span>
            <RightArrowIcon className="h-[18px]" />
          </Link>
        </div>
      </div>

      {posts.length > 0 ? (
        <div className="mb-[78px] grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {posts.map((post) => (
            <InstagramCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="mb-[78px] grid place-items-center">
          게시물을 불러오는 데 실패했습니다
        </div>
      )}
    </div>
  )
}
