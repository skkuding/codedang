import instagramLogo from '@/public/icons/instagram-logo.svg'
import type { Post } from '@/types/instagram'
import Image from 'next/image'
import Link from 'next/link'

interface InstagramCardProps {
  post: Post
}

export function InstagramCard({ post }: InstagramCardProps) {
  return (
    <Link
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-full w-full flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_4px_20px_0_rgba(53,78,116,0.05),0_-4px_20px_0_rgba(53,78,116,0.05)] duration-500 hover:scale-[1.02]"
    >
      <div className="flex items-center gap-2 px-[10px] py-2">
        <div className="flex h-full w-auto items-center justify-center rounded-full bg-white shadow-[0_0_20px_0_rgba(53,78,116,0.10)]">
          <Image
            src={instagramLogo}
            alt="Instagram Logo"
            width={24}
            height={24}
          />
        </div>
        <span className="text-body1_m_16">SKKUDING</span>
      </div>
      <div className="relative aspect-[4/5] w-full">
        <Image
          src={post.media_url}
          alt={'Instagram Post'}
          fill
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="h-[37px] px-[10px] py-2">
        <span className="text-body4_r_14 line-clamp-1 text-gray-700">
          {post.caption || 'No caption'}
        </span>
      </div>
    </Link>
  )
}
