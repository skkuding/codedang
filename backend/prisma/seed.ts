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
  type Contest,
  type Workbook,
  type Submission,
  type ProblemTestcase,
  type Announcement,
  type CodeDraft,
  type ContestRecord
} from '@prisma/client'
import { hash } from 'argon2'
import { readFile } from 'fs/promises'
import { join } from 'path'

const prisma = new PrismaClient()
const fixturePath = join(__dirname, '__fixtures__')

let superAdminUser: User
let managerUser: User
const users: User[] = []
let publicGroup: Group
let privateGroup: Group
const problems: Problem[] = []
const problemTestcases: ProblemTestcase[] = []
const finishedContests: Contest[] = []
const ongoingContests: Contest[] = []
const upcomingContests: Contest[] = []
const contestRecords: ContestRecord[] = []
const workbooks: Workbook[] = []
const privateWorkbooks: Workbook[] = []
const submissions: Submission[] = []
const announcements: Announcement[] = []

const createUsers = async () => {
  // create super admin user
  superAdminUser = await prisma.user.create({
    data: {
      username: 'super',
      password: await hash('Supersuper'),
      email: 'skkucodingplatform@gmail.com',
      lastLogin: new Date(),
      role: Role.SuperAdmin
    }
  })

  // create admin user
  await prisma.user.create({
    data: {
      username: 'admin',
      password: await hash('Adminadmin'),
      email: 'admin@example.com',
      lastLogin: new Date(),
      role: Role.Admin
    }
  })

  // create manager user
  managerUser = await prisma.user.create({
    data: {
      username: 'manager',
      password: await hash('Managermanager'),
      email: 'manager@example.com',
      lastLogin: new Date(),
      role: Role.Manager
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
        role: Role.User
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
}

const createGroups = async () => {
  // create public group
  // NOTE: ID가 1인 group은 모두에게 공개된 group
  publicGroup = await prisma.group.create({
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

  // create empty private group
  privateGroup = await prisma.group.create({
    data: {
      groupName: 'Example Private Group',
      description:
        'This is an example private group just for testing. Check if this group is not shown to users not registered to this group.',
      config: {
        showOnList: false,
        allowJoinFromSearch: false,
        allowJoinWithURL: true,
        requireApprovalBeforeJoin: true
      }
    }
  })
  await prisma.userGroup.create({
    data: {
      userId: managerUser.id,
      groupId: privateGroup.id,
      isGroupLeader: true
    }
  })

  // create empty private group
  // 'showOnList'가 true 이면서 가입시 사전 승인이 필요한 그룹을 테스트할 때 사용합니다
  let tempGroup = await prisma.group.create({
    data: {
      groupName: 'Example Private Group 2',
      description:
        'This is an example private group just for testing. Check if this group is not shown to users not registered to this group.',
      config: {
        showOnList: true,
        allowJoinFromSearch: true,
        allowJoinWithURL: true,
        requireApprovalBeforeJoin: true
      }
    }
  })
  await prisma.userGroup.create({
    data: {
      userId: managerUser.id,
      groupId: tempGroup.id,
      isGroupLeader: true
    }
  })

  // create empty private group
  // 'showOnList'가 true 이면서 가입시 사전 승인이 필요없는 그룹을 테스트할 때 사용합니다
  tempGroup = await prisma.group.create({
    data: {
      groupName: 'Example Private Group 3',
      description:
        'This is an example private group just for testing. Check if this group is not shown to users not registered to this group.',
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
      userId: managerUser.id,
      groupId: tempGroup.id,
      isGroupLeader: true
    }
  })

  const allUsers = await prisma.user.findMany()

  // add users to public group
  // group leader: user01
  for (const user of allUsers) {
    await prisma.userGroup.create({
      data: {
        userId: user.id,
        groupId: publicGroup.id,
        isGroupLeader: user.username === 'user01'
      }
    })
  }

  // add users to private group
  // group leader: user01
  // registered: user01, user03, user05, user07, user09
  for (const user of users) {
    await prisma.userGroup.create({
      data: {
        userId: user.id,
        groupId: privateGroup.id,
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
        createdById: superAdminUser.id,
        groupId: 1
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
        createdById: superAdminUser.id,
        groupId: 1
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
        createdById: superAdminUser.id,
        groupId: 1
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
        createdById: managerUser.id,
        groupId: 1
      },
      {
        title: '아주 중요한 공지사항 (5)',
        content: '<p>사실 별 내용 없어요 😇</p>',
        createdById: superAdminUser.id,
        groupId: 1
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
        createdById: superAdminUser.id,
        groupId: 1
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
        createdById: superAdminUser.id,
        groupId: 1
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
        createdById: managerUser.id,
        groupId: 1
      },
      {
        title: '아주 중요한 공지사항 (9)',
        content: '<p>사실 별 내용 없어요 😇</p>',
        createdById: superAdminUser.id,
        groupId: 1
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
        createdById: superAdminUser.id,
        groupId: 1
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
        createdById: superAdminUser.id,
        groupId: 1
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
        createdById: managerUser.id,
        groupId: 1
      },
      {
        title: '아주 중요한 공지사항 (13)',
        content: '<p>사실 별 내용 없어요 😇</p>',
        createdById: superAdminUser.id,
        groupId: 1
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
        createdById: superAdminUser.id,
        groupId: 1
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
        createdById: superAdminUser.id,
        groupId: 1
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
        createdById: managerUser.id,
        groupId: 1
      },
      {
        title: '아주 중요한 공지사항 (17)',
        content: '<p>사실 별 내용 없어요 😇</p>',
        createdById: superAdminUser.id,
        groupId: 1
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
        createdById: superAdminUser.id,
        groupId: 1
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
        createdById: superAdminUser.id,
        groupId: 1
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
        createdById: managerUser.id,
        groupId: 1
      },
      {
        title: '아주 중요한 공지사항 (21)',
        content: '<p>사실 별 내용 없어요 😇</p>',
        createdById: superAdminUser.id,
        groupId: 1
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
        createdById: superAdminUser.id,
        groupId: 1
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
        createdById: superAdminUser.id,
        groupId: 1
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
        createdById: managerUser.id,
        groupId: 1
      }
    ]
  })
}

const createProblems = async () => {
  problems.push(
    await prisma.problem.create({
      data: {
        title: '정수 더하기',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
        description: await readFile(
          join(fixturePath, 'problem/1-description.html'),
          'utf-8'
        ),
        difficulty: Level.Level1,
        inputDescription: await readFile(
          join(fixturePath, 'problem/1-input.html'),
          'utf-8'
        ),
        outputDescription: await readFile(
          join(fixturePath, 'problem/1-output.html'),
          'utf-8'
        ),
        languages: [Language.C, Language.Cpp, Language.Java, Language.Python3],
        hint: '',
        timeLimit: 2000,
        memoryLimit: 512,
        source: ''
      }
    })
  )

  problems.push(
    await prisma.problem.create({
      data: {
        title: '가파른 경사',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
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
        source: 'Canadian Computing Competition(CCC) 2012 Junior 2번'
      }
    })
  )

  problems.push(
    await prisma.problem.create({
      data: {
        title: '회전 표지판',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
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
        source: 'Canadian Computing Competition(CCC) 2013 Junior 2번'
      }
    })
  )

  problems.push(
    await prisma.problem.create({
      data: {
        title: '붕어빵',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
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
        source: 'USACO 2012 US Open Bronze 1번'
      }
    })
  )

  problems.push(
    await prisma.problem.create({
      data: {
        title: '채권관계',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
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
        source: 'ICPC Regionals NCPC 2009 B번'
      }
    })
  )

  problems.push(
    await prisma.problem.create({
      data: {
        title: '타일 교환',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
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
        source: 'USACO November 2011 Silver 3번'
      }
    })
  )

  problems.push(
    await prisma.problem.create({
      data: {
        title: '천재 디자이너',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
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
        source: 'COCI 2019/2020 Contest #3 2번'
      }
    })
  )

  problems.push(
    await prisma.problem.create({
      data: {
        title: '사이클 분할',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
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
        source: 'ICPC Regionals SEERC 2019 J번'
      }
    })
  )

  // add simple testcases
  for (const problem of problems) {
    problemTestcases.push(
      await prisma.problemTestcase.create({
        data: {
          problemId: problem.id,
          input: 'input.in',
          output: 'output.out'
        }
      })
    )
  }

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

const createContests = async () => {
  const contestData = [
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
        groupId: publicGroup.id,
        startTime: new Date('2024-01-01T00:00:00.000Z'),
        endTime: new Date('2028-01-01T23:59:59.000Z'),
        config: {
          isVisible: true,
          isRankVisible: true
        }
      }
    },
    {
      data: {
        title: '24년도 소프트웨어학과 신입생 입학 테스트1',
        description: '<p>이 대회는 현재 진행 중입니다 !</p>',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
        startTime: new Date('2024-01-01T00:00:00.000Z'),
        endTime: new Date('2028-01-01T23:59:59.000Z'),
        config: {
          isVisible: true,
          isRankVisible: true
        }
      }
    },
    {
      data: {
        title: '24년도 소프트웨어학과 신입생 입학 테스트2',
        description: '<p>이 대회는 현재 진행 중입니다 !</p>',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
        startTime: new Date('2024-01-01T00:00:00.000Z'),
        endTime: new Date('2028-01-01T23:59:59.000Z'),
        config: {
          isVisible: true,
          isRankVisible: true
        }
      }
    },
    {
      data: {
        title: '24년도 소프트웨어학과 신입생 입학 테스트3',
        description: '<p>이 대회는 현재 진행 중입니다 !</p>',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
        startTime: new Date('2024-01-01T00:00:00.000Z'),
        endTime: new Date('2028-01-01T23:59:59.000Z'),
        config: {
          isVisible: true,
          isRankVisible: true
        }
      }
    },
    {
      data: {
        title: '24년도 아늑배 스파게티 코드 만들기 대회',
        description: '<p>이 대회는 현재 진행 중입니다 ! (private group)</p>',
        createdById: superAdminUser.id,
        groupId: privateGroup.id,
        startTime: new Date('2024-01-01T00:00:00.000Z'),
        endTime: new Date('2028-01-01T23:59:59.000Z'),
        config: {
          isVisible: true,
          isRankVisible: true
        }
      }
    },
    // Finished Contests
    {
      data: {
        title: 'Long Time Ago Contest',
        description: '<p>이 대회는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        config: {
          isVisible: true,
          isRankVisible: false
        }
      }
    },
    {
      data: {
        title: '23년도 소프트웨어학과 신입생 입학 테스트',
        description: '<p>이 대회는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        config: {
          isVisible: true,
          isRankVisible: true
        }
      }
    },
    {
      data: {
        title: '소프트의 아침',
        description: '<p>이 대회는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        config: {
          isVisible: true,
          isRankVisible: false
        }
      }
    },
    {
      data: {
        title: '소프트의 낮',
        description: '<p>이 대회는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        config: {
          isVisible: true,
          isRankVisible: false
        }
      }
    },
    {
      data: {
        title: '소프트의 밤',
        description: '<p>이 대회는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        config: {
          isVisible: true,
          isRankVisible: false
        }
      }
    },
    {
      data: {
        title: '2023 SKKU 프로그래밍 대회',
        description: '<p>이 대회는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        config: {
          isVisible: true,
          isRankVisible: false
        }
      }
    },
    {
      data: {
        title: '소프트의 오전',
        description: '<p>이 대회는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        config: {
          isVisible: true,
          isRankVisible: false
        }
      }
    },
    {
      data: {
        title: '소프트의 오후',
        description: '<p>이 대회는 오래 전에 끝났어요</p>',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        config: {
          isVisible: true,
          isRankVisible: false
        }
      }
    },
    {
      data: {
        title: '23년도 아늑배 스파게티 코드 만들기 대회',
        description: '<p>이 대회는 오래 전에 끝났어요 (private group)</p>',
        createdById: superAdminUser.id,
        groupId: privateGroup.id,
        startTime: new Date('2023-01-01T00:00:00.000Z'),
        endTime: new Date('2024-01-01T23:59:59.000Z'),
        config: {
          isVisible: true,
          isRankVisible: true
        }
      }
    },
    // Upcoming Contests
    {
      data: {
        title: 'Future Contest',
        description: '<p>이 대회는 언젠가 열리겠죠...?</p>',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
        startTime: new Date('3024-01-01T00:00:00.000Z'),
        endTime: new Date('3025-01-01T23:59:59.000Z'),
        config: {
          isVisible: true,
          isRankVisible: true
        }
      }
    },
    {
      data: {
        title: '2024 SKKU 프로그래밍 대회',
        description: '<p>이 대회는 언젠가 열리겠죠...?</p>',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
        startTime: new Date('3024-01-01T00:00:00.000Z'),
        endTime: new Date('3025-01-01T23:59:59.000Z'),
        config: {
          isVisible: true,
          isRankVisible: true
        }
      }
    },
    {
      data: {
        title: '2024 스꾸딩 프로그래밍 대회',
        description:
          '<p>이 대회는 언젠가 열리겠죠...? isVisible이 false인 contest입니다</p>',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
        startTime: new Date('3024-01-01T00:00:00.000Z'),
        endTime: new Date('3025-01-01T23:59:59.000Z'),
        config: {
          isVisible: false,
          isRankVisible: true
        }
      }
    },
    {
      data: {
        title: '25년도 아늑배 스파게티 코드 만들기 대회',
        description: '<p>이 대회는 언젠가 열리겠죠...? (private group)</p>',
        createdById: superAdminUser.id,
        groupId: privateGroup.id,
        startTime: new Date('3024-01-01T00:00:00.000Z'),
        endTime: new Date('3025-01-01T23:59:59.000Z'),
        config: {
          isVisible: true,
          isRankVisible: true
        }
      }
    }
  ]

  const now = new Date()
  for (const obj of contestData) {
    const contest = await prisma.contest.create(obj)
    if (now < obj.data.startTime) {
      upcomingContests.push(contest)
    } else if (obj.data.endTime < now) {
      finishedContests.push(contest)
    } else {
      ongoingContests.push(contest)
    }
  }

  // add problems to contest
  for (const problem of problems) {
    await prisma.contestProblem.create({
      data: {
        order: problem.id,
        contestId: ongoingContests[0].id,
        problemId: problem.id
      }
    })
  }

  for (const user of users) {
    const contestRecord = await prisma.contestRecord.create({
      data: {
        userId: user.id,
        contestId: ongoingContests[0].id,
        penalty: ongoingContests[0].startTime
      }
    })
    contestRecords.push(contestRecord)
  }
}

