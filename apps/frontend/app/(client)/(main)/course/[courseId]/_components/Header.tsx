import { CiCalendar } from 'react-icons/ci'
import { RxPerson } from 'react-icons/rx'

export function Header() {
  return (
    <header className="w-full bg-white p-10">
      <div className="flex w-full flex-col gap-4">
        <h1 className="text-xl font-bold text-gray-800 sm:text-3xl">
          [CON2031-321] 소비자 트렌드 분석
        </h1>
        <div className="flex items-center gap-2">
          <CiCalendar className="text-gray-600" />
          <p className="text-sm text-gray-600">2025 Spring</p>
        </div>
        <div className="flex items-center gap-2">
          <RxPerson className="text-gray-600" />
          <p className="text-sm text-gray-600 underline">Prof. 교수님</p>
        </div>
      </div>
    </header>
  )
}
