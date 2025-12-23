'use client'

import Image from 'next/image'
import Link from 'next/link'

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
      bg: 'bg-[#00183E] text-white'
    }
  ]

  return (
    <section className="font-pretendard flex w-full flex-col items-center gap-10">
      <div className="hidden w-full max-w-[1208px] flex-col items-start gap-10 lg:flex">
        <h2 className="text-[30px] font-semibold leading-9 tracking-[-0.9px] text-black">
          SERVICE WE PROVIDE
        </h2>
        <div className="grid w-full auto-rows-[330px] grid-cols-2 gap-3 [@media(min-width:1140px)]:grid-cols-[41%_29%_28%]">
          <Link
            href="/contest"
            className="bg-primary-light relative row-span-2 h-full w-full rounded-[20px] text-white duration-500 hover:scale-[1.02]"
          >
            <div className="absolute left-[30px] top-[30px] flex h-[34px] items-center justify-center rounded-full border border-white px-3 py-1 text-xs font-normal">
              CONTEST
            </div>
            <Image
              src="/banners/about-contest.svg"
              alt="About Contest"
              className="absolute h-full w-full rounded-[20px] object-cover"
              fill
            />
            <div className="absolute bottom-10 left-[30px] right-[30px]">
              <p className="pb-[14px] text-[30px] font-semibold leading-9 tracking-[-0.9px]">
                About Contest
              </p>
              <p className="text-s font-normal leading-[22.4px] tracking-[-0.48px]">
                Professors and students can host coding contests, <br />
                and rankings help enhance learning and motivation.
              </p>
            </div>
          </Link>

          <Link
            href="/notice"
            className="bg-background-normal relative h-full w-full rounded-[20px] duration-500 hover:scale-[1.02]"
          >
            <div className="border-primary text-primary absolute left-[30px] top-[30px] z-10 flex h-[34px] items-center justify-center rounded-full border px-3 py-1 text-xs leading-[22.4px] tracking-[-0.48px]">
              NOTICE
            </div>
            <Image
              src="/banners/stay-informed.svg"
              alt="Stay Informed"
              className="absolute inset-0 h-full w-full rounded-[20px] object-cover"
              fill
            />
            <div className="absolute left-[30px] right-[30px] top-[78px]">
              <p className="text-primary-strong pb-[14px] text-[30px] font-semibold leading-9 tracking-[-0.9px]">
                Stay Informed
              </p>
              <p className="text-primary text-s font-normal leading-[22.4px] tracking-[-0.48px]">
                Stay updated with the latest news <br />
                and announcements.
              </p>
            </div>
          </Link>

          <Link
            href="/problem"
            className="bg-primary relative h-full w-full rounded-[20px] text-white duration-500 hover:scale-[1.02]"
          >
            <div className="absolute left-[30px] top-[30px] z-10 flex h-[34px] items-center justify-center rounded-full border border-white px-3 py-1 text-xs leading-[22.4px] tracking-[-0.48px]">
              PROBLEM
            </div>
            <Image
              src="/banners/practice-with-real-problems-bg.svg"
              alt="Background pattern"
              className="absolute inset-0 h-full w-full rounded-[20px] object-cover"
              fill
            />
            <Image
              src="/banners/practice-with-real-problems.svg"
              alt="Practice with Real problems"
              className="object-cov absolute bottom-0 right-0"
              width={350}
              height={350}
            />
            <div className="absolute left-[30px] right-[30px] top-[78px]">
              <p className="tracking-[-0.9px text-white] pb-[14px] text-[30px] font-semibold leading-9">
                Practice with <br />
                Real problems
              </p>
              <p className="text-s tracking-[-0.48px]text-white font-normal leading-[22.4px]">
                Explore coding challenges <br />
                by level and topic.
              </p>
            </div>
          </Link>

          <Link
            href="/course"
            className="relative col-span-2 h-full w-full rounded-[20px] bg-[#00183E] text-white duration-500 hover:scale-[1.02]"
          >
            <div className="absolute left-[30px] top-[30px] flex h-[34px] items-center justify-center rounded-full border border-white bg-[#00183E] px-3 py-1 text-xs leading-[22.4px] tracking-[-0.48px]">
              COURSE
            </div>
            <Image
              src="/banners/learn-with-courses.svg"
              alt="Learn with Courses"
              className="absolute bottom-0 right-0 rounded-[20px] object-cover"
              width={350}
              height={350}
            />
            <div className="absolute bottom-10 left-[30px] right-[30px]">
              <p className="pb-[14px] text-[30px] font-semibold leading-9 tracking-[-0.9px]">
                Learn with Courses
              </p>
              <p className="text-s font-normal leading-[22.4px] tracking-[-0.48px]">
                Access course-linked assignments and exercises. <br />
                Learn through professor-curated problem.
              </p>
            </div>
          </Link>
        </div>
      </div>
      {/* Mobile View */}
      <div className="w-full lg:hidden">
        <h2 className="mb-4 px-6 text-[22px] font-semibold text-black">
          SERVICE WE PROVIDE
        </h2>

        <div
          className="flex w-full cursor-grab gap-[10px] overflow-x-scroll scroll-smooth pb-5 [-webkit-overflow-scrolling:touch] active:cursor-grabbing"
          style={{
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <style jsx global>{`
            div::-webkit-scrollbar {
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
                className={cardClassName}
                style={{
                  width: '220px',
                  height: '250px'
                }}
              >
                <Image
                  src={card.img.mobile}
                  alt={card.title}
                  fill
                  className="rounded-[8px] object-cover"
                />
                <div className="absolute left-3 right-1 top-5">
                  <p className="whitespace-pre-line text-[18px] font-semibold leading-snug">
                    {card.title}
                  </p>
                  <p className="whitespace-pre-line text-xs font-normal opacity-90">
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
