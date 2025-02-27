export const dummyResponse = {
  data: [
    {
      id: 1,
      title: 'Autograde 꺼져있고 Grade 완료된 과제dfgdfgdf',
      endTime: '3025-01-01T23:59:59.000Z',
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
          title: '스꾸딩 크리스마스 세그먼트트리 만들고 오너먼츠 붙이기',
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
      title: 'Autograde 켜져있고 Grade 미완료된 과제',
      endTime: '3025-01-01T23:59:59.000Z',
      isFinalScoreVisible: false,
      autoFinalizeScore: true,
      week: 2,
      userAssignmentFinalScore: null,
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
            finalScore: null,
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
