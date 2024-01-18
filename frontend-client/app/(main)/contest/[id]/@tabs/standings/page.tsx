import StandingsTable from '../../../_components/StandingsTable'

interface ProblemScore {
  problemId: number
  score: number
  time: string
}
interface Standings {
  ranking: number
  userId: number
  problemScore: ProblemScore[]
  solved: number
  score: number
}

const dummyData: Standings[] = [
  {
    ranking: 1,
    userId: 101,
    problemScore: [
      { problemId: 1, score: 95, time: '03:15' },
      { problemId: 2, score: 90, time: '05:22' },
      { problemId: 3, score: 85, time: '02:45' },
      { problemId: 4, score: 80, time: '01:30' },
      { problemId: 5, score: 75, time: '02:40' },
      { problemId: 6, score: 70, time: '04:10' },
      { problemId: 7, score: 65, time: '03:00' },
      { problemId: 8, score: 60, time: '02:15' }
    ],
    solved: 8,
    score: 625
  },
  {
    ranking: 2,
    userId: 102,
    problemScore: [
      { problemId: 1, score: 90, time: '04:10' },
      { problemId: 2, score: 85, time: '06:30' },
      { problemId: 3, score: 80, time: '03:55' },
      { problemId: 4, score: 75, time: '02:10' },
      { problemId: 5, score: 70, time: '04:45' },
      { problemId: 6, score: 65, time: '01:58' },
      { problemId: 7, score: 60, time: '03:30' },
      { problemId: 8, score: 55, time: '02:00' }
    ],
    solved: 8,
    score: 570
  },
  {
    ranking: 3,
    userId: 103,
    problemScore: [
      { problemId: 1, score: 85, time: '02:30' },
      { problemId: 2, score: 80, time: '04:45' },
      { problemId: 3, score: 75, time: '01:58' },
      { problemId: 4, score: 70, time: '03:40' },
      { problemId: 5, score: 65, time: '02:15' },
      { problemId: 6, score: 60, time: '02:22' },
      { problemId: 7, score: 55, time: '03:15' },
      { problemId: 8, score: 50, time: '04:00' }
    ],
    solved: 8,
    score: 570
  },
  {
    ranking: 4,
    userId: 104,
    problemScore: [
      { problemId: 1, score: 80, time: '03:50' },
      { problemId: 2, score: 75, time: '05:15' },
      { problemId: 3, score: 70, time: '02:22' },
      { problemId: 4, score: 65, time: '01:45' },
      { problemId: 5, score: 60, time: '03:10' },
      { problemId: 6, score: 55, time: '04:30' },
      { problemId: 7, score: 50, time: '02:40' },
      { problemId: 8, score: 45, time: '03:55' }
    ],
    solved: 8,
    score: 525
  },
  {
    ranking: 5,
    userId: 105,
    problemScore: [
      { problemId: 1, score: 92, time: '04:45' },
      { problemId: 2, score: 87, time: '06:02' },
      { problemId: 3, score: 82, time: '03:25' },
      { problemId: 4, score: 77, time: '02:58' },
      { problemId: 5, score: 72, time: '03:45' },
      { problemId: 6, score: 67, time: '01:30' },
      { problemId: 7, score: 62, time: '02:15' },
      { problemId: 8, score: 57, time: '04:00' }
    ],
    solved: 8,
    score: 614
  },
  {
    ranking: 6,
    userId: 106,
    problemScore: [
      { problemId: 1, score: 78, time: '02:15' },
      { problemId: 2, score: 73, time: '04:30' },
      { problemId: 3, score: 68, time: '01:45' },
      { problemId: 4, score: 63, time: '03:20' },
      { problemId: 5, score: 58, time: '02:55' },
      { problemId: 6, score: 53, time: '02:10' },
      { problemId: 7, score: 48, time: '03:35' },
      { problemId: 8, score: 43, time: '04:20' }
    ],
    solved: 8,
    score: 481
  },
  {
    ranking: 7,
    userId: 107,
    problemScore: [
      { problemId: 1, score: 89, time: '03:30' },
      { problemId: 2, score: 84, time: '05:55' },
      { problemId: 3, score: 79, time: '02:12' },
      { problemId: 4, score: 74, time: '04:05' },
      { problemId: 5, score: 69, time: '01:50' },
      { problemId: 6, score: 64, time: '03:00' },
      { problemId: 7, score: 59, time: '02:25' },
      { problemId: 8, score: 54, time: '01:35' }
    ],
    solved: 8,
    score: 577
  },
  {
    ranking: 8,
    userId: 108,
    problemScore: [
      { problemId: 1, score: 93, time: '04:22' },
      { problemId: 2, score: 88, time: '06:40' },
      { problemId: 3, score: 83, time: '04:05' },
      { problemId: 4, score: 78, time: '02:30' },
      { problemId: 5, score: 73, time: '03:45' },
      { problemId: 6, score: 68, time: '01:58' },
      { problemId: 7, score: 63, time: '03:30' },
      { problemId: 8, score: 58, time: '02:10' }
    ],
    solved: 8,
    score: 641
  },
  {
    ranking: 9,
    userId: 109,
    problemScore: [
      { problemId: 1, score: 81, time: '02:40' },
      { problemId: 2, score: 76, time: '05:05' },
      { problemId: 3, score: 71, time: '02:18' },
      { problemId: 4, score: 66, time: '03:12' },
      { problemId: 5, score: 61, time: '02:40' },
      { problemId: 6, score: 56, time: '04:20' },
      { problemId: 7, score: 51, time: '02:55' },
      { problemId: 8, score: 46, time: '03:40' }
    ],
    solved: 8,
    score: 540
  },
  {
    ranking: 10,
    userId: 110,
    problemScore: [
      { problemId: 1, score: 87, time: '03:40' },
      { problemId: 2, score: 82, time: '06:15' },
      { problemId: 3, score: 77, time: '03:02' },
      { problemId: 4, score: 72, time: '02:25' },
      { problemId: 5, score: 67, time: '03:35' },
      { problemId: 6, score: 62, time: '01:40' },
      { problemId: 7, score: 57, time: '04:10' },
      { problemId: 8, score: 52, time: '02:50' }
    ],
    solved: 8,
    score: 564
  }
]

export default function ContestStandings() {
  return <StandingsTable data={dummyData} />
}
