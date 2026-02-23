'use client'

import { useTranslate } from '@tolgee/react'
import Image from 'next/image'
import Link from 'next/link'

export function ServiceCards() {
  const { t } = useTranslate()

  return (
    <section className="font-pretendard flex w-full flex-col items-center gap-10">
      <div className="flex w-full max-w-[1208px] flex-col items-start gap-10">
        <h2 className="text-[30px] font-semibold leading-9 tracking-[-0.9px] text-black">
          {t('service_we_provide')}
        </h2>

        <div className="grid w-full auto-rows-[330px] grid-cols-2 gap-3 [@media(min-width:1140px)]:grid-cols-[41%_29%_28%]">
          <Link
            href="/contest"
            className="bg-primary-light relative row-span-2 h-full w-full rounded-[20px] text-white duration-500 hover:scale-[1.02]"
          >
            <div className="absolute left-[30px] top-[30px] flex h-[34px] items-center justify-center rounded-full border border-white px-3 py-1 text-xs font-normal">
              {t('contest')}
            </div>
            <Image
              src="/banners/about-contest.svg"
              alt={t('about_contest')}
              className="absolute h-full w-full rounded-[20px] object-cover"
              fill
            />
            <div className="absolute bottom-10 left-[30px] right-[30px]">
              <p className="pb-[14px] text-[30px] font-semibold leading-9 tracking-[-0.9px]">
                {t('about_contest')}
              </p>
              <p className="text-s font-normal leading-[22.4px] tracking-[-0.48px]">
                {t('about_contest_description_line_1')}
                <br /> {t('about_contest_description_line_2')}
              </p>
            </div>
          </Link>

          <Link
            href="/notice"
            className="bg-background-normal relative h-full w-full rounded-[20px] duration-500 hover:scale-[1.02]"
          >
            <div className="border-primary text-primary absolute left-[30px] top-[30px] z-10 flex h-[34px] items-center justify-center rounded-full border px-3 py-1 text-xs leading-[22.4px] tracking-[-0.48px]">
              {t('notice')}
            </div>
            <Image
              src="/banners/stay-informed.svg"
              alt={t('stay_informed')}
              className="absolute inset-0 h-full w-full rounded-[20px] object-cover"
              fill
            />
            <div className="absolute left-[30px] right-[30px] top-[78px]">
              <p className="text-primary-strong pb-[14px] text-[30px] font-semibold leading-9 tracking-[-0.9px]">
                {t('stay_informed')}
              </p>
              <p className="text-primary text-s font-normal leading-[22.4px] tracking-[-0.48px]">
                {t('stay_updated_with_latest_news_and_announcements')}
              </p>
            </div>
          </Link>

          <Link
            href="/problem"
            className="bg-primary relative h-full w-full rounded-[20px] text-white duration-500 hover:scale-[1.02]"
          >
            <div className="absolute left-[30px] top-[30px] z-10 flex h-[34px] items-center justify-center rounded-full border border-white px-3 py-1 text-xs leading-[22.4px] tracking-[-0.48px]">
              {t('problem')}
            </div>
            <Image
              src="/banners/practice-with-real-problems-bg.svg"
              alt={t('background_pattern')}
              className="absolute inset-0 h-full w-full rounded-[20px] object-cover"
              fill
            />
            <Image
              src="/banners/practice-with-real-problems.svg"
              alt={t('practice_with_real_problems')}
              className="absolute bottom-0 right-0 object-contain"
              width={350}
              height={350}
            />
            <div className="absolute left-[30px] right-[30px] top-[78px]">
              <p className="pb-[14px] text-[30px] font-semibold leading-9 tracking-[-0.9px]">
                {t('practice_with_real_problems_line_1')}
                <br /> {t('practice_with_real_problems_line_2')}
              </p>
              <p className="text-s font-normal leading-[22.4px] tracking-[-0.48px]">
                {t('practice_with_real_problems_description_line_1')}
                <br /> {t('practice_with_real_problems_description_line_2')}
              </p>
            </div>
          </Link>

          <Link
            href="/course"
            className="relative col-span-2 h-full w-full rounded-[20px] bg-[#00183E] text-white duration-500 hover:scale-[1.02]"
          >
            <div className="absolute left-[30px] top-[30px] flex h-[34px] items-center justify-center rounded-full border border-white bg-[#00183E] px-3 py-1 text-xs leading-[22.4px] tracking-[-0.48px]">
              {t('course')}
            </div>
            <Image
              src="/banners/learn-with-courses.svg"
              alt={t('learn_with_courses')}
              className="absolute bottom-0 right-0 rounded-[20px] object-cover"
              width={350}
              height={350}
            />
            <div className="absolute bottom-10 left-[30px] right-[30px]">
              <p className="pb-[14px] text-[30px] font-semibold leading-9 tracking-[-0.9px]">
                {t('learn_with_courses')}
              </p>
              <p className="text-s font-normal leading-[22.4px] tracking-[-0.48px]">
                {t('learn_with_courses_description_line_1')}
                <br /> {t('learn_with_courses_description_line_2')}
              </p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
