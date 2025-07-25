'use client'

export function ServiceCards() {
  return (
    <section className="font-pretendard flex w-full flex-col items-start gap-[40px] pt-[80px]">
      <div className="flex flex-col items-start gap-[40px]">
        <h2 className="text-[30px] font-semibold leading-[36px] tracking-[-0.9px] text-black">
          SERVICE WE PROVIDE
        </h2>

        <div className="grid grid-cols-[502px_360px_322px] grid-rows-[338px_292px] gap-[12px]">
          <div className="relative row-span-2 h-[642px] w-[502px] text-white">
            <div className="bg-primary-light border-common-white absolute left-[30px] top-[30px] flex h-[34px] items-center justify-center rounded-full border px-[12px] py-[4px] text-[16px] font-normal">
              CONTEST
            </div>

            <img
              src="/banners/about-contest.svg"
              alt="About Contest"
              className="bg-primary-light rounded-[20px]"
            />

            <div className="absolute bottom-[40px] left-[30px] right-[30px]">
              <p className="pb-[14px] text-[30px] font-semibold leading-[22.4px] leading-[36px] tracking-[-0.48px] tracking-[-0.9px]">
                About Contest
              </p>

              <p className="text-[16px] font-normal leading-[22.4px] tracking-[-0.48px]">
                Professors and students can host coding contests, <br />
                and rankings help enhance learning and motivation.
              </p>
            </div>
          </div>

          <div className="bg-background-normal relative h-[338px] w-[360px] rounded-[20px]">
            <div className="border-primary text-primary absolute left-[30px] top-[30px] z-10 flex h-[34px] items-center justify-center rounded-full border px-[12px] py-[4px] text-[16px] leading-[22.4px] tracking-[-0.48px]">
              NOTICE
            </div>

            <img
              src="/banners/stay-informed.svg"
              alt="Stay Informed"
              className="absolute bottom-0 right-0 z-0"
            />

            <div className="absolute left-[30px] right-[30px] top-[78px]">
              <p className="text-primary-strong pb-[14px] text-[30px] font-semibold leading-[22.4px] leading-[36px] tracking-[-0.48px] tracking-[-0.9px]">
                Stay Informed
              </p>
              <p className="text-primary text-[16px] font-normal leading-[22.4px] tracking-[-0.48px]">
                Explore coding challenges <br />
                by level and topic.
              </p>
            </div>
          </div>

          <div className="relative h-[338px] w-[322px] rounded-[20px]">
            <div className="bg-primary border-common-white absolute left-[30px] top-[30px] z-10 flex h-[34px] items-center justify-center rounded-full border px-[12px] py-[4px] text-[16px] leading-[22.4px] tracking-[-0.48px] text-white">
              PROBLEM
            </div>

            <img
              src="/banners/practice-with-real-problems-bg.svg"
              alt="Background pattern"
              className="bg-primary abolute z-0 rounded-[20px]"
            />

            <img
              src="/banners/practice-with-real-problems.svg"
              alt="Practice with Real problems"
              className="absolute bottom-0 right-0"
            />
            <div className="absolute left-[30px] right-[30px] top-[78px]">
              <p className="pb-[14px] text-[30px] font-normal leading-[36px] tracking-[-0.9px] text-white">
                Practice with
                <br />
                Real problems
              </p>
              <p className="text-[16px] font-normal leading-[22.4px] tracking-[-0.48px] text-white">
                Explore coding challenges
                <br />
                by level and topic.
              </p>
            </div>
          </div>

          <div className="relative col-span-2 h-[292px] w-[694px] rounded-[20px] bg-[#00183E]">
            <div className="border-common-white absolute left-[30px] top-[30px] flex h-[34px] items-center justify-center rounded-full border bg-[#00183E] px-[12px] py-[4px] text-[16px] leading-[22.4px] tracking-[-0.48px] text-white">
              COURSE
            </div>

            <img
              src="/banners/learn-with-courses.svg"
              alt="Learn with Courses"
              className="absolute bottom-0 right-0 rounded-[20px]"
            />

            <div className="absolute bottom-[40px] left-[30px] right-[30px]">
              <p className="pb-[14px] text-[30px] font-semibold leading-[36px] tracking-[-0.9px] text-white">
                Learn with Courses
              </p>
              <p className="text-[16px] font-normal leading-[22.4px] tracking-[-0.48px] text-white">
                Access course-linked assignments and exercises.
                <br />
                Learn through professor-curated problem.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
