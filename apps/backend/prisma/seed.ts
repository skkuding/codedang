import {
  ContestRole,
  GroupType,
  Language,
  Level,
  NotificationType,
  PrismaClient,
  QnACategory,
  ResultStatus,
  Role,
  type Announcement,
  type Assignment,
  type AssignmentRecord,
  type Contest,
  type ContestProblemRecord,
  type ContestRecord,
  type Group,
  type Prisma,
  type Problem,
  type ProblemTestcase,
  type Submission,
  type Tag,
  type UpdateHistory,
  type User,
  type UserContest,
  type Workbook
} from '@prisma/client'
import { hash } from 'argon2'
import { readFile } from 'fs/promises'
import { join } from 'path'

const prisma = new PrismaClient()
const fixturePath = join(__dirname, '__fixtures__')
const problemTestcasesPath = join(__dirname, 'problem-testcases')

const MIN_DATE: Date = new Date('2000-01-01T00:00:00.000Z')
const MAX_DATE: Date = new Date('2999-12-31T00:00:00.000Z')

let superAdminUser: User
let adminUser: User
let instructorUser: User
let contestAdminUser: User
let contestManagerUser: User
let contestReviewerUser: User
let privateGroup1: Group
let privateGroup2: Group
let contest6Group: Group
const users: User[] = []
const problems: Problem[] = []
const updateHistories: UpdateHistory[] = []
let problemTestcases: ProblemTestcase[] = []
const assignments: Assignment[] = []
const endedAssignments: Assignment[] = []
const ongoingAssignments: Assignment[] = []
const upcomingAssignments: Assignment[] = []
const contests: Contest[] = []
const ongoingContests: Contest[] = []
const endedContests: Contest[] = []
const upcomingContests: Contest[] = []
const workbooks: Workbook[] = []
const privateWorkbooks: Workbook[] = []
const submissions: Submission[] = []
const contestRecords: ContestRecord[] = []
const contestAnnouncements: Announcement[] = []
const contestProblemRecords: ContestProblemRecord[] = []

const createUsers = async () => {
  // create super admin user
  superAdminUser = await prisma.user.create({
    data: {
      username: 'super',
      password: await hash('Supersuper'),
      email: 'skkuding@gmail.com',
      lastLogin: new Date(),
      role: Role.SuperAdmin,
      studentId: '2024000000',
      college: 'College of Computing and Informatics',
      major: 'Computer Science'
    }
  })

  // create admin user
  adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      password: await hash('Adminadmin'),
      email: 'admin@example.com',
      lastLogin: new Date(),
      role: Role.Admin,
      studentId: '2024000001',
      college: 'College of Computing and Informatics',
      major: 'Computer Science'
    }
  })

  // create non-admin user with canCreateCourse and canCreateContest
  instructorUser = await prisma.user.create({
    data: {
      username: 'instructor',
      password: await hash('Instructorinstructor'),
      email: 'inst@example.com',
      lastLogin: new Date(),
      role: Role.User,
      studentId: '2024000002',
      college: 'College of Computing and Informatics',
      major: 'Computer Science',
      canCreateCourse: true,
      canCreateContest: true
    }
  })

  // create contest admin user
  contestAdminUser = await prisma.user.create({
    data: {
      username: 'contestAdmin',
      password: await hash('ContestAdmin'),
      email: 'contestAdmin@example.com',
      lastLogin: new Date(),
      role: Role.User,
      canCreateContest: true,
      studentId: '2024000003',
      college: 'College of Computing and Informatics',
      major: 'Computer Science'
    }
  })

  // create contest manager user
  contestManagerUser = await prisma.user.create({
    data: {
      username: 'contestManager',
      password: await hash('ContestManager'),
      email: 'contestManager@example.com',
      lastLogin: new Date(),
      role: Role.User,
      studentId: '2024000004',
      college: 'College of Computing and Informatics',
      major: 'Computer Science'
    }
  })

  // create contest reviewer user
  contestReviewerUser = await prisma.user.create({
    data: {
      username: 'contestReviewer',
      password: await hash('ContestReviewer'),
      email: 'contestReviewer@example.com',
      lastLogin: new Date(),
      role: Role.User,
      studentId: '2024000005',
      college: 'College of Computing and Informatics',
      major: 'Computer Science'
    }
  })

  // create general users
  for (let i = 1; i <= 10; i++) {
    const specifier = i.toString().padStart(2, '0')
    const user = await prisma.user.create({
      data: {
        username: `user${specifier}`,
        password: await hash('Useruser'),
        email: `user${specifier}@example.com`,
        lastLogin: new Date(),
        role: Role.User,
        studentId: `20241000${i.toString().padStart(2, '0')}`,
        college: 'College of Computing and Informatics',
        major: 'Computer Science'
      }
    })
    users.push(user)
  }

  // create super admin user's profile
  await prisma.userProfile.create({
    data: {
      userId: superAdminUser.id,
      realName: 'Yuljeon Kim'
    }
  })

  await prisma.userProfile.create({
    data: {
      userId: adminUser.id,
      realName: 'Admin Kim'
    }
  })

  // create user01 profile
  await prisma.userProfile.create({
    data: {
      userId: users[0].id,
      realName: 'Myeongryun Lee'
    }
  })
}

const createGroups = async () => {
  privateGroup1 = await prisma.group.create({
    data: {
      groupName: '컴퓨터프로그래밍',
      description:
        'C/C++ 언어를 이용한 프로그래밍 기초를 학습합니다. 알고리즘과 자료구조의 기본 개념을 익힙니다.',
      config: {
        showOnList: false,
        allowJoinFromSearch: false,
        allowJoinWithURL: false,
        requireApprovalBeforeJoin: false
      },
      courseInfo: {
        create: {
          courseNum: 'SWE2016',
          classNum: 1,
          professor: '안철수',
          semester: '2025 Spring',
          email: 'woojoo@spacekim.org'
        }
      }
    }
  })

  privateGroup2 = await prisma.group.create({
    data: {
      groupName: '정보보호개론',
      groupType: GroupType.Course,
      config: {
        showOnList: true,
        allowJoinFromSearch: true,
        allowJoinWithURL: true,
        requireApprovalBeforeJoin: false
      },
      courseInfo: {
        create: {
          courseNum: 'SWE3033',
          classNum: 42,
          professor: '형식킴',
          semester: '2025 Spring',
          email: 'example01@skku.edu',
          website: 'https://seclab.com'
        }
      }
    }
  })
  await prisma.userGroup.create({
    data: {
      userId: instructorUser.id,
      groupId: privateGroup2.id,
      isGroupLeader: true
    }
  })

  let tempGroup = await prisma.group.create({
    data: {
      groupName: '자료구조',
      description:
        '배열, 링크드리스트, 스택, 큐, 트리, 그래프 등 기본적인 자료구조와 알고리즘을 학습합니다.',
      config: {
        showOnList: true,
        allowJoinFromSearch: true,
        allowJoinWithURL: true,
        requireApprovalBeforeJoin: false
      },
      courseInfo: {
        create: {
          courseNum: 'SWE2017',
          classNum: 2,
          professor: '박영희',
          semester: '2025 Spring',
          email: 'example@skku.edu',
          website: 'https://skku.edu'
        }
      }
    }
  })
  await prisma.userGroup.create({
    data: {
      userId: instructorUser.id,
      groupId: tempGroup.id,
      isGroupLeader: true
    }
  })

  tempGroup = await prisma.group.create({
    data: {
      groupName: '알고리즘',
      description:
        '정렬, 탐색, 동적계획법, 그리디 알고리즘 등 다양한 알고리즘 설계 기법을 학습합니다.',
      config: {
        showOnList: true,
        allowJoinFromSearch: true,
        allowJoinWithURL: true,
        requireApprovalBeforeJoin: false
      },
      courseInfo: {
        create: {
          courseNum: 'SWE3018',
          classNum: 1,
          professor: '이민수',
          semester: '2025 Spring',
          email: 'ms.lee@skku.edu',
          website: 'https://algorithm.skku.edu'
        }
      }
    }
  })
  await prisma.userGroup.create({
    data: {
      userId: instructorUser.id,
      groupId: tempGroup.id,
      isGroupLeader: true
    }
  })

  const allUsers = await prisma.user.findMany()

  // add users to private group 1
  // group leader: user01
  for (const user of allUsers) {
    await prisma.userGroup.create({
      data: {
        userId: user.id,
        groupId: privateGroup1.id,
        isGroupLeader:
          user.username === 'user01' || user.username === 'instructor'
      }
    })
  }

  // add users to private group 2
  // group leader: user01
  // registered: user01, user03, user05, user07, user09
  for (const user of users) {
    await prisma.userGroup.create({
      data: {
        userId: user.id,
        groupId: privateGroup2.id,
        isGroupLeader: user.username === 'user01'
      }
    })
  }

  await prisma.userGroup.create({
    data: {
      userId: superAdminUser.id,
      groupId: 4,
      isGroupLeader: true
    }
  })

  contest6Group = await prisma.group.create({
    data: {
      groupName: '대회 참가 그룹 6',
      description: 'contest6 참가자를 위한 그룹',
      groupType: GroupType.Study,
      config: {
        showOnList: false,
        allowJoinFromSearch: false,
        allowJoinWithURL: false,
        requireApprovalBeforeJoin: false
      }
    }
  })

  await prisma.userGroup.createMany({
    data: [
      {
        userId: instructorUser.id,
        groupId: contest6Group.id,
        isGroupLeader: true
      }
    ],
    skipDuplicates: true
  })
  const usersForGroup6 = users.slice(0, 5).map((u) => ({ id: u.id }))
  await prisma.userGroup.createMany({
    data: usersForGroup6.map((u) => ({
      userId: u.id,
      groupId: contest6Group.id,
      isGroupLeader: false
    })),
    skipDuplicates: true
  })
}

