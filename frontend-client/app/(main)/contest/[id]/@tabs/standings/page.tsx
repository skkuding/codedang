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
    userId: 2020312942,
    problemScore: [
      { problemId: 1, score: 1127, time: '04:45' },
      { problemId: 2, score: 1062, time: '06:02' },
      { problemId: 3, score: 996, time: '03:25' },
      { problemId: 4, score: 931, time: '02:58' },
      { problemId: 5, score: 866, time: '03:45' },
      { problemId: 6, score: 800, time: '01:30' },
      { problemId: 7, score: 735, time: '02:15' },
      { problemId: 8, score: 670, time: '04:00' }
    ],
    solved: 8,
    score: 8191
  },
  {
    ranking: 2,
    userId: 2020312945,
    problemScore: [
      { problemId: 1, score: 1149, time: '04:22' },
      { problemId: 2, score: 1084, time: '06:40' },
      { problemId: 3, score: 1019, time: '04:05' },
      { problemId: 4, score: 954, time: '02:30' },
      { problemId: 5, score: 889, time: '03:45' },
      { problemId: 6, score: 823, time: '01:58' },
      { problemId: 7, score: 758, time: '03:30' },
      { problemId: 8, score: 693, time: '02:10' }
    ],
    solved: 8,
    score: 8180
  },
  {
    ranking: 3,
    userId: 2020312938,
    problemScore: [
      { problemId: 1, score: 1184, time: '03:15' },
      { problemId: 2, score: 1093, time: '05:22' },
      { problemId: 3, score: 1014, time: '02:45' },
      { problemId: 4, score: 949, time: '01:30' },
      { problemId: 5, score: 875, time: '02:40' },
      { problemId: 6, score: 770, time: '04:10' },
      { problemId: 7, score: 715, time: '03:00' },
      { problemId: 8, score: 660, time: '02:15' }
    ],
    solved: 8,
    score: 8000
  },
  {
    ranking: 4,
    userId: 2020312939,
    problemScore: [
      { problemId: 1, score: 1093, time: '04:10' },
      { problemId: 2, score: 1014, time: '06:30' },
      { problemId: 3, score: 949, time: '03:55' },
      { problemId: 4, score: 875, time: '02:10' },
      { problemId: 5, score: 810, time: '04:45' },
      { problemId: 6, score: 754, time: '01:58' },
      { problemId: 7, score: 660, time: '03:30' },
      { problemId: 8, score: 605, time: '02:00' }
    ],
    solved: 8,
    score: 7650
  },
  {
    ranking: 5,
    userId: 2020312940,
    problemScore: [
      { problemId: 1, score: 1014, time: '02:30' },
      { problemId: 2, score: 949, time: '04:45' },
      { problemId: 3, score: 875, time: '01:58' },
      { problemId: 4, score: 810, time: '03:40' },
      { problemId: 5, score: 754, time: '02:15' },
      { problemId: 6, score: 698, time: '02:22' },
      { problemId: 7, score: 605, time: '03:15' },
      { problemId: 8, score: 550, time: '04:00' }
    ],
    solved: 8,
    score: 7650
  },
  {
    ranking: 6,
    userId: 2020312944,
    problemScore: [
      { problemId: 1, score: 1071, time: '03:30' },
      { problemId: 2, score: 1006, time: '05:55' },
      { problemId: 3, score: 941, time: '02:12' },
      { problemId: 4, score: 876, time: '04:05' },
      { problemId: 5, score: 810, time: '01:50' },
      { problemId: 6, score: 745, time: '03:00' },
      { problemId: 7, score: 680, time: '02:25' },
      { problemId: 8, score: 615, time: '01:35' }
    ],
    solved: 8,
    score: 7644
  },
  {
    ranking: 7,
    userId: 2020312947,
    problemScore: [
      { problemId: 1, score: 1035, time: '03:40' },
      { problemId: 2, score: 970, time: '06:15' },
      { problemId: 3, score: 905, time: '03:02' },
      { problemId: 4, score: 840, time: '02:25' },
      { problemId: 5, score: 775, time: '03:35' },
      { problemId: 6, score: 710, time: '01:40' },
      { problemId: 7, score: 645, time: '04:10' },
      { problemId: 8, score: 580, time: '02:50' }
    ],
    solved: 8,
    score: 7095
  },
  {
    ranking: 8,
    userId: 2020312941,
    problemScore: [
      { problemId: 1, score: 949, time: '03:50' },
      { problemId: 2, score: 875, time: '05:15' },
      { problemId: 3, score: 810, time: '02:22' },
      { problemId: 4, score: 754, time: '01:45' },
      { problemId: 5, score: 698, time: '03:10' },
      { problemId: 6, score: 643, time: '04:30' },
      { problemId: 7, score: 550, time: '02:40' },
      { problemId: 8, score: 495, time: '03:55' }
    ],
    solved: 8,
    score: 6600
  },
  {
    ranking: 9,
    userId: 2020312946,
    problemScore: [
      { problemId: 1, score: 966, time: '02:40' },
      { problemId: 2, score: 901, time: '05:05' },
      { problemId: 3, score: 836, time: '02:18' },
      { problemId: 4, score: 771, time: '03:12' },
      { problemId: 5, score: 706, time: '02:40' },
      { problemId: 6, score: 641, time: '04:20' },
      { problemId: 7, score: 576, time: '02:55' },
      { problemId: 8, score: 511, time: '03:40' }
    ],
    solved: 8,
    score: 6542
  },
  {
    ranking: 10,
    userId: 2020312943,
    problemScore: [
      { problemId: 1, score: 787, time: '02:15' },
      { problemId: 2, score: 721, time: '04:30' },
      { problemId: 3, score: 656, time: '01:45' },
      { problemId: 4, score: 591, time: '03:20' },
      { problemId: 5, score: 526, time: '02:55' },
      { problemId: 6, score: 460, time: '02:10' },
      { problemId: 7, score: 395, time: '03:35' },
      { problemId: 8, score: 330, time: '04:20' }
    ],
    solved: 8,
    score: 4810
  }
]

export default function ContestStandings() {
  return <StandingsTable data={dummyData} />
}
