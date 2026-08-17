import Link from 'next/link'

interface NavItem {
  id: string
  title: string
}

interface ArticleNavigationProps {
  prev?: NavItem
  next?: NavItem
  basePath: string
  page?: string
}

export function ArticleNavigation({
  prev,
  next,
  basePath,
  page
}: ArticleNavigationProps) {
  const pageQuery = page ? `?page=${page}` : ''

  return (
    <footer className="flex flex-col gap-5">
      <div className="border-line overflow-hidden rounded-[10px] border">
        {prev && (
          <Link
            href={`${basePath}/${prev.id}${pageQuery}`}
            className="border-line bg-color-neutral-99 hover:bg-color-neutral-95 flex items-center gap-6 border-b px-6 py-4"
          >
            <span className="text-sub2_m_18 w-[100px] shrink-0">Previous</span>
            <span className="text-body1_m_16">{prev.title}</span>
          </Link>
        )}
        {next && (
          <Link
            href={`${basePath}/${next.id}${pageQuery}`}
            className="hover:bg-color-neutral-95 flex items-center gap-6 px-6 py-4"
          >
            <span className="text-primary text-sub2_m_18 w-[100px] shrink-0">
              Next
            </span>
            <span className="text-body1_m_16">{next.title}</span>
          </Link>
        )}
      </div>
      <div className="flex justify-end">
        <Link
          href={`${basePath}${pageQuery}`}
          className="border-line text-caption2_m_12 rounded-full border px-6 py-3"
        >
          Back to the List
        </Link>
      </div>
    </footer>
  )
}
