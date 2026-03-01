import dashboardIcon from '@/public/icons/dashboard-blue.svg'
import gradeIcon from '@/public/icons/grade-blue.svg'
import laptopCodingIcon from '@/public/icons/laptop-coding-blue.svg'
import penIcon from '@/public/icons/pen-blue.svg'
import Image from 'next/image'

const FEATURE_LIST = [
  {
    title: '실시간 리더보드',
    desc: '콘테스트 중 IDE 내에서 직접 순위를 확인하세요.',
    icon: dashboardIcon
  },
  {
    title: '유동적인 특수 채점',
    desc: '특정 조건 문제에 대해서도 다양한 답변을 평가할 수 있어요.',
    icon: penIcon
  },
  {
    title: '사용자 정의 테스트케이스',
    desc: '제출 전, 페널티에 영향을 주지 않는 다양한 입력을 추가하세요.',
    icon: laptopCodingIcon
  },
  {
    title: '대회 내 통계',
    desc: '성공률, 제출 횟수 및 더 많은 통계를 확인하세요.',
    icon: gradeIcon
  }
]

export function ContestHeader() {
  return (
    <>
      <div>
        <p className="mt-[116px] text-4xl font-bold">CONTEST</p>
        <p className="mb-12 text-lg font-medium text-[#5F6566]">
          대회에 참가하여 최상위권에 도전해보세요!
        </p>
        <p className="mb-5 text-3xl font-semibold">
          대회에는 어떤 기능이 있나요?
        </p>
      </div>
      <div className="mb-15 flex h-[192px] gap-2">
        {FEATURE_LIST.map((feature, idx) => (
          <div
            key={idx}
            className="flex min-w-0 flex-1 flex-col rounded-md bg-white p-6 shadow-[0_4px_20px_0_rgba(53,78,116,0.1)]"
          >
            <p className="mb-2 truncate text-2xl font-semibold">
              {feature.title}
            </p>
            <p className="mb-4 line-clamp-2 overflow-hidden text-base font-medium text-[#5F6566]">
              {feature.desc}
            </p>
            <Image
              className="mt-auto self-end"
              src={feature.icon}
              alt={feature.title}
              width={44}
              height={44}
            />
          </div>
        ))}
      </div>
    </>
  )
}