const createNotices = async () => {
  await prisma.notice.createMany({
    data: [
      {
        title: '아주 중요한 공지사항 (1)',
        content: '<p>사실 별 내용 없어요 😇</p>',
        createdById: superAdminUser.id
      },
      {
        title: '더 중요한 공지사항 (2)',
        content: `<p>아래 내용은 한글 Lorem Ipsum으로 생성된 내용입니다! 별 의미 없어요.</p>
<p>모든 국민은 신속한 재판을 받을 권리를 가진다. 형사피고인은 상당한 이유가 없는 한 지체없이 공개재판을 받을 권리를 가진다.</p>
<p>법관은 탄핵 또는 금고 이상의 형의 선고에 의하지 아니하고는 파면되지 아니하며, 징계처분에 의하지 아니하고는 정직·감봉 기타 불리한 처분을 받지 아니한다.</p>
<p>일반사면을 명하려면 국회의 동의를 얻어야 한다. 연소자의 근로는 특별한 보호를 받는다.</p>
<p>국회에서 의결된 법률안은 정부에 이송되어 15일 이내에 대통령이 공포한다.</p>
<p>법률이 정하는 주요방위산업체에 종사하는 근로자의 단체행동권은 법률이 정하는 바에 의하여 이를 제한하거나 인정하지 아니할 수 있다.</p>
<p>법률은 특별한 규정이 없는 한 공포한 날로부터 20일을 경과함으로써 효력을 발생한다.</p>
<p>비상계엄이 선포된 때에는 법률이 정하는 바에 의하여 영장제도, 언론·출판·집회·결사의 자유, 정부나 법원의 권한에 관하여 특별한 조치를 할 수 있다.</p>`,
        createdById: superAdminUser.id
      },
      {
        title: '제일 중요한 공지사항 (3)',
        content: `<p>아래 내용은 한글 Lorem Ipsum으로 생성된 내용입니다! 별 의미 없어요.</p>
<p>민주평화통일자문회의의 조직·직무범위 기타 필요한 사항은 법률로 정한다.</p>
<p>형사피의자 또는 형사피고인으로서 구금되었던 자가 법률이 정하는 불기소처분을 받거나 무죄판결을 받은 때에는 법률이 정하는 바에 의하여 국가에 정당한 보상을 청구할 수 있다.</p>
<p>대통령은 법률이 정하는 바에 의하여 사면·감형 또는 복권을 명할 수 있다.</p>
<p>국무위원은 국정에 관하여 대통령을 보좌하며, 국무회의의 구성원으로서 국정을 심의한다.</p>
<p>국민의 모든 자유와 권리는 국가안전보장·질서유지 또는 공공복리를 위하여 필요한 경우에 한하여 법률로써 제한할 수 있으며, 제한하는 경우에도 자유와 권리의 본질적인 내용을 침해할 수 없다.</p>
<p>한 회계연도를 넘어 계속하여 지출할 필요가 있을 때에는 정부는 연한을 정하여 계속비로서 국회의 의결을 얻어야 한다.</p>
<p>국가는 재해를 예방하고 그 위험으로부터 국민을 보호하기 위하여 노력하여야 한다.</p>`,
        createdById: superAdminUser.id
      },
      {
        title: 'HTML element들 테스트해봐요 (4)',
        isFixed: true,
        content: `<h1>Heading 1</h1>
<h2>Heading 2</h2>
<p>Simple Text</p>
<p><strong>Bold Text</strong></p>
<p><em>Italic Text</em></p>
<p><s>Text with Strike</s></p>
<p><code>Inline Code</code></p>
<pre><code>#include &lt;stdio.h&gt;

int main() {
  printf("Hello, world!");
  return 0;
}
</code></pre>
<ul>
  <li><p>Bullet List Item 1</p></li>
  <li><p>Bullet List Item 2</p></li>
  <li><p>Bullet List Item 3</p></li>
</ul>
<ol>
  <li><p>Ordered List Item 1</p></li>
  <li><p>Ordered List Item 2</p></li>
  <li><p>Ordered List Item 3</p></li>
</ol>`,
        createdById: instructorUser.id
      },
      {
        title: '아주 중요한 공지사항 (5)',
        content: '<p>사실 별 내용 없어요 😇</p>',
        createdById: superAdminUser.id
      },
      {
        title: '더 중요한 공지사항 (6)',
        content: `<p>아래 내용은 한글 Lorem Ipsum으로 생성된 내용입니다! 별 의미 없어요.</p>
<p>모든 국민은 신속한 재판을 받을 권리를 가진다. 형사피고인은 상당한 이유가 없는 한 지체없이 공개재판을 받을 권리를 가진다.</p>
<p>법관은 탄핵 또는 금고 이상의 형의 선고에 의하지 아니하고는 파면되지 아니하며, 징계처분에 의하지 아니하고는 정직·감봉 기타 불리한 처분을 받지 아니한다.</p>
<p>일반사면을 명하려면 국회의 동의를 얻어야 한다. 연소자의 근로는 특별한 보호를 받는다.</p>
<p>국회에서 의결된 법률안은 정부에 이송되어 15일 이내에 대통령이 공포한다.</p>
<p>법률이 정하는 주요방위산업체에 종사하는 근로자의 단체행동권은 법률이 정하는 바에 의하여 이를 제한하거나 인정하지 아니할 수 있다.</p>
<p>법률은 특별한 규정이 없는 한 공포한 날로부터 20일을 경과함으로써 효력을 발생한다.</p>
<p>비상계엄이 선포된 때에는 법률이 정하는 바에 의하여 영장제도, 언론·출판·집회·결사의 자유, 정부나 법원의 권한에 관하여 특별한 조치를 할 수 있다.</p>`,
        createdById: superAdminUser.id
      },
      {
        title: '제일 중요한 공지사항 (7)',
        isFixed: true,
        content: `<p>아래 내용은 한글 Lorem Ipsum으로 생성된 내용입니다! 별 의미 없어요.</p>
<p>민주평화통일자문회의의 조직·직무범위 기타 필요한 사항은 법률로 정한다.</p>
<p>형사피의자 또는 형사피고인으로서 구금되었던 자가 법률이 정하는 불기소처분을 받거나 무죄판결을 받은 때에는 법률이 정하는 바에 의하여 국가에 정당한 보상을 청구할 수 있다.</p>
<p>대통령은 법률이 정하는 바에 의하여 사면·감형 또는 복권을 명할 수 있다.</p>
<p>국무위원은 국정에 관하여 대통령을 보좌하며, 국무회의의 구성원으로서 국정을 심의한다.</p>
<p>국민의 모든 자유와 권리는 국가안전보장·질서유지 또는 공공복리를 위하여 필요한 경우에 한하여 법률로써 제한할 수 있으며, 제한하는 경우에도 자유와 권리의 본질적인 내용을 침해할 수 없다.</p>
<p>한 회계연도를 넘어 계속하여 지출할 필요가 있을 때에는 정부는 연한을 정하여 계속비로서 국회의 의결을 얻어야 한다.</p>
<p>국가는 재해를 예방하고 그 위험으로부터 국민을 보호하기 위하여 노력하여야 한다.</p>`,
        createdById: superAdminUser.id
      },
      {
        title: 'HTML element들 테스트해봐요 (8)',
        content: `<h1>Heading 1</h1>
<h2>Heading 2</h2>
<p>Simple Text</p>
<p><strong>Bold Text</strong></p>
<p><em>Italic Text</em></p>
<p><s>Text with Strike</s></p>
<p><code>Inline Code</code></p>
<pre><code>#include &lt;stdio.h&gt;

int main() {
  printf("Hello, world!");
  return 0;
}
</code></pre>
<ul>
  <li><p>Bullet List Item 1</p></li>
  <li><p>Bullet List Item 2</p></li>
  <li><p>Bullet List Item 3</p></li>
</ul>
<ol>
  <li><p>Ordered List Item 1</p></li>
  <li><p>Ordered List Item 2</p></li>
  <li><p>Ordered List Item 3</p></li>
</ol>`,
        createdById: instructorUser.id
      },
      {
        title: '아주 중요한 공지사항 (9)',
        content: '<p>사실 별 내용 없어요 😇</p>',
        createdById: superAdminUser.id
      },
      {
        title: '더 중요한 공지사항 (10)',
        content: `<p>아래 내용은 한글 Lorem Ipsum으로 생성된 내용입니다! 별 의미 없어요.</p>
<p>모든 국민은 신속한 재판을 받을 권리를 가진다. 형사피고인은 상당한 이유가 없는 한 지체없이 공개재판을 받을 권리를 가진다.</p>
<p>법관은 탄핵 또는 금고 이상의 형의 선고에 의하지 아니하고는 파면되지 아니하며, 징계처분에 의하지 아니하고는 정직·감봉 기타 불리한 처분을 받지 아니한다.</p>
<p>일반사면을 명하려면 국회의 동의를 얻어야 한다. 연소자의 근로는 특별한 보호를 받는다.</p>
<p>국회에서 의결된 법률안은 정부에 이송되어 15일 이내에 대통령이 공포한다.</p>
<p>법률이 정하는 주요방위산업체에 종사하는 근로자의 단체행동권은 법률이 정하는 바에 의하여 이를 제한하거나 인정하지 아니할 수 있다.</p>
<p>법률은 특별한 규정이 없는 한 공포한 날로부터 20일을 경과함으로써 효력을 발생한다.</p>
<p>비상계엄이 선포된 때에는 법률이 정하는 바에 의하여 영장제도, 언론·출판·집회·결사의 자유, 정부나 법원의 권한에 관하여 특별한 조치를 할 수 있다.</p>`,
        createdById: superAdminUser.id
      },
      {
        title: '제일 중요한 공지사항 (11)',
        content: `<p>아래 내용은 한글 Lorem Ipsum으로 생성된 내용입니다! 별 의미 없어요.</p>
<p>민주평화통일자문회의의 조직·직무범위 기타 필요한 사항은 법률로 정한다.</p>
<p>형사피의자 또는 형사피고인으로서 구금되었던 자가 법률이 정하는 불기소처분을 받거나 무죄판결을 받은 때에는 법률이 정하는 바에 의하여 국가에 정당한 보상을 청구할 수 있다.</p>
<p>대통령은 법률이 정하는 바에 의하여 사면·감형 또는 복권을 명할 수 있다.</p>
<p>국무위원은 국정에 관하여 대통령을 보좌하며, 국무회의의 구성원으로서 국정을 심의한다.</p>
<p>국민의 모든 자유와 권리는 국가안전보장·질서유지 또는 공공복리를 위하여 필요한 경우에 한하여 법률로써 제한할 수 있으며, 제한하는 경우에도 자유와 권리의 본질적인 내용을 침해할 수 없다.</p>
<p>한 회계연도를 넘어 계속하여 지출할 필요가 있을 때에는 정부는 연한을 정하여 계속비로서 국회의 의결을 얻어야 한다.</p>
<p>국가는 재해를 예방하고 그 위험으로부터 국민을 보호하기 위하여 노력하여야 한다.</p>`,
        createdById: superAdminUser.id
      },
      {
        title: 'HTML element들 테스트해봐요 (12)',
        content: `<h1>Heading 1</h1>
<h2>Heading 2</h2>
<p>Simple Text</p>
<p><strong>Bold Text</strong></p>
<p><em>Italic Text</em></p>
<p><s>Text with Strike</s></p>
<p><code>Inline Code</code></p>
<pre><code>#include &lt;stdio.h&gt;

int main() {
  printf("Hello, world!");
  return 0;
}
</code></pre>
<ul>
  <li><p>Bullet List Item 1</p></li>
  <li><p>Bullet List Item 2</p></li>
  <li><p>Bullet List Item 3</p></li>
</ul>
<ol>
  <li><p>Ordered List Item 1</p></li>
  <li><p>Ordered List Item 2</p></li>
  <li><p>Ordered List Item 3</p></li>
</ol>`,
        createdById: instructorUser.id
      },
      {
        title: '아주 중요한 공지사항 (13)',
        content: '<p>사실 별 내용 없어요 😇</p>',
        createdById: superAdminUser.id
      },
      {
        title: '더 중요한 공지사항 (14)',
        content: `<p>아래 내용은 한글 Lorem Ipsum으로 생성된 내용입니다! 별 의미 없어요.</p>
<p>모든 국민은 신속한 재판을 받을 권리를 가진다. 형사피고인은 상당한 이유가 없는 한 지체없이 공개재판을 받을 권리를 가진다.</p>
<p>법관은 탄핵 또는 금고 이상의 형의 선고에 의하지 아니하고는 파면되지 아니하며, 징계처분에 의하지 아니하고는 정직·감봉 기타 불리한 처분을 받지 아니한다.</p>
<p>일반사면을 명하려면 국회의 동의를 얻어야 한다. 연소자의 근로는 특별한 보호를 받는다.</p>
<p>국회에서 의결된 법률안은 정부에 이송되어 15일 이내에 대통령이 공포한다.</p>
<p>법률이 정하는 주요방위산업체에 종사하는 근로자의 단체행동권은 법률이 정하는 바에 의하여 이를 제한하거나 인정하지 아니할 수 있다.</p>
<p>법률은 특별한 규정이 없는 한 공포한 날로부터 20일을 경과함으로써 효력을 발생한다.</p>
<p>비상계엄이 선포된 때에는 법률이 정하는 바에 의하여 영장제도, 언론·출판·집회·결사의 자유, 정부나 법원의 권한에 관하여 특별한 조치를 할 수 있다.</p>`,
        createdById: superAdminUser.id
      },
      {
        title: '제일 중요한 공지사항 (15)',
        content: `<p>아래 내용은 한글 Lorem Ipsum으로 생성된 내용입니다! 별 의미 없어요.</p>
<p>민주평화통일자문회의의 조직·직무범위 기타 필요한 사항은 법률로 정한다.</p>
<p>형사피의자 또는 형사피고인으로서 구금되었던 자가 법률이 정하는 불기소처분을 받거나 무죄판결을 받은 때에는 법률이 정하는 바에 의하여 국가에 정당한 보상을 청구할 수 있다.</p>
<p>대통령은 법률이 정하는 바에 의하여 사면·감형 또는 복권을 명할 수 있다.</p>
<p>국무위원은 국정에 관하여 대통령을 보좌하며, 국무회의의 구성원으로서 국정을 심의한다.</p>
<p>국민의 모든 자유와 권리는 국가안전보장·질서유지 또는 공공복리를 위하여 필요한 경우에 한하여 법률로써 제한할 수 있으며, 제한하는 경우에도 자유와 권리의 본질적인 내용을 침해할 수 없다.</p>
<p>한 회계연도를 넘어 계속하여 지출할 필요가 있을 때에는 정부는 연한을 정하여 계속비로서 국회의 의결을 얻어야 한다.</p>
<p>국가는 재해를 예방하고 그 위험으로부터 국민을 보호하기 위하여 노력하여야 한다.</p>`,
        createdById: superAdminUser.id
      },
      {
        title: 'HTML element들 테스트해봐요 (16)',
        content: `<h1>Heading 1</h1>
<h2>Heading 2</h2>
<p>Simple Text</p>
<p><strong>Bold Text</strong></p>
<p><em>Italic Text</em></p>
<p><s>Text with Strike</s></p>
<p><code>Inline Code</code></p>
<pre><code>#include &lt;stdio.h&gt;

int main() {
  printf("Hello, world!");
  return 0;
}
</code></pre>
<ul>
  <li><p>Bullet List Item 1</p></li>
  <li><p>Bullet List Item 2</p></li>
  <li><p>Bullet List Item 3</p></li>
</ul>
<ol>
  <li><p>Ordered List Item 1</p></li>
  <li><p>Ordered List Item 2</p></li>
  <li><p>Ordered List Item 3</p></li>
</ol>`,
        createdById: instructorUser.id
      },
      {
        title: '아주 중요한 공지사항 (17)',
        content: '<p>사실 별 내용 없어요 😇</p>',
        createdById: superAdminUser.id
      },
      {
        title: '더 중요한 공지사항 (18)',
        content: `<p>아래 내용은 한글 Lorem Ipsum으로 생성된 내용입니다! 별 의미 없어요.</p>
<p>모든 국민은 신속한 재판을 받을 권리를 가진다. 형사피고인은 상당한 이유가 없는 한 지체없이 공개재판을 받을 권리를 가진다.</p>
<p>법관은 탄핵 또는 금고 이상의 형의 선고에 의하지 아니하고는 파면되지 아니하며, 징계처분에 의하지 아니하고는 정직·감봉 기타 불리한 처분을 받지 아니한다.</p>
<p>일반사면을 명하려면 국회의 동의를 얻어야 한다. 연소자의 근로는 특별한 보호를 받는다.</p>
<p>국회에서 의결된 법률안은 정부에 이송되어 15일 이내에 대통령이 공포한다.</p>
<p>법률이 정하는 주요방위산업체에 종사하는 근로자의 단체행동권은 법률이 정하는 바에 의하여 이를 제한하거나 인정하지 아니할 수 있다.</p>
<p>법률은 특별한 규정이 없는 한 공포한 날로부터 20일을 경과함으로써 효력을 발생한다.</p>
<p>비상계엄이 선포된 때에는 법률이 정하는 바에 의하여 영장제도, 언론·출판·집회·결사의 자유, 정부나 법원의 권한에 관하여 특별한 조치를 할 수 있다.</p>`,
        createdById: superAdminUser.id
      },
      {
        title: '제일 중요한 공지사항 (19)',
        content: `<p>아래 내용은 한글 Lorem Ipsum으로 생성된 내용입니다! 별 의미 없어요.</p>
<p>민주평화통일자문회의의 조직·직무범위 기타 필요한 사항은 법률로 정한다.</p>
<p>형사피의자 또는 형사피고인으로서 구금되었던 자가 법률이 정하는 불기소처분을 받거나 무죄판결을 받은 때에는 법률이 정하는 바에 의하여 국가에 정당한 보상을 청구할 수 있다.</p>
<p>대통령은 법률이 정하는 바에 의하여 사면·감형 또는 복권을 명할 수 있다.</p>
<p>국무위원은 국정에 관하여 대통령을 보좌하며, 국무회의의 구성원으로서 국정을 심의한다.</p>
<p>국민의 모든 자유와 권리는 국가안전보장·질서유지 또는 공공복리를 위하여 필요한 경우에 한하여 법률로써 제한할 수 있으며, 제한하는 경우에도 자유와 권리의 본질적인 내용을 침해할 수 없다.</p>
<p>한 회계연도를 넘어 계속하여 지출할 필요가 있을 때에는 정부는 연한을 정하여 계속비로서 국회의 의결을 얻어야 한다.</p>
<p>국가는 재해를 예방하고 그 위험으로부터 국민을 보호하기 위하여 노력하여야 한다.</p>`,
        createdById: superAdminUser.id
      },
      {
        title: 'HTML element들 테스트해봐요 (20)',
        content: `<h1>Heading 1</h1>
<h2>Heading 2</h2>
<p>Simple Text</p>
<p><strong>Bold Text</strong></p>
<p><em>Italic Text</em></p>
<p><s>Text with Strike</s></p>
<p><code>Inline Code</code></p>
<pre><code>#include &lt;stdio.h&gt;

int main() {
  printf("Hello, world!");
  return 0;
}
</code></pre>
<ul>
  <li><p>Bullet List Item 1</p></li>
  <li><p>Bullet List Item 2</p></li>
  <li><p>Bullet List Item 3</p></li>
</ul>
<ol>
  <li><p>Ordered List Item 1</p></li>
  <li><p>Ordered List Item 2</p></li>
  <li><p>Ordered List Item 3</p></li>
</ol>`,
        createdById: instructorUser.id
      },
      {
        title: '아주 중요한 공지사항 (21)',
        content: '<p>사실 별 내용 없어요 😇</p>',
        createdById: superAdminUser.id
      },
      {
        title: '더 중요한 공지사항 (22)',
        content: `<p>아래 내용은 한글 Lorem Ipsum으로 생성된 내용입니다! 별 의미 없어요.</p>
<p>모든 국민은 신속한 재판을 받을 권리를 가진다. 형사피고인은 상당한 이유가 없는 한 지체없이 공개재판을 받을 권리를 가진다.</p>
<p>법관은 탄핵 또는 금고 이상의 형의 선고에 의하지 아니하고는 파면되지 아니하며, 징계처분에 의하지 아니하고는 정직·감봉 기타 불리한 처분을 받지 아니한다.</p>
<p>일반사면을 명하려면 국회의 동의를 얻어야 한다. 연소자의 근로는 특별한 보호를 받는다.</p>
<p>국회에서 의결된 법률안은 정부에 이송되어 15일 이내에 대통령이 공포한다.</p>
<p>법률이 정하는 주요방위산업체에 종사하는 근로자의 단체행동권은 법률이 정하는 바에 의하여 이를 제한하거나 인정하지 아니할 수 있다.</p>
<p>법률은 특별한 규정이 없는 한 공포한 날로부터 20일을 경과함으로써 효력을 발생한다.</p>
<p>비상계엄이 선포된 때에는 법률이 정하는 바에 의하여 영장제도, 언론·출판·집회·결사의 자유, 정부나 법원의 권한에 관하여 특별한 조치를 할 수 있다.</p>`,
        createdById: superAdminUser.id
      },
      {
        title: '제일 중요한 공지사항 (23)',
        content: `<p>아래 내용은 한글 Lorem Ipsum으로 생성된 내용입니다! 별 의미 없어요.</p>
<p>민주평화통일자문회의의 조직·직무범위 기타 필요한 사항은 법률로 정한다.</p>
<p>형사피의자 또는 형사피고인으로서 구금되었던 자가 법률이 정하는 불기소처분을 받거나 무죄판결을 받은 때에는 법률이 정하는 바에 의하여 국가에 정당한 보상을 청구할 수 있다.</p>
<p>대통령은 법률이 정하는 바에 의하여 사면·감형 또는 복권을 명할 수 있다.</p>
<p>국무위원은 국정에 관하여 대통령을 보좌하며, 국무회의의 구성원으로서 국정을 심의한다.</p>
<p>국민의 모든 자유와 권리는 국가안전보장·질서유지 또는 공공복리를 위하여 필요한 경우에 한하여 법률로써 제한할 수 있으며, 제한하는 경우에도 자유와 권리의 본질적인 내용을 침해할 수 없다.</p>
<p>한 회계연도를 넘어 계속하여 지출할 필요가 있을 때에는 정부는 연한을 정하여 계속비로서 국회의 의결을 얻어야 한다.</p>
<p>국가는 재해를 예방하고 그 위험으로부터 국민을 보호하기 위하여 노력하여야 한다.</p>`,
        createdById: superAdminUser.id
      },
      {
        title: 'HTML element들 테스트해봐요 (24)',
        content: `<h1>Heading 1</h1>
<h2>Heading 2</h2>
<p>Simple Text</p>
<p><strong>Bold Text</strong></p>
<p><em>Italic Text</em></p>
<p><s>Text with Strike</s></p>
<p><code>Inline Code</code></p>
<pre><code>#include &lt;stdio.h&gt;

int main() {
  printf("Hello, world!");
  return 0;
}
</code></pre>
<ul>
  <li><p>Bullet List Item 1</p></li>
  <li><p>Bullet List Item 2</p></li>
  <li><p>Bullet List Item 3</p></li>
</ul>
<ol>
  <li><p>Ordered List Item 1</p></li>
  <li><p>Ordered List Item 2</p></li>
  <li><p>Ordered List Item 3</p></li>
</ol>`,
        createdById: instructorUser.id
      }
    ]
  })

  const courseNotices = await prisma.courseNotice.createManyAndReturn({
    data: [
      {
        groupId: 1,
        title: '첫 번째 강의 공지입니다.',
        content:
          '1번 강의에 대한 공지사항입니다.\n이 공지는 해당 강의 수강생들에게만 공개되며 고정되어 있지 않습니다.',
        isPublic: false,
        isFixed: false
      },
      {
        groupId: 1,
        title: '두 번째 강의 공지입니다.',
        content:
          '1번 강의에 대한 공지사항입니다.\n이 공지는 모든 사용자에게 공개되며 고정되어 있지 않습니다.',
        isPublic: true,
        isFixed: false
      },
      {
        groupId: 1,
        title: '세 번째 강의 공지입니다.',
        content:
          '1번 강의에 대한 공지사항입니다.\n이 공지는 해당 강의 수강생들에게만 공개되며 고정되어 있습니다.',
        isPublic: false,
        isFixed: true
      },
      {
        groupId: 1,
        title: '네 번째 강의 공지입니다.',
        content:
          '1번 강의에 대한 공지사항입니다.\n이 공지는 모든 사용자에게 공개되며 고정되어 있습니다.',
        isPublic: true,
        isFixed: true
      }
    ]
  })

  const students = await prisma.userGroup.findMany({
    where: {
      groupId: 1
    },
    select: {
      userId: true,
      isGroupLeader: true
    }
  })

  const comments = await prisma.courseNoticeComment.createManyAndReturn({
    data: [
      {
        createdById: students[6].userId,
        content: '첫 번째 댓글입니다.',
        courseNoticeId: courseNotices[0].id,
        isSecret: false
      },
      {
        createdById: students[6].userId,
        content: '두 번째 댓글입니다.',
        courseNoticeId: courseNotices[0].id,
        isSecret: false
      },
      {
        createdById: students[6].userId,
        content: '첫 번째 비밀 댓글입니다.',
        courseNoticeId: courseNotices[0].id,
        isSecret: true
      }
    ],
    select: {
      id: true
    }
  })

  await prisma.courseNoticeComment.createMany({
    data: [
      {
        createdById: students[5].userId,
        content: '첫 번째 답글입니다.',
        replyOnId: comments[0].id,
        courseNoticeId: courseNotices[0].id,
        isSecret: false
      },
      {
        createdById: students[6].userId,
        content: '두 번째 답글입니다.',
        replyOnId: comments[0].id,
        courseNoticeId: courseNotices[0].id,
        isSecret: false
      },
      {
        createdById: students[6].userId,
        content: '첫 번째 비밀 답글입니다.',
        replyOnId: comments[0].id,
        courseNoticeId: courseNotices[0].id,
        isSecret: true
      },
      {
        createdById: students[6].userId,
        content: '첫 번째 비밀 답글입니다.',
        replyOnId: comments[2].id,
        courseNoticeId: courseNotices[0].id,
        isSecret: true
      }
    ]
  })
}

