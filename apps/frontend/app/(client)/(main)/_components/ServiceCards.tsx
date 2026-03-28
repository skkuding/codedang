'use client'

import Image from 'next/image'
import Link from 'next/link'

const DESKTOP_LAYOUT: Record<
  string,
  {
    rowSpan?: number
    colSpan?: number
    textPosition: 'top' | 'bottom'
    tagClassName: string
    titleClassName?: string
    descClassName?: string
    overlayImage?: { src: string; alt: string }
    imagePosition?: 'bottom-right'
  }
> = {
  CONTEST: {
    rowSpan: 2,
    textPosition: 'bottom',
    tagClassName: 'border border-white'
  },
  NOTICE: {
    textPosition: 'top',
    tagClassName: 'border-primary text-primary border z-10',
    titleClassName: 'text-primary',
    descClassName: 'text-neutral-600'
  },
  PROBLEM: {
    textPosition: 'top',
    tagClassName: 'border border-white z-10',
    overlayImage: {
      src: '/banners/practice-with-real-problems.svg',
      alt: 'Practice with Real problems'
    }
  },
  COURSE: {
    colSpan: 2,
    textPosition: 'bottom',
    tagClassName: 'border border-white bg-background-course-card',
    imagePosition: 'bottom-right'
  }
}

export function ServiceCards() {
  const cards = [
    {
      tag: 'CONTEST',
      title: 'About Contest',
      desc: `Professors and students can host coding contests,
and rankings help enhance learning and motivation.`,
      mobileDesc: `Coding contests with rankings boost\nlearning and motivation.`,
      img: {
        desktop: '/banners/about-contest.svg',
        mobile: '/banners/contest-mobile.svg'
      },
      href: '/contest',
      bg: 'bg-primary-light text-white'
    },
    {
      tag: 'NOTICE',
      title: 'Stay Informed',
      desc: `Stay updated with the latest news
and announcements.`,
      img: {
        desktop: '/banners/stay-informed.svg',
        mobile: '/banners/informed-mobile.svg'
      },
      href: '/notice',
      bg: 'bg-background-normal text-primary'
    },
    {
      tag: 'PROBLEM',
      title: 'Practice with\nReal Problems',
      desc: `Explore coding challenges\nby level and topic.`,
      img: {
        desktop: '/banners/practice-with-real-problems-bg.svg',
        mobile: '/banners/problems-mobile.svg'
      },
      href: '/problem',
      bg: 'bg-primary text-white'
    },
    {
      tag: 'COURSE',
      title: 'Learn with Courses',
      desc: `Access course-linked assignments and exercises.
Learn through professor-curated problem.`,
      mobileDesc: `Access course assignments and\n practice professor-curated problems.`,
      img: {
        desktop: '/banners/learn-with-courses.svg',
        mobile: '/banners/courses-mobile.svg'
      },
      href: '/course',
      bg: 'bg-background-course-card text-white'
    }
  ]

  return (
    <section className="font-pretendard flex w-full flex-col items-center gap-10">
      {/* 데스크톱 전용 */}
      <div className="hidden w-full max-w-[1208px] flex-col items-start gap-4 min-[1140px]:!flex">
        <h2 className="text-head6_m_24 w-full text-gray-700">
          SERVICE WE PROVIDE
        </h2>
        <div className="grid w-full auto-rows-[330px] grid-cols-2 gap-3 [@media(min-width:1140px)]:grid-cols-[41%_29%_28%]">
          {cards.map((card) => {
            const d = DESKTOP_LAYOUT[card.tag]
            const linkClass = [
              card.bg,
              'relative h-full w-full rounded-[20px] duration-500 hover:scale-[1.02]',
              d?.rowSpan === 2 && 'row-span-2',
              d?.colSpan === 2 && 'col-span-2'
            ]
              .filter(Boolean)
              .join(' ')
            const textPosClass =
              d?.textPosition === 'top'
                ? 'absolute left-[30px] right-[30px] top-[78px]'
                : 'absolute bottom-10 left-[30px] right-[30px]'
            const titleClass = [
              'text-head6_m_24 whitespace-pre-line pb-[14px]',
              d?.titleClassName ?? ''
            ]
              .filter(Boolean)
              .join(' ')
            const descClass = ['text-caption4_r_12', d?.descClassName ?? '']
              .filter(Boolean)
              .join(' ')

            return (
              <Link key={card.tag} href={card.href} className={linkClass}>
                <div
                  className={`absolute left-[30px] top-[30px] flex h-[34px] items-center justify-center rounded-full px-3 py-1 text-xs font-normal ${d?.tagClassName ?? 'border border-white'}`}
                >
                  {card.tag}
                </div>
                {d?.imagePosition === 'bottom-right' ? (
                  <Image
                    src={card.img.desktop}
                    alt={card.title}
                    className="absolute bottom-0 right-0 rounded-[20px] object-cover"
                    width={350}
                    height={350}
                  />
                ) : (
                  <Image
                    src={card.img.desktop}
                    alt={card.title}
                    className="absolute h-full w-full rounded-[20px] object-cover"
                    fill
                  />
                )}
                {d?.overlayImage && (
                  <Image
                    src={d.overlayImage.src}
                    alt={d.overlayImage.alt}
                    className="absolute bottom-0 right-0 object-contain"
                    width={350}
                    height={350}
                  />
                )}
                <div className={textPosClass}>
                  <p className={titleClass}>
                    {card.title.split('\n').map((line, i) => (
                      <span key={i}>
                        {i > 0 && <br />}
                        {line}
                      </span>
                    ))}
                  </p>
                  <p className={descClass}>
                    {card.desc.split('\n').map((line, i) => (
                      <span key={i}>
                        {i > 0 && <br />}
                        {line}
                      </span>
                    ))}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
      {/* 모바일 전용 */}
      <div className="flex w-full max-w-[1208px] flex-col items-start gap-4 min-[1140px]:!hidden">
        <h2 className="text-head6_m_24 w-full px-6 text-gray-700">
          SERVICE WE PROVIDE
        </h2>
        <div
          className="service-cards-mobile-scroll flex w-full cursor-grab gap-[10px] overflow-x-scroll scroll-smooth px-6 pb-5 [-webkit-overflow-scrolling:touch] active:cursor-grabbing"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <style jsx>{`
            .service-cards-mobile-scroll::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {cards.map((card, idx) => {
            let cardClassName = `${card.bg} relative flex-shrink-0 rounded-[8px] drop-shadow`

            if (idx !== 0) {
              cardClassName += ' snap-start'
            }

            return (
              <Link
                key={card.tag}
                href={card.href}
                className={`${cardClassName} h-[250px] w-[220px] overflow-hidden`}
              >
                <Image
                  src={card.img.mobile}
                  alt={card.title}
                  fill
                  className="object-cover"
                  sizes="220px"
                />
                <div className="absolute left-3 right-1 top-5">
                  <p className="text-head6_m_24 whitespace-pre-line">
                    {card.title}
                  </p>
                  <p
                    className={`text-caption4_r_12 whitespace-pre-line opacity-90 ${card.tag === 'NOTICE' ? 'text-neutral-600' : ''}`}
                  >
                    {card.mobileDesc ?? card.desc}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
