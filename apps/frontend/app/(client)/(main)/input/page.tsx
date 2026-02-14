'use client'

import { Input } from '@/components/shadcn/input'

export default function InputTestPage() {
  return (
    <div className="flex min-h-screen w-full flex-col gap-10 bg-neutral-50 px-6 py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Input Test Page
        </h1>
        <p className="text-sm text-neutral-600">
          Focus: 탭으로 이동, Press: 마우스 클릭 유지
        </p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-neutral-800">Sizes</h2>
        <div className="flex flex-col gap-3">
          <Input sizeVariant="lg" placeholder="Large (46px)" />
          <Input sizeVariant="md" placeholder="Middle (40px)" />
          <Input sizeVariant="sm" placeholder="Small (36px)" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-neutral-800">States</h2>
        <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-neutral-600">Default</span>
            <Input placeholder="Enter" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-neutral-600">Filled</span>
            <Input defaultValue="Filled value" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-neutral-600">Press</span>
            <Input placeholder="Click and hold" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-neutral-600">Focus</span>
            <Input placeholder="Tab to focus" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm text-neutral-600">Error</span>
            <Input
              isError
              defaultValue="Invalid"
              errorMessage="오류 메시지 텍스트"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
