import {
  PrismaClient,
  Role,
  Level,
  Language,
  ResultStatus,
  type Group,
  type User,
  type Problem,
  type Tag,
  type Assignment,
  type Workbook,
  type Submission,
  type ProblemTestcase,
  type Announcement,
  type AssignmentRecord,
  type Contest,
  type ContestRecord,
  type ContestProblemRecord,
  type UserContest,
  ContestRole,
  type UpdateHistory,
  type Prisma
} from '@prisma/client'
import { hash } from 'argon2'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { GroupType } from '@admin/@generated'

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
const users: User[] = []
const problems: Problem[] = []
const updateHistories: UpdateHistory[] = []
let problemTestcases: ProblemTestcase[] = []
const assignments: Assignment[] = []
const endedAssignments: Assignment[] = []
const ongoingAssignments: Assignment[] = []
const upcomingAssignments: Assignment[] = []
const contests: Contest[] = []
const endedContests: Contest[] = []
const ongoingContests: Contest[] = []
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
      email: 'skkucodingplatform@gmail.com',
      lastLogin: new Date(),
      role: Role.SuperAdmin,
      studentId: '2024000000',
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
      groupName: 'Example Group',
      description:
        'This is an example group just for testing. This group should not be shown on production environment.',
      config: {
        showOnList: false,
        allowJoinFromSearch: false,
        allowJoinWithURL: false,
        requireApprovalBeforeJoin: false
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

  // create empty private group
  // 'showOnList'가 true
  let tempGroup = await prisma.group.create({
    data: {
      groupName: 'Example Private Group 2',
      description: 'This is an example private group just for testing.',
      config: {
        showOnList: true,
        allowJoinFromSearch: true,
        allowJoinWithURL: true,
        requireApprovalBeforeJoin: false
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

  // create empty private group
  // 'showOnList'가 true
  tempGroup = await prisma.group.create({
    data: {
      groupName: 'Example Private Group 3',
      description: 'This is an example private group just for testing.',
      config: {
        showOnList: true,
        allowJoinFromSearch: true,
        allowJoinWithURL: true,
        requireApprovalBeforeJoin: false
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
        isGroupLeader: user.username === 'user01'
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
        posterUrl: `https://skkuding.dev/open-graph.png`,
        summary: {
          참여대상: '성균관대 재학생이라면 누구나',
          진행방식: '온라인으로 진행',
          순위산정: '맞춘 문제 수와 penalty로 산정',
          문제형태: '이러한 방식으로 출제될 거에요',
          참여혜택: '참가자 전원 스타벅스 기프티콘 증정'
        },
        startTime: new Date('2024-01-01T00:00:00.000Z'),
        endTime: new Date('2028-01-01T23:59:59.000Z'),
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
        posterUrl: `https://skkuding.dev/open-graph.png`,
        summary: {
          참여대상: '성균관대학교 24학번 신입생',
          진행방식: '강의실에서 오프라인으로 진행',
          문제형태: '문제 형태가 다음과 같습니다.',
          참여혜택: '1등 10만원 / 2등 3만원'
        },
        startTime: new Date('2024-01-01T00:00:00.000Z'),
        endTime: new Date('2028-01-01T23:59:59.000Z'),
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
        posterUrl: `https://skkuding.dev/open-graph.png`,
        summary: {
          참여대상: '성균관대학교 24학번 신입생',
          진행방식: '강의실에서 오프라인으로 진행',
          순위산정: '맞춘 문제 수와 penalty를 종합하여 순위 산출',
          문제형태: '문제 형식은 다음과 같습니다.'
        },
        startTime: new Date('2024-01-01T00:00:00.000Z'),
        endTime: new Date('2028-01-01T23:59:59.000Z'),
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
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
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
        startTime: new Date('3024-01-01T00:00:00.000Z'),
        endTime: new Date('3025-01-01T23:59:59.000Z'),
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
        startTime: new Date('3024-01-01T00:00:00.000Z'),
        endTime: new Date('3025-01-01T23:59:59.000Z'),
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
        posterUrl: `https://skkuding.dev/open-graph.png`,
        summary: {
          참여대상: '소프트웨어학과 원전공/복수전공',
          진행방식: '온라인 진행 예정...?',
          순위산정: '맞춘 문제 수와 penalty를 기준으로 순위 산출',
          참여혜택: '1등 10만원 / 2등 5만원 / 3등 3만원 상당 기프티콘'
        },
        startTime: new Date('3024-01-01T00:00:00.000Z'),
        endTime: new Date('3025-01-01T23:59:59.000Z'),
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
        startTime: new Date('3024-01-01T00:00:00.000Z'),
        endTime: new Date('3025-01-01T23:59:59.000Z'),
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
        startTime: new Date('3024-01-01T00:00:00.000Z'),
        endTime: new Date('3025-01-01T23:59:59.000Z'),
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
        endTime: new Date('3025-01-01T23:59:59.000Z'),
        freezeTime: new Date('3024-01-01T00:00:00.000Z'),
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
    if (now < obj.data.startTime) {
      upcomingContests.push(contest)
    } else if (obj.data.endTime < now) {
      endedContests.push(contest)
    } else {
      ongoingContests.push(contest)
    }
  }

  // add problems to ongoing contest
  for (const [index, problem] of problems.slice(0, 3).entries()) {
    await prisma.contestProblem.create({
      data: {
        order: index,
        contestId: ongoingContests[0].id,
        problemId: problem.id,
        score: problem.id * 10
      }
    })
  }

  // add problems to finished contest
  for (const [index, problem] of problems.slice(3, 5).entries()) {
    await prisma.contestProblem.create({
      data: {
        order: index,
        contestId: endedContests[0].id,
        problemId: problem.id
      }
    })
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
        startTime: new Date('3024-01-01T00:00:00.000Z'),
        endTime: new Date('3025-01-01T23:59:59.000Z'),
        dueTime: new Date('3025-01-01T23:59:59.000Z'),
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
        startTime: new Date('3024-01-01T00:00:00.000Z'),
        endTime: new Date('3025-01-01T23:59:59.000Z'),
        dueTime: new Date('3025-01-01T23:59:59.000Z'),
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
        startTime: new Date('3024-01-01T00:00:00.000Z'),
        endTime: new Date('3025-01-01T23:59:59.000Z'),
        dueTime: new Date('3025-01-01T23:59:59.000Z'),
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
        startTime: new Date('3024-01-01T00:00:00.000Z'),
        endTime: new Date('3025-01-01T23:59:59.000Z'),
        dueTime: new Date('3025-01-01T23:59:59.000Z'),
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
        problemId: problem.id
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

  return contestProblemRecords
}

const createContestQnA = async () => {
  await prisma.contestQnA.createMany({
    data: [
      {
        contestId: 1,
        createdById: 2,
        title: 'QnA 1',
        order: 1,
        content: 'visible not answered QnA',
        isVisible: true
      },
      {
        contestId: 1,
        createdById: 2,
        order: 2,
        title: 'QnA 2',
        content: 'not visible not answered QnA'
      },
      {
        contestId: 1,
        createdById: 2,
        order: 3,
        title: 'QnA 3',
        content: 'visible answered QnA',
        answer: 'QnA 3 Answer',
        answeredById: 2,
        isVisible: true
      },
      {
        contestId: 1,
        createdById: 2,
        order: 4,
        title: 'QnA 4',
        content: 'not visible answered QnA',
        answer: 'QnA 4 Answer',
        answeredById: 2
      }
    ]
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
  await createContestProblemRecords()
  await createContestQnA()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
