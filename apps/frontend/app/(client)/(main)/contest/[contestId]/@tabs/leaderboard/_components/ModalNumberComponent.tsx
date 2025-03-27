interface ModalNumberComponentProps {
  index: number
}
export function ModalNumberComponent({ index }: ModalNumberComponentProps) {
  return (
    <div className="flex h-[22px] w-[22px] flex-col items-center justify-center rounded-full bg-[#3581FA] text-[11px] text-white">
      {index}
    </div>
  )
}
