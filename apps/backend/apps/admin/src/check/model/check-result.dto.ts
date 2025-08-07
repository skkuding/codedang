class Position {
  line: number
  column: number
}

class Match {
  startInFirst: Position
  endInFirst: Position
  startInSecond: Position
  endInSecond: Position
  lengthOfFirst: number
  lengthOfSecond: number
}

class Similarities {
  AVG: number
  MAX: number
  MAXIMUMLENGTH: number
  LONGESTMATCH: number
}

export class Comparsion {
  firstId: number
  secondId: number
  similarities: Similarities
  matches: Match[]
  firstSimilarity: number
  secondSimilarity: number
}

export class Cluster {
  averageSimilarity: number
  strength: number
  members: number[]
}
