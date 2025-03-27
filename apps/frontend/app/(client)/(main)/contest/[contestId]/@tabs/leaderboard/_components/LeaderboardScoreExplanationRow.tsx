interface LeaderboardScoreExplanationRowProps {
  isTalkBalloon: boolean
  title: string
  textColor?: string
  explanationTitle: string
  explanationDetail?: string
}
export function LeaderboardScoreExplanationRow({
  isTalkBalloon,
  title,
  textColor = '#000000',
  explanationTitle,
  explanationDetail
}: LeaderboardScoreExplanationRowProps) {
  return (
    <div className="flex flex-row space-x-6">
      {isTalkBalloon ? (
        <div className="flex flex-col items-center justify-center">
          <div className="relative mt-[9px] flex h-[33px] w-[70px] flex-row items-center justify-center rounded-full bg-[#3581FA] text-base font-semibold text-white">
            {title}
            <div className="absolute -bottom-[8px] left-1/2 h-0 w-0 -translate-x-1/2 border-l-[7px] border-r-[6px] border-t-[9px] border-l-transparent border-r-transparent border-t-[#3581FA]" />
          </div>
        </div>
      ) : (
        <div
          className="mt-[9px] flex h-[50px] w-[70px] flex-row items-center justify-center rounded-[10px] bg-[#FAFAFA] text-xl font-semibold"
          style={{ color: textColor }}
        >
          {title}
        </div>
      )}
      <div className="flex h-[68px] w-[491px] flex-col justify-center rounded-[10px] bg-[#FAFAFA] pl-6">
        <div className="h-[22px] w-[69px] font-semibold text-[#474747]">
          {explanationTitle}
        </div>
        {explanationDetail && (
          <div className="text-sm text-[#737373]">{explanationDetail}</div>
        )}
      </div>
    </div>
  )
}
