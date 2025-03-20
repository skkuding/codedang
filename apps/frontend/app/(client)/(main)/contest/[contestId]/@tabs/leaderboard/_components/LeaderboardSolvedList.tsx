interface LeaderboardSolvedProps {
  solvedList: number[]
  problemSize: number
}
export function LeaderboardSolvedList({
  solvedList,
  problemSize
}: LeaderboardSolvedProps) {
  return (
    <div className="flex w-[86px] flex-col items-center">
      {solvedList.map((solved, index) => {
        const height = 102 * solved - 12
        return solved === 0 ? (
          <div key={index} />
        ) : (
          <div
            className="mb-3 flex w-[46px] flex-row justify-center rounded-[10px] bg-[#619CFB] pt-[18px] text-[18px] font-bold text-white"
            style={{ height: `${height}px` }}
            key={index}
          >
            {problemSize - index}
          </div>
        )
      })}
    </div>
  )
}