const createProblems = async () => {
  problems.push(
    await prisma.problem.create({
      data: {
        title: '정수 더하기',
        engTitle: 'Integer Addition',
        createdById: superAdminUser.id,
        description: await readFile(
          join(fixturePath, 'problem/1-description.html'),
          'utf-8'
        ),
        engDescription: await readFile(
          join(fixturePath, 'problem/1-description-eng.html'),
          'utf-8'
        ),
        difficulty: Level.Level1,
        inputDescription: await readFile(
          join(fixturePath, 'problem/1-input.html'),
          'utf-8'
        ),
        engInputDescription: await readFile(
          join(fixturePath, 'problem/1-input-eng.html'),
          'utf-8'
        ),
        outputDescription: await readFile(
          join(fixturePath, 'problem/1-output.html'),
          'utf-8'
        ),
        engOutputDescription: await readFile(
          join(fixturePath, 'problem/1-output-eng.html'),
          'utf-8'
        ),
        languages: [
          Language.C,
          Language.Cpp,
          Language.Java,
          Language.Python3,
          Language.PyPy3
        ],
        solution: [
          { code: '', language: Language.C },
          { code: '', language: Language.Cpp },
          { code: '', language: Language.Java },
          { code: '', language: Language.Python3 },
          { code: '', language: Language.PyPy3 }
        ],
        hint: '',
        timeLimit: 2000,
        memoryLimit: 512,
        source: '',
        visibleLockTime: new Date('2028-01-01T23:59:59.000Z') //ongoingAssignments[0].endTime
      }
    })
  )

  problems.push(
    await prisma.problem.create({
      data: {
        title: '가파른 경사',
        createdById: superAdminUser.id,
        description: await readFile(
          join(fixturePath, 'problem/2-description.html'),
          'utf-8'
        ),
        difficulty: Level.Level1,
        inputDescription: await readFile(
          join(fixturePath, 'problem/2-input.html'),
          'utf-8'
        ),
        outputDescription: await readFile(
          join(fixturePath, 'problem/2-output.html'),
          'utf-8'
        ),
        languages: [Language.C],
        solution: [{ code: '', language: Language.C }],
        hint: '',
        timeLimit: 2000,
        memoryLimit: 512,
        source: 'Canadian Computing Competition(CCC) 2012 Junior 2번',
        visibleLockTime: new Date('2028-01-01T23:59:59.000Z') //ongoingAssignments[0].endTime
      }
    })
  )

  problems.push(
    await prisma.problem.create({
      data: {
        title: '회전 표지판',
        createdById: superAdminUser.id,
        description: await readFile(
          join(fixturePath, 'problem/3-description.html'),
          'utf-8'
        ),
        difficulty: Level.Level1,
        inputDescription: await readFile(
          join(fixturePath, 'problem/3-input.html'),
          'utf-8'
        ),
        outputDescription: await readFile(
          join(fixturePath, 'problem/3-output.html'),
          'utf-8'
        ),
        languages: [Language.Cpp],
        solution: [{ code: '', language: Language.Cpp }],
        hint: '',
        timeLimit: 1000,
        memoryLimit: 128,
        source: 'Canadian Computing Competition(CCC) 2013 Junior 2번',
        visibleLockTime: new Date('2028-01-01T23:59:59.000Z') //ongoingAssignments[0].endTime
      }
    })
  )

  problems.push(
    await prisma.problem.create({
      data: {
        title: '붕어빵',
        createdById: superAdminUser.id,
        description: await readFile(
          join(fixturePath, 'problem/4-description.html'),
          'utf-8'
        ),
        difficulty: Level.Level2,
        inputDescription: await readFile(
          join(fixturePath, 'problem/4-input.html'),
          'utf-8'
        ),
        outputDescription: await readFile(
          join(fixturePath, 'problem/4-output.html'),
          'utf-8'
        ),
        languages: [Language.Java],
        solution: [{ code: '', language: Language.Java }],
        hint: await readFile(join(fixturePath, 'problem/4-hint.html'), 'utf-8'),
        timeLimit: 1000,
        memoryLimit: 128,
        source: 'USACO 2012 US Open Bronze 1번',
        visibleLockTime: new Date('2024-01-01T23:59:59.000Z') //endedAssignments[0].endTime
      }
    })
  )

  problems.push(
    await prisma.problem.create({
      data: {
        title: '채권관계',
        createdById: superAdminUser.id,
        description: await readFile(
          join(fixturePath, 'problem/5-description.html'),
          'utf-8'
        ),
        difficulty: Level.Level2,
        inputDescription: await readFile(
          join(fixturePath, 'problem/5-input.html'),
          'utf-8'
        ),
        outputDescription: await readFile(
          join(fixturePath, 'problem/5-output.html'),
          'utf-8'
        ),
        languages: [Language.Python3],
        solution: [{ code: '', language: Language.Python3 }],
        hint: '',
        timeLimit: 1000,
        memoryLimit: 128,
        source: 'ICPC Regionals NCPC 2009 B번',
        visibleLockTime: new Date('2024-01-01T23:59:59.000Z') //endedAssignments[0].endTime
      }
    })
  )

  problems.push(
    await prisma.problem.create({
      data: {
        title: '타일 교환',
        createdById: superAdminUser.id,
        description: await readFile(
          join(fixturePath, 'problem/6-description.html'),
          'utf-8'
        ),
        difficulty: Level.Level3,
        inputDescription: await readFile(
          join(fixturePath, 'problem/6-input.html'),
          'utf-8'
        ),
        outputDescription: await readFile(
          join(fixturePath, 'problem/6-output.html'),
          'utf-8'
        ),
        languages: [Language.C, Language.Java],
        solution: [
          { code: '', language: Language.C },
          { code: '', language: Language.Java }
        ],
        hint: await readFile(join(fixturePath, 'problem/6-hint.html'), 'utf-8'),
        timeLimit: 1000,
        memoryLimit: 128,
        source: 'USACO November 2011 Silver 3번',
        visibleLockTime: MIN_DATE
      }
    })
  )

  problems.push(
    await prisma.problem.create({
      data: {
        title: '천재 디자이너',
        createdById: superAdminUser.id,
        description: await readFile(
          join(fixturePath, 'problem/7-description.html'),
          'utf8'
        ),
        difficulty: Level.Level3,
        inputDescription: await readFile(
          join(fixturePath, 'problem/7-input.html'),
          'utf8'
        ),
        outputDescription: await readFile(
          join(fixturePath, 'problem/7-output.html'),
          'utf8'
        ),
        languages: [Language.Cpp, Language.Python3],
        solution: [
          { code: '', language: Language.Cpp },
          { code: '', language: Language.Python3 }
        ],
        hint: '',
        timeLimit: 2000,
        memoryLimit: 512,
        source: 'COCI 2019/2020 Assignment #3 2번',
        visibleLockTime: MIN_DATE
      }
    })
  )

  problems.push(
    await prisma.problem.create({
      data: {
        title: '사이클 분할',
        createdById: superAdminUser.id,
        description: await readFile(
          join(fixturePath, 'problem/8-description.html'),
          'utf-8'
        ),
        difficulty: Level.Level3,
        inputDescription: await readFile(
          join(fixturePath, 'problem/8-input.html'),
          'utf-8'
        ),
        outputDescription: await readFile(
          join(fixturePath, 'problem/8-output.html'),
          'utf-8'
        ),
        languages: [Language.C, Language.Cpp, Language.Java, Language.Python3],
        solution: [
          { code: '', language: Language.C },
          { code: '', language: Language.Cpp },
          { code: '', language: Language.Java },
          { code: '', language: Language.Python3 }
        ],
        hint: await readFile(join(fixturePath, 'problem/8-hint.html'), 'utf-8'),
        timeLimit: 2000,
        memoryLimit: 256,
        source: 'ICPC Regionals SEERC 2019 J번',
        visibleLockTime: MAX_DATE
      }
    })
  )

  problems.push(
    await prisma.problem.create({
      data: {
        title: '수정중인 문제',
        createdById: superAdminUser.id,
        description: `<p>수정 작업 중</p>`,
        difficulty: Level.Level3,
        inputDescription: `<p>비공개</p>`,
        outputDescription: `<p>비공개</p>`,
        languages: [Language.C, Language.Cpp, Language.Java, Language.Python3],
        solution: [
          { code: '', language: Language.C },
          { code: '', language: Language.Cpp },
          { code: '', language: Language.Java },
          { code: '', language: Language.Python3 }
        ],
        hint: `<p>작성중</p>`,
        timeLimit: 2000,
        memoryLimit: 256,
        source: '2024 육군훈련소 입소 코딩 테스트',
        visibleLockTime: MAX_DATE
      }
    })
  )

  // add testcases
  for (let i = 1; i < 9; i++) {
    const data = await readFile(
      join(problemTestcasesPath, `${i}.json`),
      'utf-8'
    )
    const testcases: { id: string; input: string; output: string }[] =
      JSON.parse(data)

    await prisma.problemTestcase.createMany({
      data: testcases.map((testcase) => {
        return {
          input: testcase.input,
          output: testcase.output,
          problemId: i
        }
      })
    })
  }

  problemTestcases = await prisma.problemTestcase.findMany()

  const tagNames = [
    'If Statement',
    'Iteration',
    'Brute Force',
    'DFS',
    'Dynamic Programming',
    'Binary Search',
    'Graph'
  ]

  const tags: Tag[] = []

  // add tags
  for (const name of tagNames) {
    tags.push(
      await prisma.tag.create({
        data: {
          name
        }
      })
    )
  }

  // allocate tags to each problem
  for (const [index, tag] of tags.entries()) {
    await prisma.problemTag.create({
      data: {
        problemId: problems[index].id,
        tagId: tag.id
      }
    })
  }
}

const createUpdateHistories = async () => {
  updateHistories.push(
    await prisma.updateHistory.create({
      data: {
        problemId: problems[0].id,
        updatedByid: superAdminUser.id,
        updatedFields: ['title'],
        updatedInfo: [
          {
            current: '정수 더하기',
            previous: '정수 더하기 previous',
            updatedField: 'title'
          }
        ]
      }
    })
  )

  updateHistories.push(
    await prisma.updateHistory.create({
      data: {
        problemId: problems[0].id,
        updatedByid: superAdminUser.id,
        updatedFields: ['description'],
        updatedInfo: [
          {
            current: '문제 설명',
            previous: '문제 설명 previous',
            updatedField: 'description'
          }
        ]
      }
    })
  )

  updateHistories.push(
    await prisma.updateHistory.create({
      data: {
        problemId: problems[0].id,
        updatedByid: superAdminUser.id,
        updatedFields: ['hint'],
        updatedInfo: [
          {
            current: '정수 더하기 힌트',
            previous: '정수 더하기 힌트 previous',
            updatedField: 'hint'
          }
        ]
      }
    })
  )

  await prisma.problem.update({
    where: { id: problems[0].id },
    data: {
      updateHistory: {
        connect: updateHistories.map((updateHistory) => ({
          id: updateHistory.id
        }))
      }
    }
  })
}

const createContests = async () => {
  const contestData: {
    data: {
      title: string
      description: string
      createdById: number
      posterUrl: string | null
      summary: Prisma.InputJsonValue
      startTime: Date
      endTime: Date
      registerDueTime: Date
      freezeTime: Date | null
      invitationCode: string | null
      evaluateWithSampleTestcase: boolean
      enableCopyPaste: boolean
    }
  }[] = [
    // Ongoing Contests
    {
      data: {
        title: 'SKKU Coding Platform 모의대회',
        description: `<p>
  대통령은 내란 또는 외환의 죄를 범한 경우를 제외하고는 재직중 형사상의 소추를
  받지 아니한다. 모든 국민은 자기의 행위가 아닌 친족의 행위로 인하여 불이익한
  처우를 받지 아니한다.
</p>

<p>
  위원은 탄핵 또는 금고 이상의 형의 선고에 의하지 아니하고는 파면되지 아니한다.
  대통령은 국무회의의 의장이 되고, 국무총리는 부의장이 된다. 모든 국민은 헌법과
  법률이 정한 법관에 의하여 법률에 의한 재판을 받을 권리를 가진다.
</p>

<p>
  국회의원은 현행범인인 경우를 제외하고는 회기중 국회의 동의없이 체포 또는
  구금되지 아니한다. 헌법재판소의 장은 국회의 동의를 얻어 재판관중에서 대통령이
  임명한다.
</p>

<p>
  국가는 지역간의 균형있는 발전을 위하여 지역경제를 육성할 의무를 진다. 제3항의
  승인을 얻지 못한 때에는 그 처분 또는 명령은 그때부터 효력을 상실한다. 이 경우
  그 명령에 의하여 개정 또는 폐지되었던 법률은 그 명령이 승인을 얻지 못한 때부터
  당연히 효력을 회복한다.
</p>

<p>
  모든 국민은 신체의 자유를 가진다. 누구든지 법률에 의하지 아니하고는
  체포·구속·압수·수색 또는 심문을 받지 아니하며, 법률과 적법한 절차에 의하지
  아니하고는 처벌·보안처분 또는 강제노역을 받지 아니한다.
</p>`,
        createdById: superAdminUser.id,
        posterUrl: null,
        summary: {
          참여대상: '성균관대 재학생이라면 누구나',
          진행방식: '온라인으로 진행',
          순위산정: '맞춘 문제 수와 penalty로 산정',
          문제형태: '이러한 방식으로 출제될 거에요',
          참여혜택: '참가자 전원 스타벅스 기프티콘 증정'
        },
        startTime: new Date('2024-01-01T00:00:00.000Z'),
        endTime: new Date('2028-01-01T23:59:59.000Z'),
        registerDueTime: new Date('2023-12-31T00:00:00.000Z'),
        freezeTime: null,
        invitationCode: '123456',
        enableCopyPaste: true,
        evaluateWithSampleTestcase: false
      }
    },
    {
      data: {
        title: '24년도 소프트웨어학과 신입생 입학 테스트1',
        description: '<p>이 대회는 현재 진행 중입니다 !</p>',
        createdById: superAdminUser.id,
        posterUrl: null,
        summary: {
          참여대상: '성균관대학교 24학번 신입생',
          진행방식: '강의실에서 오프라인으로 진행',
          순위산정: '맞춘 문제 수와 penalty를 종합하여 순위 산출',
          참여혜택: '1등 10만원 / 2등 3만원'
        },
        startTime: new Date('2024-01-01T00:00:00.000Z'),
        endTime: new Date('2028-01-01T23:59:59.000Z'),
        registerDueTime: new Date('2023-12-31T00:00:00.000Z'),
        freezeTime: null,
        invitationCode: null,
        enableCopyPaste: true,
        evaluateWithSampleTestcase: false
      }
    },
    {
      data: {
        title: '24년도 소프트웨어학과 신입생 입학 테스트2',
        description: '<p>이 대회는 현재 진행 중입니다 !</p>',
        createdById: superAdminUser.id,
        posterUrl: null,
        summary: {
          참여대상: '성균관대학교 24학번 신입생',
          진행방식: '강의실에서 오프라인으로 진행',
          문제형태: '문제 형태가 다음과 같습니다.',
          참여혜택: '1등 10만원 / 2등 3만원'
        },
        startTime: new Date('2024-01-01T00:00:00.000Z'),
        endTime: new Date('2028-01-01T23:59:59.000Z'),
        registerDueTime: new Date('2023-12-31T00:00:00.000Z'),
        freezeTime: null,
        invitationCode: '123456',
        enableCopyPaste: true,
        evaluateWithSampleTestcase: false
      }
    },
    {
      data: {
        title: '24년도 소프트웨어학과 신입생 입학 테스트3',
        description: '<p>이 대회는 현재 진행 중입니다 !</p>',
        createdById: superAdminUser.id,
        posterUrl: null,
        summary: {
          참여대상: '성균관대학교 24학번 신입생',
          진행방식: '강의실에서 오프라인으로 진행',
          순위산정: '맞춘 문제 수와 penalty를 종합하여 순위 산출',
          문제형태: '문제 형식은 다음과 같습니다.'
        },
        startTime: new Date('2024-01-01T00:00:00.000Z'),
        endTime: new Date('2028-01-01T23:59:59.000Z'),
        registerDueTime: new Date('2023-12-31T00:00:00.000Z'),
        freezeTime: null,
        invitationCode: null,
        enableCopyPaste: true,
        evaluateWithSampleTestcase: false
      }
    },
    {
      data: {
        title: '24년도 아늑배 스파게티 코드 만들기 대회',
        description: '<p>이 대회는 현재 진행 중입니다 ! (private group)</p>',
        createdById: superAdminUser.id,
        posterUrl: null,
        summary: {
          참여대상: '소프트웨어학과 원전공/복수전공',
          진행방식: '삼성학술정보관 지하1층에서 오프라인 진행',
          순위산정: '맞춘 문제 수와 penalty를 기준으로 순위 산출',
          문제형태: '문제 형식은 다음과 같습니다.',
          참여혜택: '1등 총장상 + 50만원 / 2등 20만원 / 3등 15만원'
        },
        startTime: new Date('2024-01-01T00:00:00.000Z'),
        endTime: new Date('2028-01-01T23:59:59.000Z'),
        registerDueTime: new Date('2023-12-31T00:00:00.000Z'),
        freezeTime: null,
        invitationCode: null,
        enableCopyPaste: true,
        evaluateWithSampleTestcase: false
      }
    },
    // Finished Contests
    {
      data: {
        title: 'Long Time Ago Assignment',
        description: '<p>이 대회는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        posterUrl: null,
        summary: {
          참여대상: '소프트웨어학과 원전공생',
          진행방식: '온라인 진행',
          참여혜택: '1~3등에게 상위 대회 출전 자격 부여'
        },
        startTime: new Date('2023-06-01T10:00:00.000Z'),
        endTime: new Date('2023-06-01T13:00:00.000Z'),
        registerDueTime: new Date('2023-05-31T23:59:59.000Z'),
        freezeTime: null,
        invitationCode: '123456',
        enableCopyPaste: true,
        evaluateWithSampleTestcase: false
      }
    },
    {
      data: {
        title: '23년도 소프트웨어학과 신입생 입학 테스트',
        description: '<p>이 대회는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        posterUrl: null,
        summary: {
          참여대상: '소프트웨어학과 23학번',
          진행방식: '온라인 진행',
          순위산정: '맞춘 문제 수를 기준으로 순위를 선정한다.',
          문제형태: '1번 문제: / 2번 문제: / 3번 문제: ',
          참여혜택: '문제를 모두 맞춘 학생에게 격려금 지원'
        },
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        registerDueTime: new Date('2022-12-31T00:00:00.000Z'),
        freezeTime: null,
        invitationCode: '123456',
        enableCopyPaste: true,
        evaluateWithSampleTestcase: false
      }
    },
    {
      data: {
        title: '소프트의 아침',
        description: '<p>이 대회는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        posterUrl: null,
        summary: {
          참여대상: '소프트웨어학과 원전공/복수전공',
          진행방식: '온라인 진행',
          순위산정: '맞춘 문제 수와 penalty를 기준으로 순위 산출',
          문제형태: '문제 형식은 다음과 같습니다.',
          참여혜택: '1등 10만원 / 2등 5만원 / 3등 3만원 상당 기프티콘'
        },
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        registerDueTime: new Date('2022-12-31T00:00:00.000Z'),
        freezeTime: null,
        invitationCode: '123456',
        enableCopyPaste: true,
        evaluateWithSampleTestcase: false
      }
    },
    {
      data: {
        title: '소프트의 낮',
        description: '<p>이 대회는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        posterUrl: null,
        summary: {
          참여대상: '소프트웨어학과 원전공/복수전공',
          진행방식: '온라인 진행',
          순위산정: '맞춘 문제 수와 penalty를 기준으로 순위 산출',
          문제형태: '문제 형식은 다음과 같습니다.'
        },
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        registerDueTime: new Date('2022-12-31T00:00:00.000Z'),
        freezeTime: null,
        invitationCode: '123456',
        enableCopyPaste: true,
        evaluateWithSampleTestcase: false
      }
    },
    {
      data: {
        title: '소프트의 밤',
        description: '<p>이 대회는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        posterUrl: null,
        summary: {
          참여대상: '소프트웨어학과 원전공/복수전공',
          진행방식: '온라인 진행',
          순위산정: '맞춘 문제 수와 penalty를 기준으로 순위 산출',
          문제형태: '문제 형식은 다음과 같습니다.'
        },
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        registerDueTime: new Date('2022-12-31T00:00:00.000Z'),
        freezeTime: null,
        invitationCode: '123456',
        enableCopyPaste: true,
        evaluateWithSampleTestcase: false
      }
    },
    {
      data: {
        title: '2023 SKKU 프로그래밍 대회',
        description: '<p>이 대회는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        posterUrl: null,
        summary: {
          참여대상: '소프트웨어학과 원전공/복수전공',
          진행방식: '온라인 진행',
          순위산정: '맞춘 문제 수와 penalty를 기준으로 순위 산출',
          문제형태: '문제 형식은 다음과 같습니다.'
        },
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        registerDueTime: new Date('2022-12-31T00:00:00.000Z'),
        freezeTime: null,
        invitationCode: '123456',
        enableCopyPaste: true,
        evaluateWithSampleTestcase: false
      }
    },
    {
      data: {
        title: '소프트의 오전',
        description: '<p>이 대회는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        posterUrl: null,
        summary: {
          참여대상: '소프트웨어학과 원전공/복수전공',
          진행방식: '온라인 진행',
          순위산정: '맞춘 문제 수와 penalty를 기준으로 순위 산출',
          문제형태: '문제 형식은 다음과 같습니다.'
        },
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        registerDueTime: new Date('2022-12-31T00:00:00.000Z'),
        freezeTime: null,
        invitationCode: '123456',
        enableCopyPaste: true,
        evaluateWithSampleTestcase: false
      }
    },
    {
      data: {
        title: '소프트의 오후',
        description: '<p>이 대회는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        posterUrl: null,
        summary: {
          참여대상: '소프트웨어학과 원전공/복수전공',
          진행방식: '온라인 진행',
          순위산정: '맞춘 문제 수와 penalty를 기준으로 순위 산출',
          문제형태: '문제 형식은 다음과 같습니다.',
          참여혜택: '1등 10만원 / 2등 5만원 / 3등 3만원 상당 기프티콘'
        },
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        registerDueTime: new Date('2022-12-31T00:00:00.000Z'),
        freezeTime: null,
        invitationCode: null,
        enableCopyPaste: true,
        evaluateWithSampleTestcase: false
      }
    },
    {
      data: {
        title: '23년도 아늑배 스파게티 코드 만들기 대회',
        description: '<p>이 대회는 오래 전에 끝났어요 (private group)</p>',
        createdById: superAdminUser.id,
        posterUrl: null,
        summary: {
          참여대상: '소프트웨어학과 원전공/복수전공',
          진행방식: '온라인 진행',
          순위산정: '맞춘 문제 수와 penalty를 기준으로 순위 산출',
          문제형태: '문제 형식은 다음과 같습니다.'
        },
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        registerDueTime: new Date('2022-12-31T00:00:00.000Z'),
        freezeTime: null,
        invitationCode: null,
        enableCopyPaste: true,
        evaluateWithSampleTestcase: false
      }
    },
    // Upcoming Contests
    {
      data: {
        title: 'Future Assignment',
        description: '<p>이 대회는 언젠가 열리겠죠...?</p>',
        createdById: superAdminUser.id,
        posterUrl: null,
        summary: {
          참여대상: '소프트웨어학과 원전공/복수전공',
          진행방식: '온라인 진행 예정...?',
          순위산정: '맞춘 문제 수와 penalty를 기준으로 순위 산출',
          문제형태: '문제 형식은 다음과 같습니다.'
        },
        startTime: new Date('2034-01-01T00:00:00.000Z'),
        endTime: new Date('2035-01-01T23:59:59.000Z'),
        registerDueTime: new Date('2034-12-31T00:00:00.000Z'),
        freezeTime: null,
        invitationCode: '123456',
        enableCopyPaste: true,
        evaluateWithSampleTestcase: false
      }
    },
    {
      data: {
        title: '2024 SKKU 프로그래밍 대회',
        description: '<p>이 대회는 언젠가 열리겠죠...?</p>',
        createdById: superAdminUser.id,
        posterUrl: null,
        summary: {
          참여대상: '소프트웨어학과 원전공/복수전공',
          진행방식: '온라인 진행 예정...?',
          순위산정: '맞춘 문제 수와 penalty를 기준으로 순위 산출',
          문제형태: '문제 형식은 다음과 같습니다.'
        },
        startTime: new Date('2034-01-01T00:00:00.000Z'),
        endTime: new Date('2035-01-01T23:59:59.000Z'),
        registerDueTime: new Date('2034-12-31T00:00:00.000Z'),
        freezeTime: null,
        invitationCode: '123456',
        enableCopyPaste: true,
        evaluateWithSampleTestcase: false
      }
    },
    {
      data: {
        title: '2024 스꾸딩 프로그래밍 대회',
        description: '<p>이 대회는 언젠가 열리겠죠...?</p>',
        createdById: superAdminUser.id,
        posterUrl: null,
        summary: {
          참여대상: '소프트웨어학과 원전공/복수전공',
          진행방식: '온라인 진행 예정...?',
          순위산정: '맞춘 문제 수와 penalty를 기준으로 순위 산출',
          참여혜택: '1등 10만원 / 2등 5만원 / 3등 3만원 상당 기프티콘'
        },
        startTime: new Date('2034-01-01T00:00:00.000Z'),
        endTime: new Date('2035-01-01T23:59:59.000Z'),
        registerDueTime: new Date('2034-12-31T00:00:00.000Z'),
        freezeTime: null,
        invitationCode: '123456',
        enableCopyPaste: true,
        evaluateWithSampleTestcase: false
      }
    },
    {
      data: {
        title: '25년도 아늑배 스파게티 코드 만들기 대회',
        description: '<p>이 대회는 언젠가 열리겠죠...? (private group)</p>',
        createdById: superAdminUser.id,
        posterUrl: null,
        summary: {
          참여대상: '소프트웨어학과 원전공/복수전공',
          진행방식: '온라인 진행 예정...?',
          순위산정: '맞춘 문제 수와 penalty를 기준으로 순위 산출',
          참여혜택: '1등 10만원 / 2등 5만원 / 3등 3만원 상당 기프티콘'
        },
        startTime: new Date('2034-01-01T00:00:00.000Z'),
        endTime: new Date('2035-01-01T23:59:59.000Z'),
        registerDueTime: new Date('2034-12-31T00:00:00.000Z'),
        freezeTime: null,
        invitationCode: null,
        enableCopyPaste: true,
        evaluateWithSampleTestcase: false
      }
    },
    {
      data: {
        title: '2025 SKKU 프로그래밍 대회',
        description: '<p>이 대회는 언젠가 열리겠죠...?</p>',
        createdById: contestAdminUser.id,
        posterUrl: null,
        summary: {
          참여대상: '소프트웨어학과 원전공/복수전공',
          진행방식: '온라인 진행 예정...?',
          순위산정: '맞춘 문제 수와 penalty를 기준으로 순위 산출',
          문제형태: '문제 형식은 다음과 같습니다.'
        },
        startTime: new Date('2034-01-01T00:00:00.000Z'),
        endTime: new Date('2035-01-01T23:59:59.000Z'),
        registerDueTime: new Date('2034-12-31T00:00:00.000Z'),
        freezeTime: null,
        invitationCode: '123456',
        enableCopyPaste: true,
        evaluateWithSampleTestcase: false
      }
    },
    {
      data: {
        title: '2025 SKKU 프로그래밍 대회',
        description: '<p>sample testcase 확인을 위한 대회</p>',
        createdById: contestAdminUser.id,
        posterUrl: null,
        summary: {
          참여대상: '소프트웨어학과 원전공/복수전공',
          진행방식: '온라인 진행 예정...?',
          순위산정: '맞춘 문제 수와 penalty를 기준으로 순위 산출',
          문제형태: '문제 형식은 다음과 같습니다.'
        },
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2035-01-01T23:59:59.000Z'),
        registerDueTime: new Date('2022-12-31T00:00:00.000Z'),
        freezeTime: new Date('2034-01-01T00:00:00.000Z'),
        invitationCode: null,
        enableCopyPaste: true,
        evaluateWithSampleTestcase: true
      }
    }
  ]

  const now = new Date()
  for (const obj of contestData) {
    const contest = await prisma.contest.create({
      data: obj.data
    })
    contests.push(contest)
    if (obj.data.startTime > now) {
      upcomingContests.push(contest)
    } else {
      if (obj.data.endTime < now) {
        endedContests.push(contest)
      } else {
        ongoingContests.push(contest)
      }
    }
  }

  // add problem 1, 2 to ongoing contest
  for (const contest of ongoingContests) {
    for (const [index, problem] of problems.slice(0, 2).entries()) {
      await prisma.contestProblem.create({
        data: {
          order: index,
          contestId: contest.id,
          problemId: problem.id,
          score: problem.id * 10
        }
      })
    }
  }

  // add problem 3, 4 to upcoming contest
  for (const contest of upcomingContests) {
    for (const [index, problem] of problems.slice(2, 4).entries()) {
      await prisma.contestProblem.create({
        data: {
          order: index,
          contestId: contest.id,
          problemId: problem.id,
          score: problem.id * 10
        }
      })
    }
  }
  // add problem 5, 6, 7, 8 to ended contest
  for (const contest of endedContests) {
    for (const [index, problem] of problems.slice(4, 8).entries()) {
      await prisma.contestProblem.create({
        data: {
          order: index,
          contestId: contest.id,
          problemId: problem.id,
          score: problem.id * 10
        }
      })
    }
  }

  // add problem 1, 2, 3 to contest 6 (contests[5])
  if (contests.length > 5) {
    const contest6 = contests[5]
    for (const [index, problem] of problems.slice(0, 3).entries()) {
      await prisma.contestProblem.create({
        data: {
          order: index + 2, // 문제 5, 6이 order 0, 1이므로 2, 3, 4
          contestId: contest6.id,
          problemId: problem.id,
          score: problem.id * 10
        }
      })
    }
  }

  // TODO: add records and ranks
}

