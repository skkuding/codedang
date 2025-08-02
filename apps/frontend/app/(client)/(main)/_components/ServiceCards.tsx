'use client'

export function ServiceCards() {
  return (
    <section className="font-pretendard flex w-full flex-col items-center gap-[40px]">
      <div className="flex w-full max-w-[1184px] flex-col items-start gap-[40px]">
        <h2 className="text-[30px] font-semibold leading-[36px] tracking-[-0.9px] text-black">
          SERVICE WE PROVIDE
        </h2>

        <div className="grid w-full auto-rows-[330px] grid-cols-2 gap-[12px] [@media(min-width:1140px)]:grid-cols-[41%_29%_30%]">
          <div className="bg-primary-light relative row-span-2 h-full w-full rounded-[20px] text-white">
            <div className="absolute left-[30px] top-[30px] flex h-[34px] items-center justify-center rounded-full border border-white px-[12px] py-[4px] text-[16px] font-normal">
              CONTEST
            </div>
            <img
              src="/banners/about-contest.svg"
              alt="About Contest"
              className="absolute h-full w-full rounded-[20px] object-cover"
            />
            <div className="absolute bottom-[40px] left-[30px] right-[30px]">
              <p className="pb-[14px] text-[30px] font-semibold leading-[36px] tracking-[-0.9px]">
                About Contest
              </p>
              <p className="text-[16px] font-normal leading-[22.4px] tracking-[-0.48px]">
                Professors and students can host coding contests,
                <br /> and rankings help enhance learning and motivation.
              </p>
            </div>
          </div>

          <div className="bg-background-normal relative h-full w-full rounded-[20px]">
            <div className="border-primary text-primary absolute left-[30px] top-[30px] z-10 flex h-[34px] items-center justify-center rounded-full border px-[12px] py-[4px] text-[16px] leading-[22.4px] tracking-[-0.48px]">
              NOTICE
            </div>
            <img
              src="/banners/stay-informed.svg"
              alt="Stay Informed"
              className="absolute inset-0 h-full w-full rounded-[20px] object-cover"
            />
            <div className="absolute left-[30px] right-[30px] top-[78px]">
              <p className="text-primary-strong pb-[14px] text-[30px] font-semibold leading-[36px] tracking-[-0.9px]">
                Stay Informed
              </p>
              <p className="text-primary text-[16px] font-normal leading-[22.4px] tracking-[-0.48px]">
                Explore coding challenges <br /> by level and topic.
              </p>
            </div>
          </div>

          <div className="bg-primary relative h-full w-full rounded-[20px] text-white">
            <div className="absolute left-[30px] top-[30px] z-10 flex h-[34px] items-center justify-center rounded-full border border-white px-[12px] py-[4px] text-[16px] leading-[22.4px] tracking-[-0.48px]">
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
            <div className="absolute left-[30px] right-[30px] top-[78px]">
              <p className="pb-[14px] text-[30px] font-semibold leading-[36px] tracking-[-0.9px]">
                Practice with
                <br /> Real problems
              </p>
              <p className="text-[16px] font-normal leading-[22.4px] tracking-[-0.48px]">
                Explore coding challenges
                <br /> by level and topic.
              </p>
            </div>
          </div>

          <div className="relative col-span-2 h-full w-full rounded-[20px] bg-[#00183E] text-white">
            <div className="absolute left-[30px] top-[30px] flex h-[34px] items-center justify-center rounded-full border border-white bg-[#00183E] px-[12px] py-[4px] text-[16px] leading-[22.4px] tracking-[-0.48px]">
              COURSE
            </div>
            <img
              src="/banners/learn-with-courses.svg"
              alt="Learn with Courses"
              className="absolute bottom-0 right-0 rounded-[20px] object-cover"
            />
            <div className="absolute bottom-[40px] left-[30px] right-[30px]">
              <p className="pb-[14px] text-[30px] font-semibold leading-[36px] tracking-[-0.9px]">
                Learn with Courses
              </p>
              <p className="text-[16px] font-normal leading-[22.4px] tracking-[-0.48px]">
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
