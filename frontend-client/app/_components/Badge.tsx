const variants = {
  ongoing: 'bg-primary',
  upcoming: 'bg-secondary',
  finished: 'bg-gray-500',
  Level1: 'bg-[#76C9ED]',
  Level2: 'bg-[#83F479]',
  Level3: 'bg-[#FBEB5D]',
  Level4: 'bg-[#FFA563]',
  Level5: 'bg-[#FF685E]'
}

interface Props {
  badge: keyof typeof variants
}

export default function Badge({ badge }: Props) {
  return (
    <div className="m-4 inline-flex items-center justify-center gap-2 self-end rounded-3xl bg-white px-3 py-0.5">
      <div className={`h-2.5 w-2.5 rounded-full ${variants[badge]}`}></div>
      <div className="text-sm text-gray-800">{badge}</div>
    </div>
  )
}
