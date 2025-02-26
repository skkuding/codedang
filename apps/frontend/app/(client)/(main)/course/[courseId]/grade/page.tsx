const dummyResponse = {
  data: [
    {
      id: 1,
      title: 'Autograde 꺼져있고 Grade 완료된 과제',
      endTime: '2022-12-31T15:00:00',
      isFinalScoreVisible: true,
      autoFinalizeScore: false,
      week: 1,
      userAssignmentFinalScore: 24,
      assignmentPerfectScore: 30,
      problems: [
        {
          id: 7,
          title: '스꾸딩 크리스마스 트리 만들기',
          order: 0,
          maxScore: 10,
          problemRecord: {
            finalScore: 8,
            comment: 'AAA'
          }
        },
        {
          id: 8,
          title: '스꾸딩 크리스마스 이진탐색트리 만들기기',
          order: 1,
          maxScore: 10,
          problemRecord: {
            finalScore: 8,
            comment: 'AAA'
          }
        },
        {
          id: 9,
          title: '스꾸딩 크리스마스 세그먼트트트리 만들기',
          order: 2,
          maxScore: 10,
          problemRecord: {
            finalScore: 8,
            comment: 'AAA'
          }
        }
      ]
    },
    {
      id: 2,
      title: 'Autograde 켜져있고 Grade 완료된 과제',
      endTime: '2022-12-31T15:00:00',
      isFinalScoreVisible: true,
      autoFinalizeScore: true,
      week: 2,
      userAssignmentFinalScore: 24,
      assignmentPerfectScore: 30,
      problems: [
        {
          id: 7,
          title: '스꾸딩 크리스마스 트리 만들기',
          order: 0,
          maxScore: 10,
          problemRecord: {
            finalScore: 8,
            comment: 'AAA'
          }
        },
        {
          id: 8,
          title: '스꾸딩 크리스마스 이진탐색트리 만들기기',
          order: 1,
          maxScore: 10,
          problemRecord: {
            finalScore: 8,
            comment: 'AAA'
          }
        },
        {
          id: 9,
          title: '스꾸딩 크리스마스 세그먼트트트리 만들기',
          order: 2,
          maxScore: 10,
          problemRecord: {
            finalScore: 8,
            comment: 'AAA'
          }
        }
      ]
    }
  ]
}

export default function Grade() {
  return (
    <div className="mt-6 w-full px-6 py-4">
      <p className="text-2xl font-semibold">Grade</p>
    </div>
  )
}