const createAssignments = async () => {
  const assignmentData: {
    data: {
      title: string
      description: string
      createdById: number
      groupId: number
      startTime: Date
      endTime: Date
      dueTime: Date
      isVisible: boolean
      isRankVisible: boolean
      enableCopyPaste: boolean
    }
  }[] = [
    // Ongoing Assignments
    {
      data: {
        title: 'SKKU Coding Platform 모의과제',
        description: `<p>
  대통령은 내란 또는 외환의 죄를 범한 경우를 제외하고는 재직중 형사상의 소추를
  받지 아니한다. 모든 국민은 자기의 행위가 아닌 친족의 행위로 인하여 불이익한
  처우를 받지 아니한다.
</p>

<p>
  위원은 탄핵 또는 금고 이상의 형의 선고에 의하지 아니하고는 파면되지 아니한다.
  대통령은 국무회의의 의장이 되고, 국무총리는 부의장이 된다. 모든 국민은 헌법과
  법률이 정한 법관에 의하여 법률에 의한 재판을 받을 권리를 가진다.
</p>

<p>
  국회의원은 현행범인인 경우를 제외하고는 회기중 국회의 동의없이 체포 또는
  구금되지 아니한다. 헌법재판소의 장은 국회의 동의를 얻어 재판관중에서 대통령이
  임명한다.
</p>

<p>
  국가는 지역간의 균형있는 발전을 위하여 지역경제를 육성할 의무를 진다. 제3항의
  승인을 얻지 못한 때에는 그 처분 또는 명령은 그때부터 효력을 상실한다. 이 경우
  그 명령에 의하여 개정 또는 폐지되었던 법률은 그 명령이 승인을 얻지 못한 때부터
  당연히 효력을 회복한다.
</p>

<p>
  모든 국민은 신체의 자유를 가진다. 누구든지 법률에 의하지 아니하고는
  체포·구속·압수·수색 또는 심문을 받지 아니하며, 법률과 적법한 절차에 의하지
  아니하고는 처벌·보안처분 또는 강제노역을 받지 아니한다.
</p>`,
        createdById: superAdminUser.id,
        groupId: privateGroup1.id,
        startTime: new Date('2024-01-01T00:00:00.000Z'),
        endTime: new Date('2028-01-01T23:59:59.000Z'),
        dueTime: new Date('2026-01-01T23:59:59.000Z'),
        isVisible: true,
        isRankVisible: true,
        enableCopyPaste: true
      }
    },
    {
      data: {
        title: '24년도 소프트웨어학과 신입생 입학 과제1',
        description: '<p>이 과제는 현재 진행 중입니다 !</p>',
        createdById: superAdminUser.id,
        groupId: privateGroup1.id,
        startTime: new Date('2024-01-01T00:00:00.000Z'),
        endTime: new Date('2028-01-01T23:59:59.000Z'),
        dueTime: new Date('2026-01-01T23:59:59.000Z'),
        isVisible: true,
        isRankVisible: true,
        enableCopyPaste: true
      }
    },
    {
      data: {
        title: '24년도 소프트웨어학과 신입생 입학 과제2',
        description: '<p>이 과제는 현재 진행 중입니다 !</p>',
        createdById: superAdminUser.id,
        groupId: privateGroup1.id,
        startTime: new Date('2024-01-01T00:00:00.000Z'),
        endTime: new Date('2028-01-01T23:59:59.000Z'),
        dueTime: new Date('2026-01-01T23:59:59.000Z'),
        isVisible: true,
        isRankVisible: true,
        enableCopyPaste: true
      }
    },
    {
      data: {
        title: '24년도 소프트웨어학과 신입생 입학 과제3',
        description: '<p>이 과제는 현재 진행 중입니다 !</p>',
        createdById: superAdminUser.id,
        groupId: privateGroup1.id,
        startTime: new Date('2024-01-01T00:00:00.000Z'),
        endTime: new Date('2028-01-01T23:59:59.000Z'),
        dueTime: new Date('2026-01-01T23:59:59.000Z'),
        isVisible: true,
        isRankVisible: true,
        enableCopyPaste: true
      }
    },
    {
      data: {
        title: '24년도 아늑배 스파게티 코드 만들기 과제',
        description: '<p>이 과제는 현재 진행 중입니다 ! (private group)</p>',
        createdById: superAdminUser.id,
        groupId: privateGroup2.id,
        startTime: new Date('2024-01-01T00:00:00.000Z'),
        endTime: new Date('2028-01-01T23:59:59.000Z'),
        dueTime: new Date('2026-01-01T23:59:59.000Z'),
        isVisible: true,
        isRankVisible: true,
        enableCopyPaste: true
      }
    },
    // Finished Assignments
    {
      data: {
        title: 'Long Time Ago Assignment',
        description: '<p>이 과제는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        groupId: privateGroup1.id,
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        dueTime: new Date('2024-01-01T23:59:59.000Z'),
        isVisible: true,
        isRankVisible: false,
        enableCopyPaste: true
      }
    },
    {
      data: {
        title: '23년도 소프트웨어학과 신입생 입학 과제',
        description: '<p>이 과제는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        groupId: privateGroup1.id,
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        dueTime: new Date('2024-01-01T23:59:59.000Z'),
        isVisible: true,
        isRankVisible: true,
        enableCopyPaste: true
      }
    },
    {
      data: {
        title: '소프트의 아침과제',
        description: '<p>이 과제는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        groupId: privateGroup1.id,
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        dueTime: new Date('2024-01-01T23:59:59.000Z'),
        isVisible: true,
        isRankVisible: false,
        enableCopyPaste: true
      }
    },
    {
      data: {
        title: '소프트의 낮과제',
        description: '<p>이 과제는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        groupId: privateGroup1.id,
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        dueTime: new Date('2024-01-01T23:59:59.000Z'),
        isVisible: true,
        isRankVisible: false,
        enableCopyPaste: true
      }
    },
    {
      data: {
        title: '소프트의 밤과제',
        description: '<p>이 과제는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        groupId: privateGroup1.id,
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        dueTime: new Date('2024-01-01T23:59:59.000Z'),
        isVisible: true,
        isRankVisible: false,
        enableCopyPaste: true
      }
    },
    {
      data: {
        title: '2023 SKKU 프로그래밍 과제',
        description: '<p>이 과제는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        groupId: privateGroup1.id,
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        dueTime: new Date('2024-01-01T23:59:59.000Z'),
        isVisible: true,
        isRankVisible: false,
        enableCopyPaste: true
      }
    },
    {
      data: {
        title: '소프트의 오전과제',
        description: '<p>이 과제는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        groupId: privateGroup1.id,
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        dueTime: new Date('2024-01-01T23:59:59.000Z'),
        isVisible: true,
        isRankVisible: false,
        enableCopyPaste: true
      }
    },
    {
      data: {
        title: '소프트의 오후과제',
        description: '<p>이 과제는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        groupId: privateGroup1.id,
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        dueTime: new Date('2024-01-01T23:59:59.000Z'),
        isVisible: true,
        isRankVisible: false,
        enableCopyPaste: true
      }
    },
    {
      data: {
        title: '23년도 아늑배 스파게티 코드 만들기 과제',
        description: '<p>이 과제는 오래 전에 끝났어요 (private group)</p>',
        createdById: superAdminUser.id,
        groupId: privateGroup2.id,
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        dueTime: new Date('2024-01-01T23:59:59.000Z'),
        isVisible: true,
        isRankVisible: true,
        enableCopyPaste: true
      }
    },
    // Upcoming Assignments
    {
      data: {
        title: 'Future Assignment',
        description: '<p>이 과제는 언젠가 열리겠죠...?</p>',
        createdById: superAdminUser.id,
        groupId: privateGroup1.id,
        startTime: new Date('2034-01-01T00:00:00.000Z'),
        endTime: new Date('2035-01-01T23:59:59.000Z'),
        dueTime: new Date('2035-01-01T23:59:59.000Z'),
        isVisible: true,
        isRankVisible: true,
        enableCopyPaste: true
      }
    },
    {
      data: {
        title: '2024 SKKU 프로그래밍 과제',
        description: '<p>이 과제는 언젠가 열리겠죠...?</p>',
        createdById: superAdminUser.id,
        groupId: privateGroup1.id,
        startTime: new Date('2034-01-01T00:00:00.000Z'),
        endTime: new Date('2035-01-01T23:59:59.000Z'),
        dueTime: new Date('2035-01-01T23:59:59.000Z'),
        isVisible: true,
        isRankVisible: true,
        enableCopyPaste: true
      }
    },
    {
      data: {
        title: '2024 스꾸딩 프로그래밍 과제',
        description:
          '<p>이 과제는 언젠가 열리겠죠...? isVisible이 false인 assignment입니다</p>',
        createdById: superAdminUser.id,
        groupId: privateGroup1.id,
        startTime: new Date('2034-01-01T00:00:00.000Z'),
        endTime: new Date('2035-01-01T23:59:59.000Z'),
        dueTime: new Date('2035-01-01T23:59:59.000Z'),
        isVisible: false,
        isRankVisible: true,
        enableCopyPaste: true
      }
    },
    {
      data: {
        title: '25년도 아늑배 스파게티 코드 만들기 과제',
        description: '<p>이 과제는 언젠가 열리겠죠...? (private group)</p>',
        createdById: superAdminUser.id,
        groupId: privateGroup2.id,
        startTime: new Date('2034-01-01T00:00:00.000Z'),
        endTime: new Date('2035-01-01T23:59:59.000Z'),
        dueTime: new Date('2035-01-01T23:59:59.000Z'),
        isVisible: true,
        isRankVisible: true,
        enableCopyPaste: true
      }
    }
  ]

  const now = new Date()
  for (const obj of assignmentData) {
    const assignment = await prisma.assignment.create(obj)
    assignments.push(assignment)
    if (now < obj.data.startTime) {
      upcomingAssignments.push(assignment)
    } else if (obj.data.endTime < now) {
      endedAssignments.push(assignment)
    } else {
      ongoingAssignments.push(assignment)
    }
  }

  // add problems to ongoing assignment
  for (const problem of problems.slice(0, 3)) {
    await prisma.assignmentProblem.create({
      data: {
        order: problem.id - 1,
        assignmentId: ongoingAssignments[0].id,
        problemId: problem.id,
        score: problem.id * 10
      }
    })
    await prisma.problem.update({
      where: {
        id: problem.id
      },
      data: {
        sharedGroups: {
          connect: [{ id: ongoingAssignments[0].groupId }]
        }
      }
    })
  }

  // add problems to finished assignment
  for (const problem of problems.slice(3, 5)) {
    await prisma.assignmentProblem.create({
      data: {
        order: problem.id - 1,
        assignmentId: endedAssignments[0].id,
        problemId: problem.id,
        score: problem.id * 10
      }
    })
    await prisma.problem.update({
      where: {
        id: problem.id
      },
      data: {
        sharedGroups: {
          connect: [{ id: endedAssignments[0].groupId }]
        }
      }
    })
  }

  // TODO: add records and ranks
}