const createWorkbooks = async () => {
  for (let i = 1; i <= 3; i++) {
    workbooks.push(
      await prisma.workbook.create({
        data: {
          title: '모의대회 문제집',
          description: '모의대회 문제들을 모아뒀습니다!',
          createdById: superAdminUser.id,
          groupId: publicGroup.id
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
          groupId: privateGroup.id
        }
      })
    )
  }

  for (const problem of problems) {
    await prisma.workbookProblem.create({
      data: {
        order: problem.id,
        workbookId: workbooks[0].id,
        problemId: problem.id
      }
    })
    await prisma.workbookProblem.create({
      data: {
        order: problem.id,
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
      submissionId: submissions[0].id,
      problemTestcaseId: problemTestcases[0].id,
      result: ResultStatus.Accepted,
      cpuTime: 12345,
      memoryUsage: 12345
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[0].id
    },
    data: { result: ResultStatus.Accepted }
  })
  await prisma.problem.update({
    where: {
      id: problems[0].id
    },
    data: {
      submissionCount: 1,
      acceptedCount: 1,
      acceptedRate: 1 / 1
    }
  })
  const contestProblem = await prisma.contestProblem.findUniqueOrThrow({
    where: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      contestId_problemId: {
        contestId: ongoingContests[0].id,
        problemId: problems[0].id
      }
    }
  })
  await prisma.contestRecord.update({
    where: {
      id: contestRecords[0].id
    },
    data: {
      score: contestProblem.score,
      lastAccepted: submissions[0].createTime,
      penalty: submissions[0].createTime
    }
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
      submissionId: submissions[1].id,
      problemTestcaseId: problemTestcases[1].id,
      result: ResultStatus.WrongAnswer,
      cpuTime: 12345,
      memoryUsage: 12345
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[1].id
    },
    data: { result: ResultStatus.WrongAnswer }
  })
  await prisma.problem.update({
    where: {
      id: problems[1].id
    },
    data: {
      submissionCount: 1,
      acceptedCount: 0,
      acceptedRate: 0 / 1
    }
  })
  await prisma.contestRecord.update({
    where: {
      id: contestRecords[1].id
    },
    data: {
      unaccepted: 1,
      penalty: new Date(contestRecords[1].penalty.getTime() + 5 * 60 * 1000)
    }
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
      submissionId: submissions[2].id,
      problemTestcaseId: problemTestcases[2].id,
      result: ResultStatus.CompileError,
      cpuTime: 12345,
      memoryUsage: 12345
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[2].id
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
      submissionId: submissions[3].id,
      problemTestcaseId: problemTestcases[3].id,
      result: ResultStatus.RuntimeError,
      cpuTime: 12345,
      memoryUsage: 12345
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[3].id
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
      submissionId: submissions[4].id,
      problemTestcaseId: problemTestcases[4].id,
      result: ResultStatus.TimeLimitExceeded,
      cpuTime: 12345,
      memoryUsage: 12345
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[4].id
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
      submissionId: submissions[5].id,
      problemTestcaseId: problemTestcases[5].id,
      result: ResultStatus.MemoryLimitExceeded,
      cpuTime: 12345,
      memoryUsage: 12345
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[5].id
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
      submissionId: submissions[6].id,
      problemTestcaseId: problemTestcases[6].id,
      result: ResultStatus.OutputLimitExceeded,
      cpuTime: 12345,
      memoryUsage: 12345
    }
  })
  await prisma.submission.update({
    where: {
      id: submissions[6].id
    },
    data: { result: ResultStatus.OutputLimitExceeded }
  })
}

