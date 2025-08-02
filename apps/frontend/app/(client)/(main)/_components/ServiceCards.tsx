'use client'

export function ServiceCards() {
  return (
    <section className="font-pretendard flex w-full flex-col items-center gap-[40px] px-4">
      <div className="flex w-full max-w-[1184px] flex-col items-start gap-[40px]">
        <h2 className="text-[30px] font-semibold leading-[36px] tracking-[-0.9px] text-black">
          SERVICE WE PROVIDE
        </h2>

        <div className="grid w-full auto-rows-[330px] grid-cols-2 gap-[12px] [@media(min-width:1140px)]:grid-cols-[41%_29%_30%]">
          <div className="bg-primary-light relative row-span-2 h-full w-full overflow-hidden rounded-[20px] text-white will-change-transform">
            <div className="absolute left-[20px] top-[20px] flex h-[34px] items-center justify-center rounded-full border border-white px-[12px] py-[4px] text-[16px]">
              CONTEST
            </div>
            <img
              src="/banners/about-contest.svg"
              alt="About Contest"
              className="absolute inset-0 h-full w-full rounded-[20px] object-cover"
            />
            <div className="absolute bottom-[30px] left-[20px] right-[20px]">
              <p className="pb-[10px] text-[24px] font-semibold leading-[32px]">
                About Contest
              </p>
              <p className="text-[14px] leading-[20px]">
                Professors and students can host coding contests,
                <br /> and rankings help enhance learning and motivation.
              </p>
            </div>
          </div>

          <div className="bg-background-normal relative h-full w-full overflow-hidden rounded-[20px] will-change-transform">
            <div className="border-primary text-primary absolute left-[20px] top-[20px] z-10 flex h-[34px] items-center justify-center rounded-full border px-[12px] py-[4px] text-[16px]">
              NOTICE
            </div>
            <img
              src="/banners/stay-informed.svg"
              alt="Stay Informed"
              className="absolute inset-0 h-full w-full rounded-[20px] object-cover"
            />
            <div className="absolute left-[20px] right-[20px] top-[70px]">
              <p className="text-primary-strong pb-[10px] text-[24px] font-semibold leading-[32px]">
                Stay Informed
              </p>
              <p className="text-primary text-[14px] leading-[20px]">
                Explore coding challenges <br /> by level and topic.
              </p>
            </div>
          </div>

          <div className="bg-primary relative h-full w-full overflow-hidden rounded-[20px] text-white will-change-transform">
            <div className="absolute left-[20px] top-[20px] z-10 flex h-[34px] items-center justify-center rounded-full border border-white px-[12px] py-[4px] text-[16px]">
              PROBLEM
            </div>
            <img
              src="/banners/practice-with-real-problems-bg.svg"
              alt="Background pattern"
              className="absolute inset-0 h-full w-full rounded-[20px] object-cover"
            />
            <img
              src="/banners/practice-with-real-problems.svg"
              alt="Practice with Real problems"
              className="absolute bottom-0 right-0 max-h-full max-w-full object-contain"
            />
            <div className="absolute left-[20px] right-[20px] top-[70px]">
              <p className="pb-[10px] text-[24px] font-semibold leading-[32px]">
                Practice with
                <br /> Real problems
              </p>
              <p className="text-[14px] leading-[20px]">
                Explore coding challenges
                <br /> by level and topic.
              </p>
            </div>
          </div>

          <div className="relative col-span-2 h-full w-full overflow-hidden rounded-[20px] bg-[#00183E] text-white will-change-transform">
            <div className="absolute left-[20px] top-[20px] flex h-[34px] items-center justify-center rounded-full border border-white bg-[#00183E] px-[12px] py-[4px] text-[16px]">
              COURSE
            </div>
            <img
              src="/banners/learn-with-courses.svg"
              alt="Learn with Courses"
              className="absolute bottom-0 right-0 rounded-[20px] object-cover"
            />
            <div className="absolute bottom-[30px] left-[20px] right-[20px]">
              <p className="pb-[10px] text-[24px] font-semibold leading-[32px]">
                Learn with Courses
              </p>
              <p className="text-[14px] leading-[20px]">
                Access course-linked assignments and exercises.
                <br /> Learn through professor-curated problem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
