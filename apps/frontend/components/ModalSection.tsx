import { ModalList } from './ModalList'

interface ModalSectionProps {
  title: string
  description?: string
  items: string[]
}

export function ModalSection({ title, description, items }: ModalSectionProps) {
  return (
    <div className="flex h-full w-full flex-col">
      <p className="text-primary text-lg">{title}</p>
      {description && <p className="text-sm text-gray-500">{description}</p>}
      <div className="mt-[16px] h-full">
        <ModalList items={items} />
      </div>
    </div>
  )
}
