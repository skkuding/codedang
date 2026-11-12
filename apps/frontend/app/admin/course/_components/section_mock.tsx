export interface BluePrintCourse {
  id: number
  courseNum: string
  courseTitle: string
  semester: string
  isProfessor: boolean
  sections: SectionCourse[]
}

export interface SectionCourse {
  id: number
  groupName: string
  memberNum: number
  courseInfo: { classNum: number }
}

export const bluePrintMockData: BluePrintCourse[] = [
  {
    id: 100,
    courseNum: 'CHS1330',
    courseTitle: '전자회로1',
    semester: '2026 Winter',
    isProfessor: true,
    sections: [
      {
        id: 11,
        groupName: '전자회로1',
        memberNum: 12,
        courseInfo: { classNum: 43 }
      },
      {
        id: 12,
        groupName: '전자회로1',
        memberNum: 41,
        courseInfo: { classNum: 42 }
      }
    ]
  },
  {
    id: 2,
    courseTitle: '김민규개론',
    courseNum: 'SWE1234',
    semester: '2026 Winter',
    isProfessor: false,
    sections: [
      {
        id: 21,
        groupName: '김민규개론',
        memberNum: 15,
        courseInfo: { classNum: 15 }
      },
      {
        id: 22,
        groupName: '김민규개론',
        memberNum: 33,
        courseInfo: { classNum: 16 }
      }
    ]
  },
  {
    id: 74,
    type: 'section',
    title: '권수린개론',
    code: 'KSR2026',
    classNum: 1,
    semester: '2026 Fall',
    studentCount: 1
  }
]