const createWorkbooks = async () => {
  for (let i = 1; i <= 3; i++) {
    workbooks.push(
      await prisma.workbook.create({
        data: {
          title: '모의대회 문제집',
          description: '모의대회 문제들을 모아뒀습니다!',
          createdById: superAdminUser.id,
          groupId: privateGroup1.id
        }
      })
    )
  }
  for (let i = 1; i <= 3; i++) {
    privateWorkbooks.push(
      await prisma.workbook.create({
        data: {
          title: '모의대회 문제집',
          description: '모의대회 문제들을 모아뒀습니다!',
          createdById: superAdminUser.id,
          groupId: privateGroup2.id
        }
      })
    )
  }

  for (const problem of problems) {
    await prisma.workbookProblem.create({
      data: {
        order: problem.id - 1,
        workbookId: workbooks[0].id,
        problemId: problem.id
      }
    })
    await prisma.workbookProblem.create({
      data: {
        order: problem.id - 1,
        workbookId: privateWorkbooks[0].id,
        problemId: problem.id
      }
    })
  }
}

const createSubmissions = async () => {
  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[0].id,
        problemId: problems[0].id,
        contestId: ongoingContests[0].id,
        code: [
          {
            id: 1,
            locked: false,
            text: `#include <stdio.h>
int main(void) {
    printf("Hello, World!\n");
    return 0;
}`
          }
        ],
        language: Language.C,
        result: ResultStatus.Judging
      }
    })
  )

  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[0].id,
      result: ResultStatus.Accepted,
      output: '2\n',
      cpuTime: 12345,
      memoryUsage: 12345
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[submissions.length - 1].id
    },
    data: { result: ResultStatus.Accepted }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[1].id,
        problemId: problems[1].id,
        contestId: ongoingContests[0].id,
        code: [
          {
            id: 1,
            locked: false,
            text: `#include <iostream>
int main(void) {
    std::cout << "Hello, World!" << endl;
    return 0;
}`
          }
        ],
        language: Language.Cpp,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[1].id,
      result: ResultStatus.WrongAnswer,
      output: '99999\n',
      cpuTime: 12345,
      memoryUsage: 12345
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[submissions.length - 1].id
    },
    data: { result: ResultStatus.WrongAnswer }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[2].id,
        problemId: problems[2].id,
        contestId: ongoingContests[0].id,
        code: [
          {
            id: 1,
            locked: false,
            text: `class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`
          }
        ],
        language: Language.Java,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[2].id,
      result: ResultStatus.CompileError
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[submissions.length - 1].id
    },
    data: { result: ResultStatus.CompileError }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[3].id,
        problemId: problems[3].id,
        contestId: ongoingContests[0].id,
        code: [
          {
            id: 1,
            locked: false,
            text: `print("Hello, World!")`
          }
        ],
        language: Language.Python3,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[3].id,
      result: ResultStatus.RuntimeError,
      output: null,
      cpuTime: 12345,
      memoryUsage: 12345
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[submissions.length - 1].id
    },
    data: { result: ResultStatus.RuntimeError }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[4].id,
        problemId: problems[4].id,
        contestId: ongoingContests[0].id,
        code: [
          {
            id: 1,
            locked: false,
            text: `#include <stdio.h>
int main(void) {
    printf("Hello, World!\n");
    return 0;
}`
          }
        ],
        language: Language.C,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[4].id,
      result: ResultStatus.TimeLimitExceeded,
      output: null,
      cpuTime: 12345,
      memoryUsage: 12345
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[submissions.length - 1].id
    },
    data: { result: ResultStatus.TimeLimitExceeded }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[0].id,
        problemId: problems[0].id,
        assignmentId: ongoingAssignments[0].id,
        code: [
          {
            id: 1,
            locked: false,
            text: `#include <stdio.h>
int main(void) {
    printf("Hello, World!\n");
    return 0;
}`
          }
        ],
        language: Language.C,
        result: ResultStatus.Judging
      }
    })
  )

  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[0].id,
      result: ResultStatus.Accepted,
      output: '2\n',
      cpuTime: 12345,
      memoryUsage: 12345
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[submissions.length - 1].id
    },
    data: { result: ResultStatus.Accepted }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[1].id,
        problemId: problems[1].id,
        assignmentId: ongoingAssignments[0].id,
        code: [
          {
            id: 1,
            locked: false,
            text: `#include <iostream>
int main(void) {
    std::cout << "Hello, World!" << endl;
    return 0;
}`
          }
        ],
        language: Language.Cpp,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[1].id,
      result: ResultStatus.WrongAnswer,
      output: '99999\n',
      cpuTime: 12345,
      memoryUsage: 12345
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[submissions.length - 1].id
    },
    data: { result: ResultStatus.WrongAnswer }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[2].id,
        problemId: problems[2].id,
        assignmentId: ongoingAssignments[0].id,
        code: [
          {
            id: 1,
            locked: false,
            text: `class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`
          }
        ],
        language: Language.Java,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[2].id,
      result: ResultStatus.CompileError
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[submissions.length - 1].id
    },
    data: { result: ResultStatus.CompileError }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[3].id,
        problemId: problems[3].id,
        assignmentId: ongoingAssignments[0].id,
        code: [
          {
            id: 1,
            locked: false,
            text: `print("Hello, World!")`
          }
        ],
        language: Language.Python3,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[3].id,
      result: ResultStatus.RuntimeError,
      output: null,
      cpuTime: 12345,
      memoryUsage: 12345
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[submissions.length - 1].id
    },
    data: { result: ResultStatus.RuntimeError }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[4].id,
        problemId: problems[4].id,
        assignmentId: ongoingAssignments[0].id,
        code: [
          {
            id: 1,
            locked: false,
            text: `#include <stdio.h>
int main(void) {
    printf("Hello, World!\n");
    return 0;
}`
          }
        ],
        language: Language.C,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[4].id,
      result: ResultStatus.TimeLimitExceeded,
      output: null,
      cpuTime: 12345,
      memoryUsage: 12345
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[submissions.length - 1].id
    },
    data: { result: ResultStatus.TimeLimitExceeded }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[1].id,
        problemId: problems[1].id,
        assignmentId: ongoingAssignments[0].id,
        code: [
          {
            id: 1,
            locked: false,
            text: `#include <iostream>\nusing namespace std;\nint main(){ cout << 42 << endl; return 0; }`
          }
        ],
        language: Language.Cpp,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[1].id,
      result: ResultStatus.Accepted,
      output: '42\n'
    }
  })
  await prisma.submission.update({
    where: { id: submissions[submissions.length - 1].id },
    data: { result: ResultStatus.Accepted }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[2].id,
        problemId: problems[2].id,
        assignmentId: ongoingAssignments[0].id,
        code: [
          {
            id: 1,
            locked: false,
            text: `class Main { public static void main(String[] args){ System.out.println(7); } }`
          }
        ],
        language: Language.Java,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[2].id,
      result: ResultStatus.Accepted,
      output: '7\n'
    }
  })
  await prisma.submission.update({
    where: { id: submissions[submissions.length - 1].id },
    data: { result: ResultStatus.Accepted }
  })

  if (endedAssignments.length > 0) {
    const endedId = endedAssignments[0].id
    submissions.push(
      await prisma.submission.create({
        data: {
          userId: users[0].id,
          problemId: problems[3].id,
          assignmentId: endedId,
          code: [{ id: 1, locked: false, text: `print(1+1)` }],
          language: Language.Python3,
          result: ResultStatus.Judging
        }
      })
    )
    await prisma.submissionResult.create({
      data: {
        submissionId: submissions[submissions.length - 1].id,
        problemTestcaseId: problemTestcases[3].id,
        result: ResultStatus.Accepted,
        output: '2\n'
      }
    })
    await prisma.submission.update({
      where: { id: submissions[submissions.length - 1].id },
      data: { result: ResultStatus.Accepted }
    })

    submissions.push(
      await prisma.submission.create({
        data: {
          userId: users[1].id,
          problemId: problems[4].id,
          assignmentId: endedId,
          code: [
            {
              id: 1,
              locked: false,
              text: `#include <stdio.h>\nint main(){ printf("OK\\n"); return 0; }`
            }
          ],
          language: Language.C,
          result: ResultStatus.Judging
        }
      })
    )
    await prisma.submissionResult.create({
      data: {
        submissionId: submissions[submissions.length - 1].id,
        problemTestcaseId: problemTestcases[4].id,
        result: ResultStatus.Accepted,
        output: 'OK\n'
      }
    })
    await prisma.submission.update({
      where: { id: submissions[submissions.length - 1].id },
      data: { result: ResultStatus.Accepted }
    })
  }

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[5].id,
        problemId: problems[5].id,
        workbookId: workbooks[0].id,
        code: [
          {
            id: 1,
            locked: false,
            text: `#include <iostream>
int main(void) {
    std::cout << "Hello, World!" << endl;
    return 0;
}`
          }
        ],
        language: Language.Cpp,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[5].id,
      result: ResultStatus.MemoryLimitExceeded,
      output: null,
      cpuTime: 12345,
      memoryUsage: 12345
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[submissions.length - 1].id
    },
    data: { result: ResultStatus.MemoryLimitExceeded }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[6].id,
        problemId: problems[6].id,
        workbookId: workbooks[0].id,
        code: [
          {
            id: 1,
            locked: false,
            text: `print("Hello, World!")`
          }
        ],
        language: Language.Python3,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[6].id,
      result: ResultStatus.OutputLimitExceeded,
      output: null,
      cpuTime: 12345,
      memoryUsage: 12345
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[submissions.length - 1].id
    },
    data: { result: ResultStatus.OutputLimitExceeded }
  })

  const checkSeeds = users.map(async (user) => {
    const newSubmission = await prisma.submission.create({
      data: {
        userId: user.id,
        problemId: problems[3].id,
        assignmentId: endedAssignments[0].id,
        code: [
          {
            id: 1,
            locked: false,
            text: `class Main {
  public static void main(String[] args) {
      System.out.println("Hello, World!");
  }
}`
          }
        ],
        language: Language.Java,
        result: ResultStatus.Judging
      }
    })
    submissions.push(newSubmission)

    await prisma.submissionResult.create({
      data: {
        submissionId: submissions[submissions.length - 1].id,
        problemTestcaseId: problemTestcases[2].id,
        result: ResultStatus.Accepted,
        output: 'Hello, World!\n',
        cpuTime: 12345,
        memoryUsage: 12345
      }
    })
    await prisma.submission.update({
      where: {
        id: newSubmission.id
      },
      data: { result: ResultStatus.Accepted }
    })
  })

  await Promise.all(checkSeeds)
}

