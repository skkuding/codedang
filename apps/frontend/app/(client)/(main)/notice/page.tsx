import { FetchErrorFallback } from '@/components/FetchErrorFallback'
import { Skeleton } from '@/components/shadcn/skeleton'
import { ErrorBoundary } from '@suspensive/react'
import { Suspense } from 'react'
import { NoticeTable } from './_components/NoticeTable'

interface NoticeProps {
  searchParams: Promise<{ search: string }>
}

export default async function Notice(props: NoticeProps) {
  const searchParams = await props.searchParams
  const search = searchParams.search ?? ''

  return (
    <>
      <div className="flex flex-col items-start justify-start gap-1">
        <p className="text-head1_b_40 justify-start self-stretch">NOTICE</p>
        <p className="text-color-cool-neutral-40 text-sub2_m_18 justify-start">
          업데이트된 코드당의 소식을 접해보세요!
        </p>
      </div>
      <ErrorBoundary fallback={FetchErrorFallback}>
        <Suspense
          fallback={
            <>
              <div className="mt-4 flex">
                <span className="w-2/4 md:w-4/6">
                  <Skeleton className="h-6 w-20" />
                </span>
                <span className="w-1/4 md:w-1/6">
                  <Skeleton className="mx-auto h-6 w-20" />
                </span>
                <span className="w-1/4 md:w-1/6">
                  <Skeleton className="mx-auto h-6 w-20" />
                </span>
              </div>
              {[...Array(5)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="my-2 flex h-12 w-full rounded-xl"
                />
              ))}
            </>
          }
        >
          <NoticeTable search={search} />
        </Suspense>
      </ErrorBoundary>
    </>
  )
}
