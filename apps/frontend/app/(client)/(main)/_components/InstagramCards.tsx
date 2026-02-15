'use client'

import rightArrow from '@/public/icons/arrow-right-white.svg'
import type { Post, InstagramApiResponse } from '@/types/instagram'
import Image from 'next/image'
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
    <div className="mx-auto w-full max-w-7xl px-4 py-8">
      <span className="mb-10 block text-3xl font-semibold leading-[120%] tracking-[-0.9px]">
        TAKE OUR NEWS
      </span>

      <div className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 [ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:gap-2 sm:px-0 md:grid-cols-3 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
        {posts.map((post) => (
          <div
            key={post.id}
            className="w-[70%] flex-shrink-0 snap-center sm:w-auto"
          >
            <InstagramCard post={post} />
          </div>
        ))}
      </div>

      <div className="hidden flex-col items-center justify-center pt-10 sm:flex">
        <Link
          href="https://www.instagram.com/skkuding/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 rounded-full bg-black py-[10px] pl-[30px] pr-5 text-xl text-white hover:opacity-75"
        >
          <span>Go to Instagram</span>
          <Image
            src={rightArrow}
            alt="rightArrow"
            className="h-[18px] w-[18px]"
          />
        </Link>
      </div>
    </div>
  )
}