const createAnnouncements = async () => {
  // For Contests
  for (let i = 0; i < 5; ++i) {
    contestAnnouncements.push(
      await prisma.announcement.create({
        data: {
          content: `Announcement(contest)_0_${i}`,
          contestId: ongoingContests[i].id
        }
      })
    )
  }

  for (let i = 0; i < 5; ++i) {
    contestAnnouncements.push(
      await prisma.announcement.create({
        data: {
          content: `Announcement(contest)_1_${i}...
아래 내용은 한글 Lorem Ipsum으로 생성된 내용입니다! 별 의미 없어요.
모든 국민은 신속한 재판을 받을 권리를 가진다. 형사피고인은 상당한 이유가 없는 한 지체없이 공개재판을 받을 권리를 가진다.
법관은 탄핵 또는 금고 이상의 형의 선고에 의하지 아니하고는 파면되지 아니하며, 징계처분에 의하지 아니하고는 정직·감봉 기타 불리한 처분을 받지 아니한다.
일반사면을 명하려면 국회의 동의를 얻어야 한다. 연소자의 근로는 특별한 보호를 받는다.`,
          contestId: ongoingContests[i].id,
          problemId: problems[i].id
        }
      })
    )
  }
}

  // contest 6 problem 5 (채권관계)
  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[0].id,
        problemId: problems[4].id,
        contestId: contests[5].id,
        createTime: new Date('2023-06-01T10:15:00.000Z'),
        code: [
          {
            id: 1,
            locked: false,
            text: 'n = int(input())\nprint(n * 2)'
          }
        ],
        language: Language.Python3,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[4].id,
      result: ResultStatus.Accepted,
      output: '10\n',
      cpuTime: 1234,
      memoryUsage: 5120
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[submissions.length - 1].id
    },
    data: { result: ResultStatus.Accepted }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[1].id,
        problemId: problems[4].id,
        contestId: contests[5].id,
        createTime: new Date('2023-06-01T10:40:00.000Z'),
        code: [
          {
            id: 1,
            locked: false,
            text: 'n = int(input())\nprint(n + 1)'
          }
        ],
        language: Language.Python3,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[4].id,
      result: ResultStatus.WrongAnswer,
      output: '6\n',
      cpuTime: 2345,
      memoryUsage: 6144
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[submissions.length - 1].id
    },
    data: { result: ResultStatus.WrongAnswer }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[2].id,
        problemId: problems[5].id,
        contestId: contests[5].id,
        createTime: new Date('2023-06-01T11:05:00.000Z'),
        code: [
          {
            id: 1,
            locked: false,
            text: `class Main {
    public static void main(String[] args) {
        java.util.Scanner sc = new java.util.Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(n * n);
    }
}`
          }
        ],
        language: Language.Java,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[5].id,
      result: ResultStatus.Accepted,
      output: '25\n',
      cpuTime: 3456,
      memoryUsage: 8192
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[submissions.length - 1].id
    },
    data: { result: ResultStatus.Accepted }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[3].id,
        problemId: problems[4].id,
        contestId: contests[5].id,
        createTime: new Date('2023-06-01T11:30:00.000Z'),
        code: [
          {
            id: 1,
            locked: false,
            text: `while True:
    pass`
          }
        ],
        language: Language.Python3,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[4].id,
      result: ResultStatus.TimeLimitExceeded,
      output: null,
      cpuTime: 5000,
      memoryUsage: 4096
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[submissions.length - 1].id
    },
    data: { result: ResultStatus.TimeLimitExceeded }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[4].id,
        problemId: problems[5].id,
        contestId: contests[5].id,
        createTime: new Date('2023-06-01T11:55:00.000Z'),
        code: [
          {
            id: 1,
            locked: false,
            text: `#include <stdio.h>
int main(void) {
    int arr[10];
    printf("%d\\n", arr[100]);
    return 0;
}`
          }
        ],
        language: Language.C,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[5].id,
      result: ResultStatus.RuntimeError,
      output: null,
      cpuTime: 123,
      memoryUsage: 2048
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[submissions.length - 1].id
    },
    data: { result: ResultStatus.RuntimeError }
  })

  // contest 6 problem 6 (타일 교환)
  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[0].id,
        problemId: problems[5].id,
        contestId: contests[5].id,
        createTime: new Date('2023-06-01T12:20:00.000Z'),
        code: [
          {
            id: 1,
            locked: false,
            text: '#include <stdio.h>\nint main(){ int n; scanf("%d",&n); printf("%d\\n",n*n); return 0; }'
          }
        ],
        language: Language.C,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[5].id,
      result: ResultStatus.Accepted,
      output: '25\n',
      cpuTime: 456,
      memoryUsage: 3072
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[submissions.length - 1].id
    },
    data: { result: ResultStatus.Accepted }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[5].id,
        problemId: problems[4].id,
        contestId: contests[5].id,
        createTime: new Date('2023-06-01T12:45:00.000Z'),
        code: [
          {
            id: 1,
            locked: false,
            text: 'print("Hello World"'
          }
        ],
        language: Language.Python3,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[4].id,
      result: ResultStatus.CompileError
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[submissions.length - 1].id
    },
    data: { result: ResultStatus.CompileError }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[1].id,
        problemId: problems[5].id,
        contestId: contests[5].id,
        createTime: new Date('2023-06-01T10:50:00.000Z'),
        code: [{ id: 1, locked: false, text: 'print(0)' }],
        language: Language.Python3,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[5].id,
      result: ResultStatus.WrongAnswer,
      output: '0\n',
      cpuTime: 100,
      memoryUsage: 1024
    }
  })
  await prisma.submission.update({
    where: { id: submissions[submissions.length - 1].id },
    data: { result: ResultStatus.WrongAnswer }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[3].id,
        problemId: problems[5].id,
        contestId: contests[5].id,
        createTime: new Date('2023-06-01T11:15:00.000Z'),
        code: [{ id: 1, locked: false, text: 'print(int(input())**2)' }],
        language: Language.Python3,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[5].id,
      result: ResultStatus.Accepted,
      output: '25\n',
      cpuTime: 200,
      memoryUsage: 2048
    }
  })
  await prisma.submission.update({
    where: { id: submissions[submissions.length - 1].id },
    data: { result: ResultStatus.Accepted }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[5].id,
        problemId: problems[5].id,
        contestId: contests[5].id,
        createTime: new Date('2023-06-01T11:40:00.000Z'),
        code: [
          {
            id: 1,
            locked: false,
            text: '#include <stdio.h>\nint main(){ for(;;); return 0; }'
          }
        ],
        language: Language.C,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[5].id,
      result: ResultStatus.TimeLimitExceeded
    }
  })
  await prisma.submission.update({
    where: { id: submissions[submissions.length - 1].id },
    data: { result: ResultStatus.TimeLimitExceeded }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[6].id,
        problemId: problems[5].id,
        contestId: contests[5].id,
        createTime: new Date('2023-06-01T12:05:00.000Z'),
        code: [
          {
            id: 1,
            locked: false,
            text: '#include <stdio.h>\nint main(){ printf("99\\n"); return 0; }'
          }
        ],
        language: Language.C,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[5].id,
      result: ResultStatus.WrongAnswer,
      output: '99\n',
      cpuTime: 80,
      memoryUsage: 512
    }
  })
  await prisma.submission.update({
    where: { id: submissions[submissions.length - 1].id },
    data: { result: ResultStatus.WrongAnswer }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        userId: users[7].id,
        problemId: problems[5].id,
        contestId: contests[5].id,
        createTime: new Date('2023-06-01T12:35:00.000Z'),
        code: [
          {
            id: 1,
            locked: false,
            text: '#include <stdio.h>\nint main(){ int n; scanf("%d",&n); printf("%d\\n",n*n); return 0; }'
          }
        ],
        language: Language.C,
        result: ResultStatus.Judging
      }
    })
  )
  await prisma.submissionResult.create({
    data: {
      submissionId: submissions[submissions.length - 1].id,
      problemTestcaseId: problemTestcases[5].id,
      result: ResultStatus.Accepted,
      output: '25\n',
      cpuTime: 150,
      memoryUsage: 1536
    }
  })
  await prisma.submission.update({
    where: { id: submissions[submissions.length - 1].id },
    data: { result: ResultStatus.Accepted }
  })

  const checkSeeds = users.map(async (user) => {
    const newSubmission = await prisma.submission.create({
      data: {
        userId: user.id,
        problemId: problems[3].id,
        assignmentId: endedAssignments[0].id,
        code: [
          {
            id: 1,
            locked: false,
            text: `class Main {
  public static void main(String[] args) {
      System.out.println("Hello, World!");
  }
}`
          }
        ],
        language: Language.Java,
        result: ResultStatus.Judging
      }
    })
    submissions.push(newSubmission)

    await prisma.submissionResult.create({
      data: {
        submissionId: submissions[submissions.length - 1].id,
        problemTestcaseId: problemTestcases[2].id,
        result: ResultStatus.Accepted,
        output: 'Hello, World!\n',
        cpuTime: 12345,
        memoryUsage: 12345
      }
    })
    await prisma.submission.update({
      where: {
        id: newSubmission.id
      },
      data: { result: ResultStatus.Accepted }
    })
  })

  await Promise.all(checkSeeds)

  if (endedContests.length > 0) {
    const testContest = endedContests[0]
    const testProblem1 = problems[4]

    const waSubmission = await prisma.submission.create({
      data: {
        userId: users[0].id,
        problemId: testProblem1.id,
        contestId: testContest.id,
        code: [{ id: 1, locked: false, text: 'print("WA")' }],
        language: Language.Python3,
        result: ResultStatus.Judging,
        createTime: new Date('2023-06-01T10:03:15.000Z')
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: waSubmission.id,
        problemTestcaseId: problemTestcases[4].id,
        result: ResultStatus.WrongAnswer,
        output: 'wrong\n'
      }
    })
    await prisma.submission.update({
      where: { id: waSubmission.id },
      data: { result: ResultStatus.WrongAnswer }
    })

    const tleSubmission = await prisma.submission.create({
      data: {
        userId: users[1].id,
        problemId: testProblem1.id,
        contestId: testContest.id,
        code: [{ id: 1, locked: false, text: 'while(1){}' }],
        language: Language.C,
        result: ResultStatus.Judging,
        createTime: new Date('2023-06-01T10:12:42.000Z')
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: tleSubmission.id,
        problemTestcaseId: problemTestcases[4].id,
        result: ResultStatus.TimeLimitExceeded
      }
    })
    await prisma.submission.update({
      where: { id: tleSubmission.id },
      data: { result: ResultStatus.TimeLimitExceeded }
    })

    const mleSubmission = await prisma.submission.create({
      data: {
        userId: users[2].id,
        problemId: testProblem1.id,
        contestId: testContest.id,
        code: [{ id: 1, locked: false, text: 'int arr[10000000];' }],
        language: Language.Cpp,
        result: ResultStatus.Judging,
        createTime: new Date('2023-06-01T10:18:27.000Z')
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: mleSubmission.id,
        problemTestcaseId: problemTestcases[4].id,
        result: ResultStatus.MemoryLimitExceeded
      }
    })
    await prisma.submission.update({
      where: { id: mleSubmission.id },
      data: { result: ResultStatus.MemoryLimitExceeded }
    })

    const reSubmission = await prisma.submission.create({
      data: {
        userId: users[3].id,
        problemId: testProblem1.id,
        contestId: testContest.id,
        code: [{ id: 1, locked: false, text: 'int x = 1/0;' }],
        language: Language.C,
        result: ResultStatus.Judging,
        createTime: new Date('2023-06-01T10:25:08.000Z')
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: reSubmission.id,
        problemTestcaseId: problemTestcases[4].id,
        result: ResultStatus.RuntimeError
      }
    })
    await prisma.submission.update({
      where: { id: reSubmission.id },
      data: { result: ResultStatus.RuntimeError }
    })

    const ceSubmission = await prisma.submission.create({
      data: {
        userId: users[4].id,
        problemId: testProblem1.id,
        contestId: testContest.id,
        code: [{ id: 1, locked: false, text: 'invalid syntax!!!' }],
        language: Language.Python3,
        result: ResultStatus.Judging,
        createTime: new Date('2023-06-01T10:33:51.000Z')
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: ceSubmission.id,
        problemTestcaseId: problemTestcases[4].id,
        result: ResultStatus.CompileError
      }
    })
    await prisma.submission.update({
      where: { id: ceSubmission.id },
      data: { result: ResultStatus.CompileError }
    })

    const seSubmission = await prisma.submission.create({
      data: {
        userId: users[8]?.id || users[0].id,
        problemId: testProblem1.id,
        contestId: testContest.id,
        code: [{ id: 1, locked: false, text: 'print("server error")' }],
        language: Language.Python3,
        result: ResultStatus.Judging,
        createTime: new Date('2023-06-01T10:38:22.000Z')
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: seSubmission.id,
        problemTestcaseId: problemTestcases[4].id,
        result: ResultStatus.ServerError
      }
    })
    await prisma.submission.update({
      where: { id: seSubmission.id },
      data: { result: ResultStatus.ServerError }
    })

    const oleSubmission = await prisma.submission.create({
      data: {
        userId: users[9]?.id || users[1].id,
        problemId: testProblem1.id,
        contestId: testContest.id,
        code: [{ id: 1, locked: false, text: 'print("A" * 1000000)' }],
        language: Language.Python3,
        result: ResultStatus.Judging,
        createTime: new Date('2023-06-01T10:45:10.000Z')
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: oleSubmission.id,
        problemTestcaseId: problemTestcases[4].id,
        result: ResultStatus.OutputLimitExceeded
      }
    })
    await prisma.submission.update({
      where: { id: oleSubmission.id },
      data: { result: ResultStatus.OutputLimitExceeded }
    })

    const sfeSubmission = await prisma.submission.create({
      data: {
        userId: users[10]?.id || users[2].id,
        problemId: testProblem1.id,
        contestId: testContest.id,
        code: [{ id: 1, locked: false, text: 'int *p = nullptr; *p = 42;' }],
        language: Language.Cpp,
        result: ResultStatus.Judging,
        createTime: new Date('2023-06-01T10:52:33.000Z')
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: sfeSubmission.id,
        problemTestcaseId: problemTestcases[4].id,
        result: ResultStatus.SegmentationFaultError
      }
    })
    await prisma.submission.update({
      where: { id: sfeSubmission.id },
      data: { result: ResultStatus.SegmentationFaultError }
    })

    const acceptedSubmission = await prisma.submission.create({
      data: {
        userId: users[5].id,
        problemId: testProblem1.id,
        contestId: testContest.id,
        code: [{ id: 1, locked: false, text: 'print("correct")' }],
        language: Language.Python3,
        result: ResultStatus.Judging,
        createTime: new Date('2023-06-01T10:42:19.000Z')
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: acceptedSubmission.id,
        problemTestcaseId: problemTestcases[4].id,
        result: ResultStatus.Accepted,
        output: 'correct\n'
      }
    })
    await prisma.submission.update({
      where: { id: acceptedSubmission.id },
      data: { result: ResultStatus.Accepted }
    })

    const wrongAnswer2 = await prisma.submission.create({
      data: {
        userId: users[6].id,
        problemId: testProblem1.id,
        contestId: testContest.id,
        code: [{ id: 1, locked: false, text: 'wrong' }],
        language: Language.C,
        result: ResultStatus.Judging,
        createTime: new Date('2023-06-01T10:47:33.000Z')
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: wrongAnswer2.id,
        problemTestcaseId: problemTestcases[4].id,
        result: ResultStatus.WrongAnswer
      }
    })
    await prisma.submission.update({
      where: { id: wrongAnswer2.id },
      data: { result: ResultStatus.WrongAnswer }
    })

    const accepted2 = await prisma.submission.create({
      data: {
        userId: users[7].id,
        problemId: testProblem1.id,
        contestId: testContest.id,
        code: [{ id: 1, locked: false, text: 'correct' }],
        language: Language.Cpp,
        result: ResultStatus.Judging,
        createTime: new Date('2023-06-01T10:52:07.000Z')
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: accepted2.id,
        problemTestcaseId: problemTestcases[4].id,
        result: ResultStatus.Accepted,
        output: 'correct\n'
      }
    })
    await prisma.submission.update({
      where: { id: accepted2.id },
      data: { result: ResultStatus.Accepted }
    })

    const randomSubmissions = [
      {
        time: '10:05:23',
        result: ResultStatus.WrongAnswer,
        user: users[8] || users[0],
        lang: Language.Python3,
        code: 'print("fail")'
      },
      {
        time: '10:09:11',
        result: ResultStatus.Accepted,
        user: users[9] || users[1],
        lang: Language.C,
        code: 'printf("ok");'
      },
      {
        time: '10:15:37',
        result: ResultStatus.TimeLimitExceeded,
        user: users[10] || users[2],
        lang: Language.Cpp,
        code: 'for(;;){}'
      },
      {
        time: '10:21:45',
        result: ResultStatus.WrongAnswer,
        user: users[11] || users[3],
        lang: Language.Python3,
        code: 'x = 1'
      },
      {
        time: '10:28:52',
        result: ResultStatus.RuntimeError,
        user: users[12] || users[4],
        lang: Language.C,
        code: 'int*p=0;*p=1;'
      },
      {
        time: '10:35:16',
        result: ResultStatus.Accepted,
        user: users[13] || users[5],
        lang: Language.Cpp,
        code: 'cout<<"ok";'
      },
      {
        time: '10:38:29',
        result: ResultStatus.MemoryLimitExceeded,
        user: users[14] || users[6],
        lang: Language.C,
        code: 'int a[9999999];'
      },
      {
        time: '10:44:08',
        result: ResultStatus.WrongAnswer,
        user: users[15] || users[7],
        lang: Language.Python3,
        code: 'print(0)'
      },
      {
        time: '10:49:41',
        result: ResultStatus.CompileError,
        user: users[16] || users[0],
        lang: Language.Cpp,
        code: 'syntax error!!'
      },
      {
        time: '10:56:14',
        result: ResultStatus.Accepted,
        user: users[17] || users[1],
        lang: Language.Python3,
        code: 'print("pass")'
      }
    ]

    for (const sub of randomSubmissions) {
      const submission = await prisma.submission.create({
        data: {
          userId: sub.user.id,
          problemId: testProblem1.id,
          contestId: testContest.id,
          code: [{ id: 1, locked: false, text: sub.code }],
          language: sub.lang,
          result: ResultStatus.Judging,
          createTime: new Date(`2023-06-01T${sub.time}.000Z`)
        }
      })
      await prisma.submissionResult.create({
        data: {
          submissionId: submission.id,
          problemTestcaseId: problemTestcases[4].id,
          result: sub.result,
          ...(sub.result === ResultStatus.Accepted
            ? { output: 'correct\n' }
            : {})
        }
      })
      await prisma.submission.update({
        where: { id: submission.id },
        data: { result: sub.result }
      })
    }
  }

  // 6번 대회에 대한 추가 submission 더미 데이터 (users[5-9])
  if (contests.length > 5 && users.length >= 10) {
    const contest6 = contests[5]

    // 문제 1, 2, 3의 problemId 찾기
    const problem1Id = problems[0].id
    const problem2Id = problems[1].id
    const problem3Id = problems[2].id

    // 문제별 testcase ID 찾기
    const testcase1Id =
      problemTestcases.find((tc) => tc.problemId === problem1Id)?.id ??
      problemTestcases[0].id
    const testcase2Id =
      problemTestcases.find((tc) => tc.problemId === problem2Id)?.id ??
      problemTestcases[1].id
    const testcase3Id =
      problemTestcases.find((tc) => tc.problemId === problem3Id)?.id ??
      problemTestcases[2].id

    // User 5: 실패 후 성공
    // 문제 1: WA 2회 → TLE 1회 → Accepted
    let baseTime = new Date('2023-06-01T10:00:00.000Z')
    for (let i = 0; i < 2; i++) {
      const sub = await prisma.submission.create({
        data: {
          userId: users[5].id,
          problemId: problem1Id,
          contestId: contest6.id,
          code: [{ id: 1, locked: false, text: `print(${i})` }],
          language: Language.Python3,
          result: ResultStatus.Judging,
          createTime: new Date(baseTime.getTime() + i * 60000)
        }
      })
      await prisma.submissionResult.create({
        data: {
          submissionId: sub.id,
          problemTestcaseId: testcase1Id,
          result: ResultStatus.WrongAnswer,
          output: `${i}\n`
        }
      })
      await prisma.submission.update({
        where: { id: sub.id },
        data: { result: ResultStatus.WrongAnswer }
      })
    }
    const tleSub = await prisma.submission.create({
      data: {
        userId: users[5].id,
        problemId: problem1Id,
        contestId: contest6.id,
        code: [{ id: 1, locked: false, text: 'while True: pass' }],
        language: Language.Python3,
        result: ResultStatus.Judging,
        createTime: new Date(baseTime.getTime() + 120000)
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: tleSub.id,
        problemTestcaseId: testcase1Id,
        result: ResultStatus.TimeLimitExceeded
      }
    })
    await prisma.submission.update({
      where: { id: tleSub.id },
      data: { result: ResultStatus.TimeLimitExceeded }
    })
    const acceptedSub1 = await prisma.submission.create({
      data: {
        userId: users[5].id,
        problemId: problem1Id,
        contestId: contest6.id,
        code: [
          {
            id: 1,
            locked: false,
            text: 'a, b = map(int, input().split())\nprint(a + b)'
          }
        ],
        language: Language.Python3,
        result: ResultStatus.Judging,
        createTime: new Date(baseTime.getTime() + 180000)
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: acceptedSub1.id,
        problemTestcaseId: testcase1Id,
        result: ResultStatus.Accepted,
        output: '3\n',
        cpuTime: 1234,
        memoryUsage: 5120
      }
    })
    await prisma.submission.update({
      where: { id: acceptedSub1.id },
      data: { result: ResultStatus.Accepted }
    })

    // 문제 2: CE 1회 → WA 1회 → Accepted
    baseTime = new Date('2023-06-01T10:20:00.000Z')
    const ceSub = await prisma.submission.create({
      data: {
        userId: users[5].id,
        problemId: problem2Id,
        contestId: contest6.id,
        code: [{ id: 1, locked: false, text: 'printf("syntax error"' }],
        language: Language.C,
        result: ResultStatus.Judging,
        createTime: baseTime
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: ceSub.id,
        problemTestcaseId: testcase2Id,
        result: ResultStatus.CompileError
      }
    })
    await prisma.submission.update({
      where: { id: ceSub.id },
      data: { result: ResultStatus.CompileError }
    })
    const waSub = await prisma.submission.create({
      data: {
        userId: users[5].id,
        problemId: problem2Id,
        contestId: contest6.id,
        code: [
          {
            id: 1,
            locked: false,
            text: '#include <stdio.h>\nint main(){ int n; scanf("%d",&n); printf("%d\\n",1); return 0; }'
          }
        ],
        language: Language.C,
        result: ResultStatus.Judging,
        createTime: new Date(baseTime.getTime() + 60000)
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: waSub.id,
        problemTestcaseId: testcase2Id,
        result: ResultStatus.WrongAnswer,
        output: '1\n'
      }
    })
    await prisma.submission.update({
      where: { id: waSub.id },
      data: { result: ResultStatus.WrongAnswer }
    })
    const acceptedSub2 = await prisma.submission.create({
      data: {
        userId: users[5].id,
        problemId: problem2Id,
        contestId: contest6.id,
        code: [
          {
            id: 1,
            locked: false,
            text: '#include <stdio.h>\nint main(){ int n; scanf("%d",&n); printf("%d\\n",n*2); return 0; }'
          }
        ],
        language: Language.C,
        result: ResultStatus.Judging,
        createTime: new Date(baseTime.getTime() + 120000)
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: acceptedSub2.id,
        problemTestcaseId: testcase2Id,
        result: ResultStatus.Accepted,
        output: '10\n',
        cpuTime: 2345,
        memoryUsage: 6144
      }
    })
    await prisma.submission.update({
      where: { id: acceptedSub2.id },
      data: { result: ResultStatus.Accepted }
    })

    // User 6: 일부 성공, 일부 실패
    // 문제 1: WA 3회 → Accepted
    baseTime = new Date('2023-06-01T10:40:00.000Z')
    for (let i = 0; i < 3; i++) {
      const sub = await prisma.submission.create({
        data: {
          userId: users[6].id,
          problemId: problem1Id,
          contestId: contest6.id,
          code: [{ id: 1, locked: false, text: `print(${i})` }],
          language: Language.Python3,
          result: ResultStatus.Judging,
          createTime: new Date(baseTime.getTime() + i * 60000)
        }
      })
      await prisma.submissionResult.create({
        data: {
          submissionId: sub.id,
          problemTestcaseId: testcase1Id,
          result: ResultStatus.WrongAnswer,
          output: `${i}\n`
        }
      })
      await prisma.submission.update({
        where: { id: sub.id },
        data: { result: ResultStatus.WrongAnswer }
      })
    }
    const acceptedSub3 = await prisma.submission.create({
      data: {
        userId: users[6].id,
        problemId: problem1Id,
        contestId: contest6.id,
        code: [
          {
            id: 1,
            locked: false,
            text: 'a, b = map(int, input().split())\nprint(a + b)'
          }
        ],
        language: Language.Python3,
        result: ResultStatus.Judging,
        createTime: new Date(baseTime.getTime() + 180000)
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: acceptedSub3.id,
        problemTestcaseId: testcase1Id,
        result: ResultStatus.Accepted,
        output: '3\n',
        cpuTime: 1456,
        memoryUsage: 4096
      }
    })
    await prisma.submission.update({
      where: { id: acceptedSub3.id },
      data: { result: ResultStatus.Accepted }
    })

    // 문제 2: WA 2회 → TLE 1회 → RE 1회 → (미해결)
    baseTime = new Date('2023-06-01T11:00:00.000Z')
    for (let i = 0; i < 2; i++) {
      const sub = await prisma.submission.create({
        data: {
          userId: users[6].id,
          problemId: problem2Id,
          contestId: contest6.id,
          code: [
            {
              id: 1,
              locked: false,
              text: `#include <stdio.h>\nint main(){ printf("%d\\n",${i}); return 0; }`
            }
          ],
          language: Language.C,
          result: ResultStatus.Judging,
          createTime: new Date(baseTime.getTime() + i * 60000)
        }
      })
      await prisma.submissionResult.create({
        data: {
          submissionId: sub.id,
          problemTestcaseId: testcase2Id,
          result: ResultStatus.WrongAnswer,
          output: `${i}\n`
        }
      })
      await prisma.submission.update({
        where: { id: sub.id },
        data: { result: ResultStatus.WrongAnswer }
      })
    }
    const tleSub2 = await prisma.submission.create({
      data: {
        userId: users[6].id,
        problemId: problem2Id,
        contestId: contest6.id,
        code: [
          {
            id: 1,
            locked: false,
            text: '#include <stdio.h>\nint main(){ for(;;); return 0; }'
          }
        ],
        language: Language.C,
        result: ResultStatus.Judging,
        createTime: new Date(baseTime.getTime() + 120000)
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: tleSub2.id,
        problemTestcaseId: testcase2Id,
        result: ResultStatus.TimeLimitExceeded
      }
    })
    await prisma.submission.update({
      where: { id: tleSub2.id },
      data: { result: ResultStatus.TimeLimitExceeded }
    })
    const reSub = await prisma.submission.create({
      data: {
        userId: users[6].id,
        problemId: problem2Id,
        contestId: contest6.id,
        code: [
          {
            id: 1,
            locked: false,
            text: '#include <stdio.h>\nint main(){ int *p=0; *p=1; return 0; }'
          }
        ],
        language: Language.C,
        result: ResultStatus.Judging,
        createTime: new Date(baseTime.getTime() + 180000)
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: reSub.id,
        problemTestcaseId: testcase2Id,
        result: ResultStatus.RuntimeError
      }
    })
    await prisma.submission.update({
      where: { id: reSub.id },
      data: { result: ResultStatus.RuntimeError }
    })

    // User 7: 여러 번 시도했으나 실패
    // 문제 1: WA 2회 → CE 1회 → WA 1회 → (미해결)
    baseTime = new Date('2023-06-01T11:25:00.000Z')
    for (let i = 0; i < 2; i++) {
      const sub = await prisma.submission.create({
        data: {
          userId: users[7].id,
          problemId: problem1Id,
          contestId: contest6.id,
          code: [{ id: 1, locked: false, text: `print(${i})` }],
          language: Language.Python3,
          result: ResultStatus.Judging,
          createTime: new Date(baseTime.getTime() + i * 60000)
        }
      })
      await prisma.submissionResult.create({
        data: {
          submissionId: sub.id,
          problemTestcaseId: testcase1Id,
          result: ResultStatus.WrongAnswer,
          output: `${i}\n`
        }
      })
      await prisma.submission.update({
        where: { id: sub.id },
        data: { result: ResultStatus.WrongAnswer }
      })
    }
    const ceSub2 = await prisma.submission.create({
      data: {
        userId: users[7].id,
        problemId: problem1Id,
        contestId: contest6.id,
        code: [{ id: 1, locked: false, text: 'print("syntax' }],
        language: Language.Python3,
        result: ResultStatus.Judging,
        createTime: new Date(baseTime.getTime() + 120000)
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: ceSub2.id,
        problemTestcaseId: testcase1Id,
        result: ResultStatus.CompileError
      }
    })
    await prisma.submission.update({
      where: { id: ceSub2.id },
      data: { result: ResultStatus.CompileError }
    })
    const waSub2 = await prisma.submission.create({
      data: {
        userId: users[7].id,
        problemId: problem1Id,
        contestId: contest6.id,
        code: [{ id: 1, locked: false, text: 'print(99)' }],
        language: Language.Python3,
        result: ResultStatus.Judging,
        createTime: new Date(baseTime.getTime() + 180000)
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: waSub2.id,
        problemTestcaseId: testcase1Id,
        result: ResultStatus.WrongAnswer,
        output: '99\n'
      }
    })
    await prisma.submission.update({
      where: { id: waSub2.id },
      data: { result: ResultStatus.WrongAnswer }
    })

    // 문제 2: TLE 1회 → WA 1회 → (미해결)
    baseTime = new Date('2023-06-01T11:50:00.000Z')
    const tleSub3 = await prisma.submission.create({
      data: {
        userId: users[7].id,
        problemId: problem2Id,
        contestId: contest6.id,
        code: [
          {
            id: 1,
            locked: false,
            text: '#include <stdio.h>\nint main(){ for(;;); return 0; }'
          }
        ],
        language: Language.C,
        result: ResultStatus.Judging,
        createTime: baseTime
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: tleSub3.id,
        problemTestcaseId: testcase2Id,
        result: ResultStatus.TimeLimitExceeded
      }
    })
    await prisma.submission.update({
      where: { id: tleSub3.id },
      data: { result: ResultStatus.TimeLimitExceeded }
    })
    const waSub3 = await prisma.submission.create({
      data: {
        userId: users[7].id,
        problemId: problem2Id,
        contestId: contest6.id,
        code: [
          {
            id: 1,
            locked: false,
            text: '#include <stdio.h>\nint main(){ printf("1\\n"); return 0; }'
          }
        ],
        language: Language.C,
        result: ResultStatus.Judging,
        createTime: new Date(baseTime.getTime() + 60000)
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: waSub3.id,
        problemTestcaseId: testcase2Id,
        result: ResultStatus.WrongAnswer,
        output: '1\n'
      }
    })
    await prisma.submission.update({
      where: { id: waSub3.id },
      data: { result: ResultStatus.WrongAnswer }
    })

    // User 8: 빠르게 해결
    // 문제 1: Accepted (첫 시도)
    baseTime = new Date('2023-06-01T12:00:00.000Z')
    const acceptedSub4 = await prisma.submission.create({
      data: {
        userId: users[8].id,
        problemId: problem1Id,
        contestId: contest6.id,
        code: [
          {
            id: 1,
            locked: false,
            text: 'a, b = map(int, input().split())\nprint(a + b)'
          }
        ],
        language: Language.Python3,
        result: ResultStatus.Judging,
        createTime: baseTime
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: acceptedSub4.id,
        problemTestcaseId: testcase1Id,
        result: ResultStatus.Accepted,
        output: '3\n',
        cpuTime: 567,
        memoryUsage: 3072
      }
    })
    await prisma.submission.update({
      where: { id: acceptedSub4.id },
      data: { result: ResultStatus.Accepted }
    })

    // 문제 2: WA 1회 → Accepted
    baseTime = new Date('2023-06-01T12:05:00.000Z')
    const waSub4 = await prisma.submission.create({
      data: {
        userId: users[8].id,
        problemId: problem2Id,
        contestId: contest6.id,
        code: [
          {
            id: 1,
            locked: false,
            text: '#include <stdio.h>\nint main(){ printf("1\\n"); return 0; }'
          }
        ],
        language: Language.C,
        result: ResultStatus.Judging,
        createTime: baseTime
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: waSub4.id,
        problemTestcaseId: testcase2Id,
        result: ResultStatus.WrongAnswer,
        output: '1\n'
      }
    })
    await prisma.submission.update({
      where: { id: waSub4.id },
      data: { result: ResultStatus.WrongAnswer }
    })
    const acceptedSub5 = await prisma.submission.create({
      data: {
        userId: users[8].id,
        problemId: problem2Id,
        contestId: contest6.id,
        code: [
          {
            id: 1,
            locked: false,
            text: '#include <stdio.h>\nint main(){ int n; scanf("%d",&n); printf("%d\\n",n*2); return 0; }'
          }
        ],
        language: Language.C,
        result: ResultStatus.Judging,
        createTime: new Date(baseTime.getTime() + 60000)
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: acceptedSub5.id,
        problemTestcaseId: testcase2Id,
        result: ResultStatus.Accepted,
        output: '10\n',
        cpuTime: 890,
        memoryUsage: 4096
      }
    })
    await prisma.submission.update({
      where: { id: acceptedSub5.id },
      data: { result: ResultStatus.Accepted }
    })

    // 문제 3: WA 1회 → Accepted
    baseTime = new Date('2023-06-01T12:10:00.000Z')
    const waSub5 = await prisma.submission.create({
      data: {
        userId: users[8].id,
        problemId: problem3Id,
        contestId: contest6.id,
        code: [{ id: 1, locked: false, text: 'print(1)' }],
        language: Language.Cpp,
        result: ResultStatus.Judging,
        createTime: baseTime
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: waSub5.id,
        problemTestcaseId: testcase3Id,
        result: ResultStatus.WrongAnswer,
        output: '1\n'
      }
    })
    await prisma.submission.update({
      where: { id: waSub5.id },
      data: { result: ResultStatus.WrongAnswer }
    })
    const acceptedSub6 = await prisma.submission.create({
      data: {
        userId: users[8].id,
        problemId: problem3Id,
        contestId: contest6.id,
        code: [
          {
            id: 1,
            locked: false,
            text: '#include <iostream>\nusing namespace std;\nint main() { int n; cin >> n; cout << n * n << endl; return 0; }'
          }
        ],
        language: Language.Cpp,
        result: ResultStatus.Judging,
        createTime: new Date(baseTime.getTime() + 60000)
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: acceptedSub6.id,
        problemTestcaseId: testcase3Id,
        result: ResultStatus.Accepted,
        output: '25\n',
        cpuTime: 1234,
        memoryUsage: 5120
      }
    })
    await prisma.submission.update({
      where: { id: acceptedSub6.id },
      data: { result: ResultStatus.Accepted }
    })

    baseTime = new Date('2023-06-01T10:28:00.000Z')
    for (let i = 0; i < 2; i++) {
      const sub = await prisma.submission.create({
        data: {
          userId: users[5].id,
          problemId: problem3Id,
          contestId: contest6.id,
          code: [
            {
              id: 1,
              locked: false,
              text: `#include <iostream>\nint main(){ std::cout<<${i}<<std::endl; return 0; }`
            }
          ],
          language: Language.Cpp,
          result: ResultStatus.Judging,
          createTime: new Date(baseTime.getTime() + i * 60000)
        }
      })
      await prisma.submissionResult.create({
        data: {
          submissionId: sub.id,
          problemTestcaseId: testcase3Id,
          result: ResultStatus.WrongAnswer,
          output: `${i}\n`
        }
      })
      await prisma.submission.update({
        where: { id: sub.id },
        data: { result: ResultStatus.WrongAnswer }
      })
    }
    const acceptedSub9 = await prisma.submission.create({
      data: {
        userId: users[5].id,
        problemId: problem3Id,
        contestId: contest6.id,
        code: [
          {
            id: 1,
            locked: false,
            text: '#include <iostream>\nint main(){ int n; std::cin>>n; std::cout<<n*n<<std::endl; return 0; }'
          }
        ],
        language: Language.Cpp,
        result: ResultStatus.Judging,
        createTime: new Date(baseTime.getTime() + 120000)
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: acceptedSub9.id,
        problemTestcaseId: testcase3Id,
        result: ResultStatus.Accepted,
        output: '25\n',
        cpuTime: 200,
        memoryUsage: 2048
      }
    })
    await prisma.submission.update({
      where: { id: acceptedSub9.id },
      data: { result: ResultStatus.Accepted }
    })

    baseTime = new Date('2023-06-01T11:12:00.000Z')
    const tleSub5 = await prisma.submission.create({
      data: {
        userId: users[6].id,
        problemId: problem3Id,
        contestId: contest6.id,
        code: [
          {
            id: 1,
            locked: false,
            text: '#include <iostream>\nint main(){ for(;;); return 0; }'
          }
        ],
        language: Language.Cpp,
        result: ResultStatus.Judging,
        createTime: baseTime
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: tleSub5.id,
        problemTestcaseId: testcase3Id,
        result: ResultStatus.TimeLimitExceeded
      }
    })
    await prisma.submission.update({
      where: { id: tleSub5.id },
      data: { result: ResultStatus.TimeLimitExceeded }
    })
    const acceptedSub10 = await prisma.submission.create({
      data: {
        userId: users[6].id,
        problemId: problem3Id,
        contestId: contest6.id,
        code: [
          {
            id: 1,
            locked: false,
            text: '#include <iostream>\nint main(){ int n; std::cin>>n; std::cout<<n*n<<std::endl; return 0; }'
          }
        ],
        language: Language.Cpp,
        result: ResultStatus.Judging,
        createTime: new Date(baseTime.getTime() + 60000)
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: acceptedSub10.id,
        problemTestcaseId: testcase3Id,
        result: ResultStatus.Accepted,
        output: '25\n',
        cpuTime: 180,
        memoryUsage: 1536
      }
    })
    await prisma.submission.update({
      where: { id: acceptedSub10.id },
      data: { result: ResultStatus.Accepted }
    })

    baseTime = new Date('2023-06-01T11:55:00.000Z')
    const ceSub3 = await prisma.submission.create({
      data: {
        userId: users[7].id,
        problemId: problem3Id,
        contestId: contest6.id,
        code: [{ id: 1, locked: false, text: 'std::cout<<"syntax' }],
        language: Language.Cpp,
        result: ResultStatus.Judging,
        createTime: baseTime
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: ceSub3.id,
        problemTestcaseId: testcase3Id,
        result: ResultStatus.CompileError
      }
    })
    await prisma.submission.update({
      where: { id: ceSub3.id },
      data: { result: ResultStatus.CompileError }
    })
    const waSub6 = await prisma.submission.create({
      data: {
        userId: users[7].id,
        problemId: problem3Id,
        contestId: contest6.id,
        code: [
          {
            id: 1,
            locked: false,
            text: '#include <iostream>\nint main(){ std::cout<<1<<std::endl; return 0; }'
          }
        ],
        language: Language.Cpp,
        result: ResultStatus.Judging,
        createTime: new Date(baseTime.getTime() + 60000)
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: waSub6.id,
        problemTestcaseId: testcase3Id,
        result: ResultStatus.WrongAnswer,
        output: '1\n'
      }
    })
    await prisma.submission.update({
      where: { id: waSub6.id },
      data: { result: ResultStatus.WrongAnswer }
    })

    baseTime = new Date('2023-06-01T12:42:00.000Z')
    const waSub7 = await prisma.submission.create({
      data: {
        userId: users[9].id,
        problemId: problem3Id,
        contestId: contest6.id,
        code: [
          {
            id: 1,
            locked: false,
            text: '#include <iostream>\nint main(){ std::cout<<0<<std::endl; return 0; }'
          }
        ],
        language: Language.Cpp,
        result: ResultStatus.Judging,
        createTime: baseTime
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: waSub7.id,
        problemTestcaseId: testcase3Id,
        result: ResultStatus.WrongAnswer,
        output: '0\n'
      }
    })
    await prisma.submission.update({
      where: { id: waSub7.id },
      data: { result: ResultStatus.WrongAnswer }
    })
    const acceptedSub11 = await prisma.submission.create({
      data: {
        userId: users[9].id,
        problemId: problem3Id,
        contestId: contest6.id,
        code: [
          {
            id: 1,
            locked: false,
            text: '#include <iostream>\nint main(){ int n; std::cin>>n; std::cout<<n*n<<std::endl; return 0; }'
          }
        ],
        language: Language.Cpp,
        result: ResultStatus.Judging,
        createTime: new Date(baseTime.getTime() + 60000)
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: acceptedSub11.id,
        problemTestcaseId: testcase3Id,
        result: ResultStatus.Accepted,
        output: '25\n',
        cpuTime: 220,
        memoryUsage: 2560
      }
    })
    await prisma.submission.update({
      where: { id: acceptedSub11.id },
      data: { result: ResultStatus.Accepted }
    })

    // User 9: 느리게 해결
    // 문제 1: WA 4회 → TLE 1회 → Accepted
    baseTime = new Date('2023-06-01T12:20:00.000Z')
    for (let i = 0; i < 4; i++) {
      const sub = await prisma.submission.create({
        data: {
          userId: users[9].id,
          problemId: problem1Id,
          contestId: contest6.id,
          code: [{ id: 1, locked: false, text: `print(${i})` }],
          language: Language.Python3,
          result: ResultStatus.Judging,
          createTime: new Date(baseTime.getTime() + i * 60000)
        }
      })
      await prisma.submissionResult.create({
        data: {
          submissionId: sub.id,
          problemTestcaseId: testcase1Id,
          result: ResultStatus.WrongAnswer,
          output: `${i}\n`
        }
      })
      await prisma.submission.update({
        where: { id: sub.id },
        data: { result: ResultStatus.WrongAnswer }
      })
    }
    const tleSub4 = await prisma.submission.create({
      data: {
        userId: users[9].id,
        problemId: problem1Id,
        contestId: contest6.id,
        code: [{ id: 1, locked: false, text: 'while True: pass' }],
        language: Language.Python3,
        result: ResultStatus.Judging,
        createTime: new Date(baseTime.getTime() + 240000)
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: tleSub4.id,
        problemTestcaseId: testcase1Id,
        result: ResultStatus.TimeLimitExceeded
      }
    })
    await prisma.submission.update({
      where: { id: tleSub4.id },
      data: { result: ResultStatus.TimeLimitExceeded }
    })
    const acceptedSub7 = await prisma.submission.create({
      data: {
        userId: users[9].id,
        problemId: problem1Id,
        contestId: contest6.id,
        code: [
          {
            id: 1,
            locked: false,
            text: 'a, b = map(int, input().split())\nprint(a + b)'
          }
        ],
        language: Language.Python3,
        result: ResultStatus.Judging,
        createTime: new Date(baseTime.getTime() + 300000)
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: acceptedSub7.id,
        problemTestcaseId: testcase1Id,
        result: ResultStatus.Accepted,
        output: '3\n',
        cpuTime: 2345,
        memoryUsage: 6144
      }
    })
    await prisma.submission.update({
      where: { id: acceptedSub7.id },
      data: { result: ResultStatus.Accepted }
    })

    // 문제 2: CE 2회 → WA 2회 → Accepted
    baseTime = new Date('2023-06-01T12:35:00.000Z')
    for (let i = 0; i < 2; i++) {
      const sub = await prisma.submission.create({
        data: {
          userId: users[9].id,
          problemId: problem2Id,
          contestId: contest6.id,
          code: [{ id: 1, locked: false, text: 'printf("syntax error"' }],
          language: Language.C,
          result: ResultStatus.Judging,
          createTime: new Date(baseTime.getTime() + i * 60000)
        }
      })
      await prisma.submissionResult.create({
        data: {
          submissionId: sub.id,
          problemTestcaseId: testcase2Id,
          result: ResultStatus.CompileError
        }
      })
      await prisma.submission.update({
        where: { id: sub.id },
        data: { result: ResultStatus.CompileError }
      })
    }
    for (let i = 0; i < 2; i++) {
      const sub = await prisma.submission.create({
        data: {
          userId: users[9].id,
          problemId: problem2Id,
          contestId: contest6.id,
          code: [
            {
              id: 1,
              locked: false,
              text: `#include <stdio.h>\nint main(){ printf("%d\\n",${i}); return 0; }`
            }
          ],
          language: Language.C,
          result: ResultStatus.Judging,
          createTime: new Date(baseTime.getTime() + 120000 + i * 60000)
        }
      })
      await prisma.submissionResult.create({
        data: {
          submissionId: sub.id,
          problemTestcaseId: testcase2Id,
          result: ResultStatus.WrongAnswer,
          output: `${i}\n`
        }
      })
      await prisma.submission.update({
        where: { id: sub.id },
        data: { result: ResultStatus.WrongAnswer }
      })
    }
    const acceptedSub8 = await prisma.submission.create({
      data: {
        userId: users[9].id,
        problemId: problem2Id,
        contestId: contest6.id,
        code: [
          {
            id: 1,
            locked: false,
            text: '#include <stdio.h>\nint main(){ int n; scanf("%d",&n); printf("%d\\n",n*2); return 0; }'
          }
        ],
        language: Language.C,
        result: ResultStatus.Judging,
        createTime: new Date(baseTime.getTime() + 240000)
      }
    })
    await prisma.submissionResult.create({
      data: {
        submissionId: acceptedSub8.id,
        problemTestcaseId: testcase2Id,
        result: ResultStatus.Accepted,
        output: '10\n',
        cpuTime: 3456,
        memoryUsage: 8192
      }
    })
    await prisma.submission.update({
      where: { id: acceptedSub8.id },
      data: { result: ResultStatus.Accepted }
    })
  }
}

