export interface ModalListProps {
  items: string[]
}

export function ModalList({ items }: ModalListProps) {
  return (
    <div className="bg-background-alternative h-full w-full overflow-y-auto px-[12px] py-[14px]">
      <ul className="list-disc space-y-2 pl-5">
        {items.map((item) => (
          <li key={item} className="text-sm text-[#8A8A8A]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
