'use client'

import Image from 'next/image'
import Link from 'next/link'

export function ServiceCards() {
  return (
    <section className="font-pretendard flex w-full flex-col items-center gap-10">
      <div className="flex w-full max-w-[1208px] flex-col items-start gap-10">
        <h2 className="text-[30px] font-semibold leading-9 tracking-[-0.9px] text-black">
          SERVICE WE PROVIDE
        </h2>

        <div className="grid w-full auto-rows-[330px] grid-cols-2 gap-3 [@media(min-width:1140px)]:grid-cols-[41%_29%_28%]">
          <Link
            href="/contest"
            className="bg-primary-light relative row-span-2 h-full w-full rounded-[20px] text-white duration-500 hover:scale-[1.02]"
          >
            <div className="text-caption4_r_12 absolute left-[30px] top-[30px] flex h-[34px] items-center justify-center rounded-full border border-white px-3 py-1">
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
              <p className="text-s text-body3_r_16">
                Professors and students can host coding contests,
                <br /> and rankings help enhance learning and motivation.
              </p>
            </div>
          </Link>

          <Link
            href="/notice"
            className="bg-background-normal relative h-full w-full rounded-[20px] duration-500 hover:scale-[1.02]"
          >
            <div className="border-primary text-primary text-caption4_r_12 absolute left-[30px] top-[30px] z-10 flex h-[34px] items-center justify-center rounded-full border px-3 py-1">
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
              <p className="text-primary text-s text-body3_r_16">
                Stay updated with the latest news <br /> and announcements.
              </p>
            </div>
          </Link>

          <Link
            href="/problem"
            className="bg-primary relative h-full w-full rounded-[20px] text-white duration-500 hover:scale-[1.02]"
          >
            <div className="text-caption4_r_12 absolute left-[30px] top-[30px] z-10 flex h-[34px] items-center justify-center rounded-full border border-white px-3 py-1">
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
              className="absolute bottom-0 right-0 object-contain"
              width={350}
              height={350}
            />
            <div className="absolute left-[30px] right-[30px] top-[78px]">
              <p className="pb-[14px] text-[30px] font-semibold leading-9 tracking-[-0.9px]">
                Practice with
                <br /> Real problems
              </p>
              <p className="text-s text-body3_r_16">
                Explore coding challenges
                <br /> by level and topic.
              </p>
            </div>
          </Link>

          <Link
            href="/course"
            className="relative col-span-2 h-full w-full rounded-[20px] bg-[#00183E] text-white duration-500 hover:scale-[1.02]"
          >
            <div className="text-caption4_r_12 absolute left-[30px] top-[30px] flex h-[34px] items-center justify-center rounded-full border border-white bg-[#00183E] px-3 py-1">
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
              <p className="text-s text-body3_r_16">
                Access course-linked assignments and exercises.
                <br /> Learn through professor-curated problem.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