const createAnnouncements = async () => {
  // For Contests
  for (let i = 0; i < 5; ++i) {
    contestAnnouncements.push(
      await prisma.announcement.create({
        data: {
          content: `Announcement(contest)_0_${i}`,
          contestId: ongoingContests[i].id
        }
      })
    )
  }

  for (let i = 0; i < 5; ++i) {
    contestAnnouncements.push(
      await prisma.announcement.create({
        data: {
          content: `Announcement(contest)_1_${i}...
아래 내용은 한글 Lorem Ipsum으로 생성된 내용입니다! 별 의미 없어요.
모든 국민은 신속한 재판을 받을 권리를 가진다. 형사피고인은 상당한 이유가 없는 한 지체없이 공개재판을 받을 권리를 가진다.
법관은 탄핵 또는 금고 이상의 형의 선고에 의하지 아니하고는 파면되지 아니하며, 징계처분에 의하지 아니하고는 정직·감봉 기타 불리한 처분을 받지 아니한다.
일반사면을 명하려면 국회의 동의를 얻어야 한다. 연소자의 근로는 특별한 보호를 받는다.`,
          contestId: ongoingContests[i].id,
          problemId: problems[i].id
        }
      })
    )
  }
}

const createAssignmentRecords = async () => {
  const assignmentRecords: AssignmentRecord[] = []
  // group 1 users
  const group1Users = await prisma.userGroup.findMany({
    where: {
      groupId: 1
    }
  })
  for (const user of group1Users) {
    const assignmentRecord = await prisma.assignmentRecord.create({
      data: {
        userId: user.userId,
        assignmentId: 1,
        acceptedProblemNum: 0,
        totalPenalty: 0
      }
    })
    assignmentRecords.push(assignmentRecord)
  }

  if (endedAssignments.length > 0) {
    await prisma.assignmentRecord.createMany({
      data: group1Users.map((ug) => ({
        userId: ug.userId,
        assignmentId: endedAssignments[0].id,
        acceptedProblemNum: 0,
        totalPenalty: 0
      })),
      skipDuplicates: true
    })
  }

  // upcoming assignment에 참가한 User 1의 assignment register를 un-register하는 기능과,
  // registered upcoming, ongoing, finished assignment를 조회하는 기능을 확인하기 위함
  const user01Id = 7
  for (
    let assignmentId = 3;
    assignmentId <= assignments.length;
    assignmentId += 2
  ) {
    assignmentRecords.push(
      await prisma.assignmentRecord.create({
        data: {
          userId: user01Id,
          assignmentId,
          acceptedProblemNum: 0,
          score: 0,
          totalPenalty: 0
        }
      })
    )
  }

  return assignmentRecords
}

