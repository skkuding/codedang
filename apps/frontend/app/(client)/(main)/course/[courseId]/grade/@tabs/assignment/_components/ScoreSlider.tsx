export function ScoreSlider() {
  const min = 10
  const max = 90
  const score = 75
  const mean = 40
  const med = (min + max) / 2

  return (
    <div className="w-full">
      <div className="relative">
        <div
          className="= absolute top-[4px] h-4 w-1 bg-gray-200"
          style={{ left: '10%' }}
        />

        <input
          type="range"
          min={min}
          max={max}
          value={score}
          className="h-1 w-full appearance-none bg-gray-200"
        />

        <div
          className="absolute top-6 -translate-x-1/2 transform text-xs font-semibold text-blue-600"
          style={{ left: `${((score - min) / (max - min)) * 100}%` }}
        >
          {score}
        </div>
      </div>
    </div>
  )
}