const createAnnouncements = async () => {
  for (let i = 0; i < 5; ++i) {
    announcements.push(
      await prisma.announcement.create({
        data: {
          content: `Announcement_0_${i}`,
          problemId: problems[i].id
        }
      })
    )
  }

  for (let i = 0; i < 5; ++i) {
    announcements.push(
      await prisma.announcement.create({
        data: {
          content: `Announcement_1_${i}`,
          problemId: problems[i].id
        }
      })
    )
  }
}

const createCodeDrafts = async () => {
  const codeDrafts: CodeDraft[] = []

  // Assuming you want to create a CodeDraft for 'user01' and problem combination
  const user = users[0]
  for (const problem of problems) {
    // Skip problemId: 8
    if (problem.id === 8) {
      continue
    }
    const codeDraft = await prisma.codeDraft.create({
      data: {
        userId: user.id,
        problemId: problem.id,
        // Example template (modify as needed)
        template: [
          {
            language: Language.Cpp, // Example language
            code: [
              {
                id: 1,
                text: '#include <bits/stdc++.h>\nusing namespace std;\nint main() {\n',
                locked: true
              },
              {
                id: 2,
                text: '    cout << "hello, world" << endl;\n',
                locked: false
              },
              {
                id: 3,
                text: '    return 0;\n}\n',
                locked: true
              }
              // ... add more code blocks if needed
            ]
          },
          {
            language: Language.Python3,
            code: [
              {
                id: 1,
                text: 'print("hello, world")\n',
                locked: false
              }
            ]
          }
        ]
      }
    })
    codeDrafts.push(codeDraft)
  }

  return codeDrafts
}

const main = async () => {
  await createUsers()
  await createGroups()
  await createNotices()
  await createProblems()
  await createContests()
  await createWorkbooks()
  await createSubmissions()
  await createAnnouncements()
  await createCodeDrafts()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