const createContestRecords = async () => {
  // group 1 users
  const group1Users = await prisma.userGroup.findMany({
    where: {
      groupId: 1
    }
  })
  for (const user of group1Users) {
    const contestRecord = await prisma.contestRecord.create({
      data: {
        userId: user.userId,
        contestId: 1,
        acceptedProblemNum: 0,
        totalPenalty: 0
      }
    })
    contestRecords.push(contestRecord)
  }

  // upcoming contest에 참가한 User 1의 contest register를 un-register하는 기능과,
  // registered upcoming, ongoing, finished contest를 조회하는 기능을 확인하기 위함
  const contests = await prisma.contest.findMany({
    select: {
      id: true
    }
  })
  const user01Id = 7
  for (let i = 0; i < contests.length; i += 2) {
    const contestId = contests[i].id
    const existingRecord = await prisma.contestRecord.findFirst({
      where: {
        contestId,
        userId: user01Id
      }
    })
    if (!existingRecord) {
      contestRecords.push(
        await prisma.contestRecord.create({
          data: {
            userId: user01Id,
            contestId,
            acceptedProblemNum: 0,
            score: 0,
            totalPenalty: 0
          }
        })
      )
    }
  }

  const contestId6 = 6
  const contest6 = await prisma.contest.findUnique({
    where: { id: contestId6 },
    select: {
      contestProblem: {
        orderBy: { order: 'asc' },
        select: { id: true, score: true }
      }
    }
  })
  if (contest6?.contestProblem.length) {
    const group6Users = await prisma.userGroup.findMany({
      where: {
        groupId: contest6Group.id,
        isGroupLeader: false
      },
      select: { userId: true }
    })

    for (const userGroup of group6Users) {
      const existing = await prisma.contestRecord.findFirst({
        where: {
          contestId: contestId6,
          userId: userGroup.userId
        }
      })
      if (existing) continue
      const record = await prisma.contestRecord.create({
        data: {
          contestId: contestId6,
          userId: userGroup.userId,
          acceptedProblemNum: 0,
          score: 0,
          totalPenalty: 0,
          finalScore: 0,
          finalTotalPenalty: 0
        }
      })
      contestRecords.push(record)
    }
  }

  // add general users (users[5-9]) to contest 6
  if (users.length >= 10) {
    for (let i = 5; i <= 9; i++) {
      const existing = await prisma.contestRecord.findFirst({
        where: {
          contestId: contestId6,
          userId: users[i].id
        }
      })
      if (existing) continue
      const record = await prisma.contestRecord.create({
        data: {
          contestId: contestId6,
          userId: users[i].id,
          acceptedProblemNum: 0,
          score: 0,
          totalPenalty: 0,
          finalScore: 0,
          finalTotalPenalty: 0
        }
      })
      contestRecords.push(record)
    }
  }

  return contestRecords
}

const createUserContests = async () => {
  const userContests: Promise<UserContest | Prisma.BatchPayload>[] = []
  for (const contest of contests) {
    // Contest Manager & Reviewer
    if (contest.createdById === contestAdminUser.id) {
      userContests.push(
        prisma.userContest.createMany({
          data: [
            {
              contestId: contest.id,
              userId: contestManagerUser.id,
              role: ContestRole.Manager
            },
            {
              contestId: contest.id,
              userId: contestReviewerUser.id,
              role: ContestRole.Reviewer
            }
          ],
          skipDuplicates: true
        })
      )
    }
    // Contest Admin
    if (contest.createdById) {
      userContests.push(
        prisma.userContest.create({
          data: {
            contestId: contest.id,
            userId: contest.createdById,
            role: ContestRole.Admin
          }
        })
      )
    }
  }

  await Promise.all(userContests)

  // Participant
  const participantPromises: Promise<UserContest>[] = []
  for (const contestRecord of contestRecords) {
    const userAlreadyExists = await prisma.userContest.findFirst({
      where: {
        userId: contestRecord.userId!,
        contestId: contestRecord.contestId
      }
    })
    if (!userAlreadyExists) {
      participantPromises.push(
        prisma.userContest.create({
          data: {
            contestId: contestRecord.contestId,
            userId: contestRecord.userId!,
            role: ContestRole.Participant
          }
        })
      )
    }
  }

  await Promise.all(participantPromises)
}

const createContestProblemRecords = async () => {
  for (let i = 0; i < 5; ++i) {
    contestProblemRecords.push(
      await prisma.contestProblemRecord.create({
        data: {
          contestProblemId: i + 1,
          contestRecordId: 1
        }
      })
    )
  }

  const contestId6 = 6
  const contest6 = await prisma.contest.findUnique({
    where: { id: contestId6 },
    select: {
      contestProblem: {
        orderBy: { order: 'asc' },
        select: { id: true, score: true }
      }
    }
  })
  if (contest6?.contestProblem.length) {
    const records6 = await prisma.contestRecord.findMany({
      where: { contestId: contestId6 },
      orderBy: { userId: 'asc' }
    })
    const baseTime = new Date('2023-06-01T10:00:00.000Z')
    for (let u = 0; u < records6.length; u++) {
      let totalScore = 0
      let totalPenalty = 0
      let lastAccepted: Date | null = null
      let acceptedCount = 0
      for (let i = 0; i < contest6.contestProblem.length; i++) {
        const cp = contest6.contestProblem[i]
        const solved = i < 2 && u < 3 ? 1 : 0
        const score = solved ? (cp.score ?? 0) : 0
        const timePenalty = solved ? 20 + u * 5 + i * 10 : 0
        const submitPenalty = solved ? (i + 1) * 20 : 0
        await prisma.contestProblemRecord.create({
          data: {
            contestProblemId: cp.id,
            contestRecordId: records6[u].id,
            score,
            finalScore: score,
            timePenalty,
            finalTimePenalty: timePenalty,
            submitCountPenalty: submitPenalty,
            finalSubmitCountPenalty: submitPenalty,
            finishTime: solved
              ? new Date(baseTime.getTime() + (i + u) * 60_000)
              : null,
            isFirstSolver: u === 0 && i === 0
          }
        })
        totalScore += score
        totalPenalty += timePenalty + submitPenalty
        if (solved) {
          acceptedCount += 1
          lastAccepted = new Date(baseTime.getTime() + (i + u) * 60_000)
        }
      }
      await prisma.contestRecord.update({
        where: { id: records6[u].id },
        data: {
          acceptedProblemNum: acceptedCount,
          score: totalScore,
          finalScore: totalScore,
          totalPenalty,
          finalTotalPenalty: totalPenalty,
          lastAcceptedTime: lastAccepted
        }
      })
    }
  }

  return contestProblemRecords
}

const createAssignmentProblemRecords = async () => {
  const assignmentProblems = await prisma.assignmentProblem.findMany({
    select: { assignmentId: true, problemId: true, score: true }
  })

  if (assignmentProblems.length === 0) return []

  const assignmentIds = Array.from(
    new Set(assignmentProblems.map((ap) => ap.assignmentId))
  )

  const scoreMapByAssignment: Record<number, Record<number, number>> = {}
  for (const ap of assignmentProblems) {
    if (!scoreMapByAssignment[ap.assignmentId]) {
      scoreMapByAssignment[ap.assignmentId] = {}
    }
    scoreMapByAssignment[ap.assignmentId][ap.problemId] = ap.score ?? 0
  }

  const participants = await prisma.assignmentRecord.findMany({
    where: { assignmentId: { in: assignmentIds }, userId: { not: null } },
    select: { assignmentId: true, userId: true }
  })

  if (participants.length === 0) return []

  const userIds = Array.from(
    new Set(
      participants.map((p) => p.userId!).filter((v): v is number => v !== null)
    )
  )
  const problemIds = Array.from(
    new Set(assignmentProblems.map((ap) => ap.problemId))
  )

  const submissions = await prisma.submission.findMany({
    where: {
      assignmentId: { in: assignmentIds },
      userId: { in: userIds },
      problemId: { in: problemIds }
    },
    select: { assignmentId: true, userId: true, problemId: true, result: true }
  })

  const submittedSet = new Set<string>()
  const acceptedSet = new Set<string>()
  for (const s of submissions) {
    const key = `${s.assignmentId}:${s.userId}:${s.problemId}`
    submittedSet.add(key)
    if (s.result === ResultStatus.Accepted) {
      acceptedSet.add(key)
    }
  }

  const problemsByAssignment = assignmentProblems.reduce(
    (acc, ap) => {
      if (!acc[ap.assignmentId]) acc[ap.assignmentId] = []
      acc[ap.assignmentId].push(ap.problemId)
      return acc
    },
    {} as Record<number, number[]>
  )

  const createData: Array<{
    assignmentId: number
    userId: number
    problemId: number
    isSubmitted?: boolean
    isAccepted?: boolean
    score?: number
  }> = []

  for (const { assignmentId, userId } of participants) {
    const problems = problemsByAssignment[assignmentId] ?? []
    for (const problemId of problems) {
      const key = `${assignmentId}:${userId}:${problemId}`
      const isAccepted = acceptedSet.has(key)
      const isSubmitted = submittedSet.has(key)
      const base = {
        assignmentId,
        userId: userId!,
        problemId
      }
      if (isAccepted) {
        createData.push({
          ...base,
          isSubmitted: true,
          isAccepted: true,
          score: scoreMapByAssignment[assignmentId]?.[problemId] ?? 0
        })
      } else if (isSubmitted) {
        createData.push({ ...base, isSubmitted: true })
      } else {
        createData.push(base)
      }
    }
  }

  if (createData.length === 0) return []

  const result = await prisma.assignmentProblemRecord.createMany({
    data: createData,
    skipDuplicates: true
  })

  return result
}

const createContestQnA = async () => {
  await prisma.contestQnA.createMany({
    data: [
      {
        contestId: 1,
        createdById: 8,
        title: 'QnA 1',
        order: 1,
        content: '질문의 내용',
        category: QnACategory.General
      },
      {
        contestId: 1,
        createdById: 7,
        order: 2,
        title: '1번 대회에 대한 질문',
        content: '7번 유저가 작성함',
        category: QnACategory.General
      },
      {
        contestId: 1,
        createdById: 7,
        order: 3,
        title: '1번 대회에 대한 질문',
        content: '7번 유저가 작성함',
        category: QnACategory.Problem,
        problemId: 1
      },
      {
        contestId: 1,
        createdById: 7,
        order: 4,
        title: '1번 대회에 대한 질문',
        content: '7번 유저가 작성함',
        category: QnACategory.Problem,
        problemId: 1
      },
      {
        contestId: 1,
        createdById: 7,
        order: 5,
        title: '1번 대회에 대한 질문',
        content: '7번 유저가 작성함',
        category: QnACategory.General
      },
      {
        contestId: 19,
        createdById: 7,
        order: 1,
        title: '19번 대회에 대한 질문',
        content: '7번 유저가 작성함',
        category: QnACategory.General
      },
      {
        contestId: 20,
        createdById: 7,
        order: 1,
        title: '20번 대회에 대한 질문',
        content: '7번 유저가 작성함',
        category: QnACategory.General
      },
      {
        contestId: 20,
        createdById: 8,
        order: 2,
        title: '20번 대회에 대한 질문',
        content: '8번 유저가 작성함',
        category: QnACategory.General
      }
    ]
  })
}

const createContestQnAComment = async () => {
  await prisma.contestQnAComment.createMany({
    data: [
      {
        contestQnAId: 1,
        content: '1번 질문에 대한 답변',
        order: 1,
        createdById: 7,
        isContestStaff: false
      },
      {
        contestQnAId: 6,
        content: '6번 질문에 대한 답변',
        order: 1,
        createdById: 7,
        isContestStaff: false
      },
      {
        contestQnAId: 6,
        content: '6번 질문에 대한 답변',
        order: 2,
        createdById: 4,
        isContestStaff: true
      },
      {
        contestQnAId: 7,
        content: '7번 질문에 대한 관리자 답변',
        order: 1,
        createdById: 4,
        isContestStaff: true
      },
      {
        contestQnAId: 7,
        content: '7번 질문에 대한 작성자 답변',
        order: 2,
        createdById: 7,
        isContestStaff: false
      },
      {
        contestQnAId: 8,
        content: '8번 질문에 대한 관리자 답변',
        order: 1,
        createdById: 4,
        isContestStaff: true
      },
      {
        contestQnAId: 8,
        content: '8번 질문에 대한 작성자 답변',
        order: 2,
        createdById: 8,
        isContestStaff: false
      }
    ]
  })
}

const createNotifications = async () => {
  const notification1 = await prisma.notification.create({
    data: {
      title: '정보보호개론',
      message: 'A new assignment "Homework 1" has been created.',
      type: NotificationType.Assignment,
      url: '/assignment/1'
    }
  })

  const notification2 = await prisma.notification.create({
    data: {
      title: '정보보호개론',
      message: 'Your assignment "Homework 1" has been graded.',
      type: NotificationType.Assignment
    }
  })

  const notification3 = await prisma.notification.create({
    data: {
      title: 'System Notice',
      message: 'Platform maintenance scheduled for tomorrow.',
      type: NotificationType.Other
    }
  })

  await prisma.notificationRecord.createMany({
    data: [
      {
        notificationId: notification1.id,
        userId: users[0].id,
        isRead: false
      },
      {
        notificationId: notification2.id,
        userId: users[0].id,
        isRead: false
      },
      {
        notificationId: notification3.id,
        userId: users[0].id,
        isRead: false
      },
      {
        notificationId: notification1.id,
        userId: users[1].id,
        isRead: true
      },
      {
        notificationId: notification2.id,
        userId: users[1].id,
        isRead: false
      },
      {
        notificationId: notification3.id,
        userId: users[1].id,
        isRead: true
      }
    ]
  })
}

const createCourseQnA = async () => {
  // QnA 1 (Problem, Public)
  const qna1 = await prisma.courseQnA.create({
    data: {
      groupId: privateGroup1.id, // '컴퓨터프로그래밍' 코스
      createdById: users[0].id, // user01 (학생)
      problemId: problems[0].id, // '정수 더하기' 문제
      category: QnACategory.Problem,
      title: '1번 문제 테스트케이스 질문입니다.',
      content: '1번 문제의 2번 테스트케이스가 이해가지 않습니다.',
      isResolved: false,
      isPrivate: false,
      order: 1 //
    }
  })

  // QnA 2 (General, Private)
  const qna2 = await prisma.courseQnA.create({
    data: {
      groupId: privateGroup1.id, // '컴퓨터프로그래밍' 코스
      createdById: users[1].id, // user02 (학생)
      category: QnACategory.General,
      title: '과제 제출 관련 질문입니다.',
      content: '과제 제출은 언제까지인가요?',
      isResolved: false,
      isPrivate: true, // 비공개 질문
      order: 2 //
    }
  })

  // Comment 1 (Staff reply to QnA 1)
  await prisma.courseQnAComment.create({
    data: {
      courseQnAId: qna1.id,
      createdById: adminUser.id, // admin (교수/관리자)
      content: '2번 테스트케이스는 0을 입력하는 엣지 케이스입니다.',
      isCourseStaff: true,
      order: 1 //
    }
  })

  // Comment 2 (Student self-reply to QnA 2)
  await prisma.courseQnAComment.create({
    data: {
      courseQnAId: qna2.id,
      createdById: users[1].id, // user02 (학생 본인)
      content: '아, 공지사항을 확인했습니다. 감사합니다.',
      isCourseStaff: false,
      order: 1 //
    }
  })
}

const main = async () => {
  await createUsers()
  await createGroups()
  await createNotices()
  await createProblems()
  await createUpdateHistories()
  await createAssignments()
  await createContests()
  await createContestRecords()
  await createUserContests()
  await createWorkbooks()
  await createSubmissions()
  await createAnnouncements()
  await createAssignmentRecords()
  await createAssignmentProblemRecords()
  await createContestProblemRecords()
  await createContestQnA()
  await createNotifications()
  await createContestQnAComment()
  await createCourseQnA()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
