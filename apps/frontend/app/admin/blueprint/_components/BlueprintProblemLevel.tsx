import { Badge } from '@/components/shadcn/badge'
import type { Level } from '@/types/type'

export function BlueprintProblemLevel({
  level
}: {
  level: string | undefined
}) {
  if (!level) {
    return <span>-</span>
  }
  const knownLevel = /^Level[1-5]$/.test(level)
  return (
    <Badge
      variant={knownLevel ? (level as Level) : 'outline'}
      className="justify-center whitespace-nowrap"
    >
      {knownLevel ? `Level ${level.slice(-1)}` : level}
    </Badge>
  )
}
