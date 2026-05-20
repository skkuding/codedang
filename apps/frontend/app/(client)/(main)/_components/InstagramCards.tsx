'use client'

import RightArrowIcon from '@/public/icons/arrow-right-narrow.svg'
import type { Post, InstagramApiResponse } from '@/types/instagram'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { InstagramCard } from './InstagramCard'

export function InstagramCards() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true)
        setIsError(false)
        const res = await fetch('/my_api/instagram')
        if (!res.ok) {
          throw new Error(`API 요청 실패: ${res.status} ${res.statusText}`)
        }

        const data: InstagramApiResponse = await res.json()
        setPosts(data.data || [])
      } catch (e) {
        console.error('인스타그램 게시물을 불러오는 데 실패했습니다:', e)
        setIsError(true)
      } finally {
        setIsLoading(false)
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

      {isLoading && <InstagramCardsSkeleton />}

      {!isLoading && isError && (
        <div className="text-caprion1_m_13 text-color-neutral-20 mb-[78px] grid place-items-center">
          게시물을 불러오는 데 실패했습니다
        </div>
      )}

      {!isLoading && !isError && (
        <div className="mb-[78px] grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {posts.map((post) => (
            <InstagramCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

function InstagramCardsSkeleton() {
  return (
    <div className="mb-[78px] grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="flex h-full w-full animate-pulse flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_4px_20px_0_rgba(53,78,116,0.05),0_-4px_20px_0_rgba(53,78,116,0.05)]"
        >
          <div className="flex items-center gap-2 px-[10px] py-2">
            <div className="h-6 w-6 rounded-full bg-gray-200" />
            <div className="h-4 w-20 rounded bg-gray-200" />
          </div>
          <div className="aspect-[4/5] w-full bg-gray-200" />
          <div className="h-[37px] px-[10px] py-2">
            <div className="h-4 w-3/4 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  )
}
