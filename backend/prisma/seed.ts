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
  type Announcement
} from '@prisma/client'
import { hash } from 'argon2'
import * as dayjs from 'dayjs'

const prisma = new PrismaClient()

let superAdminUser: User
let managerUser: User
const users: User[] = []
let publicGroup: Group
let privateGroup: Group
const problems: Problem[] = []
const problemTestcases: ProblemTestcase[] = []
let contest: Contest
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
      createdById: superAdminUser.id,
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
      createdById: managerUser.id,
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
      createdById: managerUser.id,
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
      createdById: managerUser.id,
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
        title: '가파른 경사',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
        description: `<p>
  처음으로 인사캠을 방문한 율전이는 너무나 가파른 오르막길에 놀랐다. 이를 본
  율전이는 인사캠의 경사가 얼마나 심한지 알기 위해 네 지점의 높이를 측정하기로
  마음먹었다. 이때 율전이는 측정한 높이를 다음과 같이 네 가지 경우로 나누려고
  한다. (단, 측정한 순서는 유지한다)
</p>
<ol>
  <li>
    <p>
      4개의 강한 단조증가(strictly increasing)하는 높이를 읽은 경우 ("Uphill")
      (예: 3, 4, 7, 9)
    </p>
  </li>
  <li>
    <p>
      4개의 강한 단조감소(strictly decreasing)하는 높이를 읽은 경우
      ("Downhill") (예: 9, 6, 5, 2)
    </p>
  </li>
  <li><p>4개의 일정한 높이를 읽은 경우 ("Flat Land") (예: 5, 5, 5, 5)</p></li>
  <li><p>위 경우 중 어느 것에도 속하지 않는 경우 ("Unknown")</p></li>
</ol>
<p>율전이가 측정한 높이가 주어졌을 때, 어떤 경우에 속하는지 출력하라.</p>`,
        difficulty: Level.Level1, // TODO: use enum
        inputDescription: `<p>
  네 줄에 걸쳐 높이
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <msub>
                <mi>h</mi>
                <mi>i</mi>
              </msub>
            </mrow>
            <annotation encoding="application/x-tex">h_i</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.84444em; vertical-align: -0.15em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">h</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mathdefault mtight">i</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  </span>
  가 주어진다.
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mo>(</mo>
              <mn>0</mn>
              <mo>&amp;lt;</mo>
              <msub>
                <mi>h</mi>
                <mi>i</mi>
              </msub>
              <mo>≤</mo>
              <mn>100</mn>
              <mo>)</mo>
            </mrow>
            <annotation encoding="application/x-tex">
              (0&amp;lt;h_i \\le 100)
            </annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mopen">(</span>
          <span class="mord">0</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">&lt;</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.84444em; vertical-align: -0.15em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">h</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mathdefault mtight">i</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord">1</span>
          <span class="mord">0</span>
          <span class="mord">0</span>
          <span class="mclose">)</span>
        </span>
      </span>
    </span>
  </span>
</p>`,
        outputDescription: `<p>
  만약 네 개의 높이가 강한 단조증가(strictly increasing)면
  <code>Uphill</code>
  , 강한 단조감소(strictly decreasing)면
  <code>Downhill</code>
  을 출력한다. 또한 높이가 일정하다면
  <code>Flat Land</code>
  를 출력하고, 어느 경우에도 속하지 않으면
  <code>Unknown</code>
  을 출력한다.
</p>`,
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
        description: `<p style="margin-left: 0px">
  예술가 민정이는 바람에 자유롭게 회전해도 알아볼 수 있는 표지판을 만들려고
  한다. 이러한 표지판을 만들기 위해 민정이는 180도 회전해도 변하지 않는 문자인
  H, I, N, O, S, X, Z만을 사용할 수 있다.
</p>
<p>
  단어를 보고, 그 단어가 회전 표지판에 사용될 수 있는지를 결정하는 프로그램을
  작성하라.
</p>`,
        difficulty: Level.Level1,
        inputDescription: `<p>
  <span style="color: rgb(51, 51, 51)">
    공백 없이 알파벳 대문자로만 이루어진 하나의 문자열
    <span>
      <span class="katex">
        <span class="katex-mathml">
          <math>
            <semantics>
              <mrow><mi>S</mi></mrow>
              <annotation encoding="application/x-tex">S</annotation>
            </semantics>
          </math>
        </span>
        <span class="katex-html" aria-hidden="true">
          <span class="base">
            <span
              class="strut"
              style="height: 0.68333em; vertical-align: 0em"
            ></span>
            <span class="mord mathdefault" style="margin-right: 0.05764em">
              S
            </span>
          </span>
        </span>
      </span>
    </span>
    가 주어진다. 문자열의 길이는 30을 넘지 않는다.
  </span>
  <br />
</p>`,
        outputDescription: `<p>
  <span style="color: rgb(51, 51, 51)">
    단어
    <span>
      <span class="katex">
        <span class="katex-mathml">
          <math>
            <semantics>
              <mrow><mi>S</mi></mrow>
              <annotation encoding="application/x-tex">S</annotation>
            </semantics>
          </math>
        </span>
        <span class="katex-html" aria-hidden="true">
          <span class="base">
            <span
              class="strut"
              style="height: 0.68333em; vertical-align: 0em"
            ></span>
            <span class="mord mathdefault" style="margin-right: 0.05764em">
              S
            </span>
          </span>
        </span>
      </span>
    </span>
    가 회전 표지판에 사용될 수 있다면
    <code>YES</code>
    를, 사용될 수 없다면
    <code>NO</code>
    를 출력한다.
  </span>
  <br />
</p>`,
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
        description: `<p>
  겨울이 되어 길거리 곳곳에서 붕어빵을 팔고 있다. 성균이가 운영하는 붕어빵 가게
  앞에는
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>N</mi></mrow>
            <annotation encoding="application/x-tex">N</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
        </span>
      </span>
    </span>
  </span>
  명의 손님이 한 줄로 서 있다. 각 손님은
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <msub>
                <mi>a</mi>
                <mi>i</mi>
              </msub>
            </mrow>
            <annotation encoding="application/x-tex">a_i</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.58056em; vertical-align: -0.15em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">a</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mathdefault mtight">i</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  </span>
  개의 붕어빵을 사려고 한다.
</p>
<p>
  성균이는 같은 개수의 붕어빵을 구매하는 손님들이 연속되어 있으면 담는 게 더
  수월하리라 생각한다. 따라서 특정 손님을 정하고, 그 손님이 사려고 하는 붕어빵의
  개수와 같은 개수의 붕어빵을 사려고 하는 손님들을 줄에서 모두 내보내려고 한다.
</p>
<p style="">
  어떤 특정 개수의 붕어빵을 사려고 하는 사람들을 줄에서 내보내야, 같은 개수의
  붕어빵을 사려고 하는 사람들이 연속된 구간 중 가장 긴 것의 길이가 최대가 되는지
  구하는 프로그램을 작성하라.
</p>`,
        difficulty: Level.Level2,
        inputDescription: `<p>
  첫째 줄에 손님 수
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>N</mi></mrow>
            <annotation encoding="application/x-tex">N</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
        </span>
      </span>
    </span>
  </span>
  이 주어진다.
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mo>(</mo>
              <mn>1</mn>
              <mo>≤</mo>
              <mi>N</mi>
              <mo>≤</mo>
              <mn>1000</mn>
              <mo>)</mo>
            </mrow>
            <annotation encoding="application/x-tex">
              (1 \\le N \\le 1000)
            </annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mopen">(</span>
          <span class="mord">1</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.8193em; vertical-align: -0.13597em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord">1</span>
          <span class="mord">0</span>
          <span class="mord">0</span>
          <span class="mord">0</span>
          <span class="mclose">)</span>
        </span>
      </span>
    </span>
  </span>
  둘째 줄부터
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>N</mi></mrow>
            <annotation encoding="application/x-tex">N</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
        </span>
      </span>
    </span>
  </span>
  개의 줄에 걸쳐 가게 앞에 서있는 순서대로 각 손님이 사려고 하는 붕어빵의 개수
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <msub>
                <mi>a</mi>
                <mi>i</mi>
              </msub>
            </mrow>
            <annotation encoding="application/x-tex">a_i</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.58056em; vertical-align: -0.15em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">a</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mathdefault mtight">i</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  </span>
  가 주어진다.
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mo>(</mo>
              <mn>0</mn>
              <mo>≤</mo>
              <msub>
                <mi>a</mi>
                <mi>i</mi>
              </msub>
              <mo>≤</mo>
              <mn>1</mn>
              <mo separator="true">,</mo>
              <mn>000</mn>
              <mo separator="true">,</mo>
              <mn>000</mn>
              <mo>)</mo>
            </mrow>
            <annotation encoding="application/x-tex">
              (0 \\le a_i \\le 1,000,000)
            </annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mopen">(</span>
          <span class="mord">0</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.78597em; vertical-align: -0.15em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">a</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mathdefault mtight">i</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord">1</span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">0</span>
          <span class="mord">0</span>
          <span class="mord">0</span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">0</span>
          <span class="mord">0</span>
          <span class="mord">0</span>
          <span class="mclose">)</span>
        </span>
      </span>
    </span>
  </span>
  항상 두 개 이상의 서로 다른
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <msub>
                <mi>a</mi>
                <mi>i</mi>
              </msub>
            </mrow>
            <annotation encoding="application/x-tex">a_i</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.58056em; vertical-align: -0.15em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">a</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mathdefault mtight">i</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  </span>
  가 존재한다
</p>`,
        outputDescription: `<p>
  성균이가 만들 수 있는 같은 개수의 붕어빵을 원하는 손님들의 연속된 구간 중,
  가장 긴 것의 길이를 출력한다.
</p>`,
        languages: [Language.Java],
        hint: `<p>
  줄에 서 있는 9명의 손님들이 사려고 하는 붕어빵의 개수는 2, 7, 3, 7, 7, 3, 7,
  5, 7이다.
</p>
<p>
  3개를 사려고 하는 사람을 줄에서 내보내면, 줄은 2, 7, 7, 7, 7, 5, 7이 된다. 이
  때 7개를 사려고 하는 사람 4명이 연속된 구간이 가장 길이가 긴 구간이다.
</p>`,
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
        description: `<p>
  드디어 동아리방이 생긴 NPC는 동아리방 물품을 구입하는 데 한창이다. 돈에는
  신경쓰지 않고 물품 구입에 너무나 열중한 나머지, NPC 부원들이 서로에게 빚을
  졌다. NPC에서 돈을 갚을 때에는 자신과 친분 관계에 있는 사람한테만 돈을 갚을 수
  있다. 다음 학기 활동 전에는 모든 사람의 빚을 없애야 정상적인 활동이
  가능하기에, 빚을 없애는 것이 가능한지 확인하려고 한다.
</p>`,
        difficulty: Level.Level2,
        inputDescription: `<p>
  첫째 줄에는 각각 동아리 부원 수, 친분 관계의 수를 나타내는 두 개의 정수
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mi>N</mi>
              <mo>(</mo>
              <mn>2</mn>
              <mo>≤</mo>
              <mi>N</mi>
              <mo>≤</mo>
              <mn>10</mn>
              <mo separator="true">,</mo>
              <mn>000</mn>
              <mo>)</mo>
              <mo separator="true">,</mo>
              <mi>M</mi>
              <mo>(</mo>
              <mn>0</mn>
              <mo>≤</mo>
              <mi>M</mi>
              <mo>≤</mo>
              <mn>50</mn>
              <mo separator="true">,</mo>
              <mn>000</mn>
              <mo>)</mo>
            </mrow>
            <annotation encoding="application/x-tex">
              N(2 \\le N \\le 10,000), M(0 \\le M \\le 50,000)
            </annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
          <span class="mopen">(</span>
          <span class="mord">2</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.8193em; vertical-align: -0.13597em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord">1</span>
          <span class="mord">0</span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">0</span>
          <span class="mord">0</span>
          <span class="mord">0</span>
          <span class="mclose">)</span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            M
          </span>
          <span class="mopen">(</span>
          <span class="mord">0</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.8193em; vertical-align: -0.13597em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            M
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord">5</span>
          <span class="mord">0</span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">0</span>
          <span class="mord">0</span>
          <span class="mord">0</span>
          <span class="mclose">)</span>
        </span>
      </span>
    </span>
  </span>
  이 주어진다.
</p>
<p>
  둘째 줄부터
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>N</mi></mrow>
            <annotation encoding="application/x-tex">N</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
        </span>
      </span>
    </span>
  </span>
  개의 줄에 걸쳐 각 사람이 갚거나 받아야 하는 돈을 나타내는 정수
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mi>k</mi>
              <mo>(</mo>
              <mo>−</mo>
              <mn>10</mn>
              <mo separator="true">,</mo>
              <mn>000</mn>
              <mo>≤</mo>
              <mi>k</mi>
              <mo>≤</mo>
              <mn>10</mn>
              <mo separator="true">,</mo>
              <mn>000</mn>
              <mo>)</mo>
            </mrow>
            <annotation encoding="application/x-tex">
              k(-10,000 \\le k \\le 10,000)
            </annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.03148em">
            k
          </span>
          <span class="mopen">(</span>
          <span class="mord">−</span>
          <span class="mord">1</span>
          <span class="mord">0</span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">0</span>
          <span class="mord">0</span>
          <span class="mord">0</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.83041em; vertical-align: -0.13597em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.03148em">
            k
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord">1</span>
          <span class="mord">0</span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">0</span>
          <span class="mord">0</span>
          <span class="mord">0</span>
          <span class="mclose">)</span>
        </span>
      </span>
    </span>
  </span>
  가 주어진다.
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mi>k</mi>
              <mo>&amp;lt;</mo>
              <mn>0</mn>
            </mrow>
            <annotation encoding="application/x-tex">k&amp;lt;0</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.73354em; vertical-align: -0.0391em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.03148em">
            k
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">&lt;</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.64444em; vertical-align: 0em"
          ></span>
          <span class="mord">0</span>
        </span>
      </span>
    </span>
  </span>
  인 경우는 빚을 졌다는 뜻이다.
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>N</mi></mrow>
            <annotation encoding="application/x-tex">N</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
        </span>
      </span>
    </span>
  </span>
  개의 정수
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>k</mi></mrow>
            <annotation encoding="application/x-tex">k</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.69444em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.03148em">
            k
          </span>
        </span>
      </span>
    </span>
  </span>
  의 합은 0이다.
</p>
<p>
  이어서
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>M</mi></mrow>
            <annotation encoding="application/x-tex">M</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            M
          </span>
        </span>
      </span>
    </span>
  </span>
  개의 줄에 걸쳐 두 개의 정수
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mi>x</mi>
              <mo separator="true">,</mo>
              <mi>y</mi>
              <mo>(</mo>
              <mn>0</mn>
              <mo>≤</mo>
              <mi>x</mi>
              <mo>&amp;lt;</mo>
              <mi>y</mi>
              <mo>≤</mo>
              <mi>N</mi>
              <mo>−</mo>
              <mn>1</mn>
              <mo>)</mo>
            </mrow>
            <annotation encoding="application/x-tex">
              x,y(0 \\le x&amp;lt;y \\le N-1)
            </annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord mathdefault">x</span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord mathdefault" style="margin-right: 0.03588em">
            y
          </span>
          <span class="mopen">(</span>
          <span class="mord">0</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.5782em; vertical-align: -0.0391em"
          ></span>
          <span class="mord mathdefault">x</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">&lt;</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.83041em; vertical-align: -0.19444em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.03588em">
            y
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.76666em; vertical-align: -0.08333em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
          <span class="mspace" style="margin-right: 0.222222em"></span>
          <span class="mbin">−</span>
          <span class="mspace" style="margin-right: 0.222222em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord">1</span>
          <span class="mclose">)</span>
        </span>
      </span>
    </span>
  </span>
  가 주어지며,
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mi>x</mi>
              <mo separator="true">,</mo>
              <mi>y</mi>
            </mrow>
            <annotation encoding="application/x-tex">x,y</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.625em; vertical-align: -0.19444em"
          ></span>
          <span class="mord mathdefault">x</span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord mathdefault" style="margin-right: 0.03588em">
            y
          </span>
        </span>
      </span>
    </span>
  </span>
  는 서로 친분관계이다.
</p>`,
        outputDescription: `<p>
  모든 사람의 빚을 없애는 것이 가능하면
  <code>POSSIBLE</code>
  , 불가능하면
  <code>IMPOSSIBLE</code>
  을 출력한다.
</p>`,
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
        description: `<p>
  민수는 최근에 마트에서 구입한 정사각형 타일들을 사용하여 동아리방 바닥을
  리모델링하려고 한다. 하지만 민수는 구입하기 전에 연구실의 크기를 제대로
  측정하지 않아, 타일 중 일부를 다른 크기의 새로운 정사각형 타일들로 교환해야
  한다.
</p>
<p>
  민수가 구매한
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>N</mi></mrow>
            <annotation encoding="application/x-tex">N</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
        </span>
      </span>
    </span>
  </span>
  개의 정사각형 타일들의 길이는 각각
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <msub>
                <mi>a</mi>
                <mn>1</mn>
              </msub>
              <mo separator="true">,</mo>
              <mi mathvariant="normal">.</mi>
              <mi mathvariant="normal">.</mi>
              <mi mathvariant="normal">.</mi>
              <mo separator="true">,</mo>
              <msub>
                <mi>a</mi>
                <mi>N</mi>
              </msub>
            </mrow>
            <annotation encoding="application/x-tex">a_1,...,a_N</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.625em; vertical-align: -0.19444em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">a</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">1</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">.</span>
          <span class="mord">.</span>
          <span class="mord">.</span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">
            <span class="mord mathdefault">a</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.328331em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span
                          class="mord mathdefault mtight"
                          style="margin-right: 0.10903em"
                        >
                          N
                        </span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  </span>
  이다. 민수는 타일들의 총면적이
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>M</mi></mrow>
            <annotation encoding="application/x-tex">M</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            M
          </span>
        </span>
      </span>
    </span>
  </span>
  이 되도록 이들 중 일부를 새로운 정사각형 타일로 교환하려 한다.
</p>
<p>
  때마침 마트에서 현재 특별 이벤트를 진행해서, 길이
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <msub>
                <mi>a</mi>
                <mi>i</mi>
              </msub>
            </mrow>
            <annotation encoding="application/x-tex">a_i</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.58056em; vertical-align: -0.15em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">a</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mathdefault mtight">i</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  </span>
  의 타일을 길이
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <msub>
                <mi>b</mi>
                <mi>i</mi>
              </msub>
            </mrow>
            <annotation encoding="application/x-tex">b_i</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.84444em; vertical-align: -0.15em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">b</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mathdefault mtight">i</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  </span>
  로 변경할 때
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mi mathvariant="normal">∣</mi>
              <msub>
                <mi>a</mi>
                <mi>i</mi>
              </msub>
              <mo>−</mo>
              <msub>
                <mi>b</mi>
                <mi>i</mi>
              </msub>
              <msup>
                <mi mathvariant="normal">∣</mi>
                <mn>2</mn>
              </msup>
            </mrow>
            <annotation encoding="application/x-tex">|a_i-b_i|^2</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord">∣</span>
          <span class="mord">
            <span class="mord mathdefault">a</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mathdefault mtight">i</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mspace" style="margin-right: 0.222222em"></span>
          <span class="mbin">−</span>
          <span class="mspace" style="margin-right: 0.222222em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 1.064108em; vertical-align: -0.25em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">b</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mathdefault mtight">i</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mord">
            <span class="mord">∣</span>
            <span class="msupsub">
              <span class="vlist-t">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.814108em">
                    <span class="" style="top: -3.063em; margin-right: 0.05em">
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">2</span>
                      </span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  </span>
  만큼의 비용을 지불하면 된다. 그러나 이 이벤트는 직접 구입한 타일에만 적용되기
  때문에 다른 타일을 교환하여 얻은 타일은 교환할 수 없다.
</p>
<p>
  이때, 타일들의 총면적이
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>M</mi></mrow>
            <annotation encoding="application/x-tex">M</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            M
          </span>
        </span>
      </span>
    </span>
  </span>
  이 되도록 타일 교환을 하는 데에 필요한 최소 비용을 구하는 프로그램을 작성하라.
</p>`,
        difficulty: Level.Level3,
        inputDescription: `<p>
  첫째 줄에
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mi>N</mi>
              <mo>(</mo>
              <mn>1</mn>
              <mo>≤</mo>
              <mi>N</mi>
              <mo>≤</mo>
              <mn>10</mn>
              <mo>)</mo>
            </mrow>
            <annotation encoding="application/x-tex">
              N(1 \\le N \\le 10)
            </annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
          <span class="mopen">(</span>
          <span class="mord">1</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.8193em; vertical-align: -0.13597em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord">1</span>
          <span class="mord">0</span>
          <span class="mclose">)</span>
        </span>
      </span>
    </span>
  </span>
  과
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mi>M</mi>
              <mo>(</mo>
              <mn>1</mn>
              <mo>≤</mo>
              <mi>M</mi>
              <mo>≤</mo>
              <mn>10</mn>
              <mo separator="true">,</mo>
              <mn>000</mn>
              <mo>)</mo>
            </mrow>
            <annotation encoding="application/x-tex">
              M(1 \\le M \\le 10,000)
            </annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            M
          </span>
          <span class="mopen">(</span>
          <span class="mord">1</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.8193em; vertical-align: -0.13597em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            M
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord">1</span>
          <span class="mord">0</span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">0</span>
          <span class="mord">0</span>
          <span class="mord">0</span>
          <span class="mclose">)</span>
        </span>
      </span>
    </span>
  </span>
  이 주어진다.
</p>
<p>
  둘째 줄부터
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>N</mi></mrow>
            <annotation encoding="application/x-tex">N</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
        </span>
      </span>
    </span>
  </span>
  개의 줄에 걸쳐 각 정사각형 타일의 길이
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <msub>
                <mi>a</mi>
                <mi>i</mi>
              </msub>
              <mo>(</mo>
              <mn>1</mn>
              <mo>≤</mo>
              <msub>
                <mi>a</mi>
                <mi>i</mi>
              </msub>
              <mo>≤</mo>
              <mn>100</mn>
              <mo>)</mo>
            </mrow>
            <annotation encoding="application/x-tex">
              a_i(1 \\le a_i \\le 100)
            </annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">a</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mathdefault mtight">i</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mopen">(</span>
          <span class="mord">1</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.78597em; vertical-align: -0.15em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">a</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mathdefault mtight">i</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord">1</span>
          <span class="mord">0</span>
          <span class="mord">0</span>
          <span class="mclose">)</span>
        </span>
      </span>
    </span>
  </span>
  가 주어진다.
</p>`,
        outputDescription: `<p>
  총면적이
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>M</mi></mrow>
            <annotation encoding="application/x-tex">M</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            M
          </span>
        </span>
      </span>
    </span>
  </span>
  이 되도록 하는 타일 교환의 최소 비용을 출력한다. 총면적이
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>M</mi></mrow>
            <annotation encoding="application/x-tex">M</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            M
          </span>
        </span>
      </span>
    </span>
  </span>
  이 될 수 없는 경우는 -1을 출력한다.
</p>`,
        languages: [Language.C, Language.Java],
        hint: `<p>
  3개의 타일이 있고, 두 개의 타일은 길이가 3인 정사각형이고, 한 개의 타일은
  길이가 1인 정사각형이다. 이것들을 총면적이 6이 되도록 교환하려 한다.
</p>
<p>
  길이가 3인 정사각형 중 하나를 길이가 2인 정사각형으로 바꾸고, 길이가 3인
  나머지 정사각형 하나를 길이가 1인 정사각형으로 바꾼다. 이렇게 하면 원하는 면적
  4+1+1=6을 얻을 수 있으며 교환 비용은 4+1=5이다.
</p>`,
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
        description: `<p>
  프리랜서로 일하는 디자이너 지환이는 일렬로 이어진
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>N</mi></mrow>
            <annotation encoding="application/x-tex">N</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
        </span>
      </span>
    </span>
  </span>
  개의 칸을 색칠해달라는 클라이언트의 요청을 받았다. 지환이는 열심히 색을 골라서
  색 조합을 클라이언트에게 전송했고, 스스로가 생각하기에도 이번 디자인은 정말 잘
  뽑힌 것 같았다. 이번 외주도 별문제 없이 해결했을 거로 생각한 지환이는 오랜
  시간 동안 고민해오던 시력 교정 수술을 예약했다. 평소에 마스크를 끼면 자꾸
  안경에 김이 서려서 화가 났기 때문이다.
</p>
<p>
  수술 후에 클라이언트의 연락을 받은 지환이는 생각보다 너무나도 까다로운
  클라이언트의 피드백에 놀라지 않을 수 없었다. 클라이언트는 총
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>Q</mi></mrow>
            <annotation encoding="application/x-tex">Q</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.87777em; vertical-align: -0.19444em"
          ></span>
          <span class="mord mathdefault">Q</span>
        </span>
      </span>
    </span>
  </span>
  개의 구간을 제시했다. 그리고 그
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>Q</mi></mrow>
            <annotation encoding="application/x-tex">Q</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.87777em; vertical-align: -0.19444em"
          ></span>
          <span class="mord mathdefault">Q</span>
        </span>
      </span>
    </span>
  </span>
  개의 구간 안에서는 각 칸이 모두 다른 색으로 구성되었으면 좋겠다고 말했다.
  지환이는 마음속으로 "진작 이렇게 말하지..."라는 생각을 했지만 금방 수정본을
  만들어서 보내겠다고 말했다.
</p>
<p>
  문제는 시력 교정 수술이었다. 안과에서는 자외선을 조심하라고 말했지만, 지환이는
  이를 모니터 화면을 보면 안된다고 오해하고 있던 것이다. 화면을 안 보고 디자인을
  수정할 수는 없지만, 지환이는 천재 디자이너였기 때문에 자신의 디자인을 어느
  정도 기억하고 있었다.
</p>
<p>
  지환이는 자신이 지금까지 쓴 색들이 무엇인지와, 어떤 위치에 있는 색이 마음에
  들었는지를 기억하고 있었고, 마음에 안 드는 색부터 지금까지 쓰지 않은 새로운
  색으로 하나씩 수정하여 클라이언트에게 수정본을 보내야겠다고 생각했다.
</p>
<p>
  이때, 지환이가 몇 번째 수정본에서 클라이언트가 만족하는 디자인을 만들 수
  있을지를 출력하라.
</p>`,
        difficulty: Level.Level3,
        inputDescription: `<p>
  첫째 줄에는 알파벳 소문자로 이루어진
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mi>N</mi>
              <mo>&amp;lt;</mo>
              <mn>1</mn>
              <mo>≤</mo>
              <mi>N</mi>
              <mo>≤</mo>
              <mn>1</mn>
              <msup>
                <mn>0</mn>
                <mn>5</mn>
              </msup>
              <mo>)</mo>
            </mrow>
            <annotation encoding="application/x-tex">
              N&amp;lt;1 \\le N \\le 10^5)
            </annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.72243em; vertical-align: -0.0391em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">&lt;</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.78041em; vertical-align: -0.13597em"
          ></span>
          <span class="mord">1</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.8193em; vertical-align: -0.13597em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 1.064108em; vertical-align: -0.25em"
          ></span>
          <span class="mord">1</span>
          <span class="mord">
            <span class="mord">0</span>
            <span class="msupsub">
              <span class="vlist-t">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.814108em">
                    <span class="" style="top: -3.063em; margin-right: 0.05em">
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">5</span>
                      </span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mclose">)</span>
        </span>
      </span>
    </span>
  </span>
  개의 색이 문자열로 주어진다.
</p>
<p>
  둘째 줄에는 구간의 개수
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mi>Q</mi>
              <mo>(</mo>
              <mn>1</mn>
              <mo>≤</mo>
              <mi>Q</mi>
              <mo>≤</mo>
              <mn>1</mn>
              <msup>
                <mn>0</mn>
                <mn>5</mn>
              </msup>
              <mo>)</mo>
            </mrow>
            <annotation encoding="application/x-tex">
              Q(1 \\le Q \\le 10^5)
            </annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord mathdefault">Q</span>
          <span class="mopen">(</span>
          <span class="mord">1</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.87777em; vertical-align: -0.19444em"
          ></span>
          <span class="mord mathdefault">Q</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 1.064108em; vertical-align: -0.25em"
          ></span>
          <span class="mord">1</span>
          <span class="mord">
            <span class="mord">0</span>
            <span class="msupsub">
              <span class="vlist-t">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.814108em">
                    <span class="" style="top: -3.063em; margin-right: 0.05em">
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">5</span>
                      </span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mclose">)</span>
        </span>
      </span>
    </span>
  </span>
  가 주어진다.
</p>
<p>
  그 다음
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>Q</mi></mrow>
            <annotation encoding="application/x-tex">Q</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.87777em; vertical-align: -0.19444em"
          ></span>
          <span class="mord mathdefault">Q</span>
        </span>
      </span>
    </span>
  </span>
  개의 줄에 걸쳐 각 구간이
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <msub>
                <mi>a</mi>
                <mi>i</mi>
              </msub>
            </mrow>
            <annotation encoding="application/x-tex">a_i</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.58056em; vertical-align: -0.15em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">a</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mathdefault mtight">i</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  </span>
  와
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <msub>
                <mi>b</mi>
                <mi>i</mi>
              </msub>
            </mrow>
            <annotation encoding="application/x-tex">b_i</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.84444em; vertical-align: -0.15em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">b</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mathdefault mtight">i</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  </span>
  로 주어진다.
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mo>(</mo>
              <mn>1</mn>
              <mo>≤</mo>
              <msub>
                <mi>a</mi>
                <mi>i</mi>
              </msub>
              <mo>≤</mo>
              <msub>
                <mi>b</mi>
                <mi>i</mi>
              </msub>
              <mo>≤</mo>
              <mi>N</mi>
              <mo>)</mo>
            </mrow>
            <annotation encoding="application/x-tex">
              (1 \\le a_i \\le b_i \\le N)
            </annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mopen">(</span>
          <span class="mord">1</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.78597em; vertical-align: -0.15em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">a</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mathdefault mtight">i</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.84444em; vertical-align: -0.15em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">b</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mathdefault mtight">i</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
          <span class="mclose">)</span>
        </span>
      </span>
    </span>
  </span>
  이는
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <msub>
                <mi>a</mi>
                <mi>i</mi>
              </msub>
            </mrow>
            <annotation encoding="application/x-tex">a_i</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.58056em; vertical-align: -0.15em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">a</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mathdefault mtight">i</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  </span>
  번째 칸부터
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <msub>
                <mi>b</mi>
                <mi>i</mi>
              </msub>
            </mrow>
            <annotation encoding="application/x-tex">b_i</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.84444em; vertical-align: -0.15em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">b</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mathdefault mtight">i</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  </span>
  번째 칸까지의 구간을 의미한다.
</p>
<p>
  마지막 줄에는 지환이가 초안에서 마음에 들지 않았던 색부터 가장 마음에 드는
  위치까지 총
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>N</mi></mrow>
            <annotation encoding="application/x-tex">N</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
        </span>
      </span>
    </span>
  </span>
  개의 서로 다른 칸의 위치가 주어진다.
</p>`,
        outputDescription: `<p>
  몇 번째 수정본에서 클라이언트가 만족하는 디자인을 만들 수 있을지 0 이상의
  정수로 출력한다.
</p>`,
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
        description: `<p>
  가중치가 있는 무방향 간선들로 이루어진
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>N</mi></mrow>
            <annotation encoding="application/x-tex">N</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
        </span>
      </span>
    </span>
  </span>
  개의 정점의 완전 그래프가 있다. (
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>N</mi></mrow>
            <annotation encoding="application/x-tex">N</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
        </span>
      </span>
    </span>
  </span>
  은 홀수)
</p>
<p>
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>K</mi></mrow>
            <annotation encoding="application/x-tex">K</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.07153em">
            K
          </span>
        </span>
      </span>
    </span>
  </span>
  개의 간선들로 이루어진 배열
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mo>[</mo>
              <msub>
                <mi>e</mi>
                <mn>1</mn>
              </msub>
              <mo separator="true">,</mo>
              <msub>
                <mi>e</mi>
                <mn>2</mn>
              </msub>
              <mo separator="true">,</mo>
              <mi mathvariant="normal">.</mi>
              <mi mathvariant="normal">.</mi>
              <mi mathvariant="normal">.</mi>
              <mo separator="true">,</mo>
              <msub>
                <mi>e</mi>
                <mi>K</mi>
              </msub>
              <mo>]</mo>
            </mrow>
            <annotation encoding="application/x-tex">
              [e_1,e_2,...,e_K]
            </annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mopen">[</span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">1</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">2</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">.</span>
          <span class="mord">.</span>
          <span class="mord">.</span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.328331em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span
                          class="mord mathdefault mtight"
                          style="margin-right: 0.07153em"
                        >
                          K
                        </span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mclose">]</span>
        </span>
      </span>
    </span>
  </span>
  을 '사이클 배열'이라고 하고, 다음을 만족한다고 하자.
</p>
<ul>
  <li>
    <span>
      <span class="katex">
        <span class="katex-mathml">
          <math>
            <semantics>
              <mrow>
                <mi>K</mi>
                <mo>&amp;gt;</mo>
                <mn>1</mn>
              </mrow>
              <annotation encoding="application/x-tex">K&amp;gt;1</annotation>
            </semantics>
          </math>
        </span>
        <span class="katex-html" aria-hidden="true">
          <span class="base">
            <span
              class="strut"
              style="height: 0.72243em; vertical-align: -0.0391em"
            ></span>
            <span class="mord mathdefault" style="margin-right: 0.07153em">
              K
            </span>
            <span class="mspace" style="margin-right: 0.277778em"></span>
            <span class="mrel">&gt;</span>
            <span class="mspace" style="margin-right: 0.277778em"></span>
          </span>
          <span class="base">
            <span
              class="strut"
              style="height: 0.64444em; vertical-align: 0em"
            ></span>
            <span class="mord">1</span>
          </span>
        </span>
      </span>
    </span>
  </li>
  <li>
    임의의
    <span>
      <span class="katex">
        <span class="katex-mathml">
          <math>
            <semantics>
              <mrow>
                <mi>i</mi>
                <mo>(</mo>
                <mn>1</mn>
                <mo>≤</mo>
                <mi>i</mi>
                <mo>≤</mo>
                <mi>K</mi>
                <mo>)</mo>
              </mrow>
              <annotation encoding="application/x-tex">
                i(1 \\le i \\le K)
              </annotation>
            </semantics>
          </math>
        </span>
        <span class="katex-html" aria-hidden="true">
          <span class="base">
            <span
              class="strut"
              style="height: 1em; vertical-align: -0.25em"
            ></span>
            <span class="mord mathdefault">i</span>
            <span class="mopen">(</span>
            <span class="mord">1</span>
            <span class="mspace" style="margin-right: 0.277778em"></span>
            <span class="mrel">≤</span>
            <span class="mspace" style="margin-right: 0.277778em"></span>
          </span>
          <span class="base">
            <span
              class="strut"
              style="height: 0.79549em; vertical-align: -0.13597em"
            ></span>
            <span class="mord mathdefault">i</span>
            <span class="mspace" style="margin-right: 0.277778em"></span>
            <span class="mrel">≤</span>
            <span class="mspace" style="margin-right: 0.277778em"></span>
          </span>
          <span class="base">
            <span
              class="strut"
              style="height: 1em; vertical-align: -0.25em"
            ></span>
            <span class="mord mathdefault" style="margin-right: 0.07153em">
              K
            </span>
            <span class="mclose">)</span>
          </span>
        </span>
      </span>
    </span>
    에 대해 간선
    <span>
      <span class="katex">
        <span class="katex-mathml">
          <math>
            <semantics>
              <mrow>
                <msub>
                  <mi>e</mi>
                  <mi>i</mi>
                </msub>
              </mrow>
              <annotation encoding="application/x-tex">e_i</annotation>
            </semantics>
          </math>
        </span>
        <span class="katex-html" aria-hidden="true">
          <span class="base">
            <span
              class="strut"
              style="height: 0.58056em; vertical-align: -0.15em"
            ></span>
            <span class="mord">
              <span class="mord mathdefault">e</span>
              <span class="msupsub">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.311664em">
                      <span
                        class=""
                        style="
                          top: -2.55em;
                          margin-left: 0em;
                          margin-right: 0.05em;
                        "
                      >
                        <span class="pstrut" style="height: 2.7em"></span>
                        <span class="sizing reset-size6 size3 mtight">
                          <span class="mord mathdefault mtight">i</span>
                        </span>
                      </span>
                    </span>
                    <span class="vlist-s"></span>
                  </span>
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.15em">
                      <span class=""></span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
    는
    <span>
      <span class="katex">
        <span class="katex-mathml">
          <math>
            <semantics>
              <mrow>
                <msub>
                  <mi>e</mi>
                  <mrow>
                    <mi>i</mi>
                    <mo>−</mo>
                    <mn>1</mn>
                  </mrow>
                </msub>
              </mrow>
              <annotation encoding="application/x-tex">e_{i-1}</annotation>
            </semantics>
          </math>
        </span>
        <span class="katex-html" aria-hidden="true">
          <span class="base">
            <span
              class="strut"
              style="height: 0.638891em; vertical-align: -0.208331em"
            ></span>
            <span class="mord">
              <span class="mord mathdefault">e</span>
              <span class="msupsub">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.311664em">
                      <span
                        class=""
                        style="
                          top: -2.55em;
                          margin-left: 0em;
                          margin-right: 0.05em;
                        "
                      >
                        <span class="pstrut" style="height: 2.7em"></span>
                        <span class="sizing reset-size6 size3 mtight">
                          <span class="mord mtight">
                            <span class="mord mathdefault mtight">i</span>
                            <span class="mbin mtight">−</span>
                            <span class="mord mtight">1</span>
                          </span>
                        </span>
                      </span>
                    </span>
                    <span class="vlist-s"></span>
                  </span>
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.208331em">
                      <span class=""></span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
    과 정확히 하나의 정점을 공유하고
    <span>
      <span class="katex">
        <span class="katex-mathml">
          <math>
            <semantics>
              <mrow>
                <msub>
                  <mi>e</mi>
                  <mrow>
                    <mi>i</mi>
                    <mo>+</mo>
                    <mn>1</mn>
                  </mrow>
                </msub>
              </mrow>
              <annotation encoding="application/x-tex">e_{i+1}</annotation>
            </semantics>
          </math>
        </span>
        <span class="katex-html" aria-hidden="true">
          <span class="base">
            <span
              class="strut"
              style="height: 0.638891em; vertical-align: -0.208331em"
            ></span>
            <span class="mord">
              <span class="mord mathdefault">e</span>
              <span class="msupsub">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.311664em">
                      <span
                        class=""
                        style="
                          top: -2.55em;
                          margin-left: 0em;
                          margin-right: 0.05em;
                        "
                      >
                        <span class="pstrut" style="height: 2.7em"></span>
                        <span class="sizing reset-size6 size3 mtight">
                          <span class="mord mtight">
                            <span class="mord mathdefault mtight">i</span>
                            <span class="mbin mtight">+</span>
                            <span class="mord mtight">1</span>
                          </span>
                        </span>
                      </span>
                    </span>
                    <span class="vlist-s"></span>
                  </span>
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.208331em">
                      <span class=""></span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
    과도 정확히 하나의 정점을 공유하며, 이 정점들은 서로 다르다. (
    <span>
      <span class="katex">
        <span class="katex-mathml">
          <math>
            <semantics>
              <mrow>
                <msub>
                  <mi>e</mi>
                  <mn>0</mn>
                </msub>
                <mo>=</mo>
                <msub>
                  <mi>e</mi>
                  <mi>K</mi>
                </msub>
                <mo separator="true">,</mo>
                <msub>
                  <mi>e</mi>
                  <mn>1</mn>
                </msub>
                <mo>=</mo>
                <msub>
                  <mi>e</mi>
                  <mrow>
                    <mi>K</mi>
                    <mo>+</mo>
                    <mn>1</mn>
                  </mrow>
                </msub>
              </mrow>
              <annotation encoding="application/x-tex">
                e_0=e_K,e_1=e_{K+1}
              </annotation>
            </semantics>
          </math>
        </span>
        <span class="katex-html" aria-hidden="true">
          <span class="base">
            <span
              class="strut"
              style="height: 0.58056em; vertical-align: -0.15em"
            ></span>
            <span class="mord">
              <span class="mord mathdefault">e</span>
              <span class="msupsub">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.301108em">
                      <span
                        class=""
                        style="
                          top: -2.55em;
                          margin-left: 0em;
                          margin-right: 0.05em;
                        "
                      >
                        <span class="pstrut" style="height: 2.7em"></span>
                        <span class="sizing reset-size6 size3 mtight">
                          <span class="mord mtight">0</span>
                        </span>
                      </span>
                    </span>
                    <span class="vlist-s"></span>
                  </span>
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.15em">
                      <span class=""></span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
            <span class="mspace" style="margin-right: 0.277778em"></span>
            <span class="mrel">=</span>
            <span class="mspace" style="margin-right: 0.277778em"></span>
          </span>
          <span class="base">
            <span
              class="strut"
              style="height: 0.625em; vertical-align: -0.19444em"
            ></span>
            <span class="mord">
              <span class="mord mathdefault">e</span>
              <span class="msupsub">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.328331em">
                      <span
                        class=""
                        style="
                          top: -2.55em;
                          margin-left: 0em;
                          margin-right: 0.05em;
                        "
                      >
                        <span class="pstrut" style="height: 2.7em"></span>
                        <span class="sizing reset-size6 size3 mtight">
                          <span
                            class="mord mathdefault mtight"
                            style="margin-right: 0.07153em"
                          >
                            K
                          </span>
                        </span>
                      </span>
                    </span>
                    <span class="vlist-s"></span>
                  </span>
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.15em">
                      <span class=""></span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
            <span class="mpunct">,</span>
            <span class="mspace" style="margin-right: 0.166667em"></span>
            <span class="mord">
              <span class="mord mathdefault">e</span>
              <span class="msupsub">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.301108em">
                      <span
                        class=""
                        style="
                          top: -2.55em;
                          margin-left: 0em;
                          margin-right: 0.05em;
                        "
                      >
                        <span class="pstrut" style="height: 2.7em"></span>
                        <span class="sizing reset-size6 size3 mtight">
                          <span class="mord mtight">1</span>
                        </span>
                      </span>
                    </span>
                    <span class="vlist-s"></span>
                  </span>
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.15em">
                      <span class=""></span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
            <span class="mspace" style="margin-right: 0.277778em"></span>
            <span class="mrel">=</span>
            <span class="mspace" style="margin-right: 0.277778em"></span>
          </span>
          <span class="base">
            <span
              class="strut"
              style="height: 0.638891em; vertical-align: -0.208331em"
            ></span>
            <span class="mord">
              <span class="mord mathdefault">e</span>
              <span class="msupsub">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.328331em">
                      <span
                        class=""
                        style="
                          top: -2.55em;
                          margin-left: 0em;
                          margin-right: 0.05em;
                        "
                      >
                        <span class="pstrut" style="height: 2.7em"></span>
                        <span class="sizing reset-size6 size3 mtight">
                          <span class="mord mtight">
                            <span
                              class="mord mathdefault mtight"
                              style="margin-right: 0.07153em"
                            >
                              K
                            </span>
                            <span class="mbin mtight">+</span>
                            <span class="mord mtight">1</span>
                          </span>
                        </span>
                      </span>
                    </span>
                    <span class="vlist-s"></span>
                  </span>
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.208331em">
                      <span class=""></span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
    로 간주한다)
  </li>
</ul>
<p>'사이클 배열'의 간선들이 사이클을 형성하는 것은 명백하다.</p>
<p>
  함수
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mi>f</mi>
              <mo>(</mo>
              <msub>
                <mi>e</mi>
                <mn>1</mn>
              </msub>
              <mo separator="true">,</mo>
              <msub>
                <mi>e</mi>
                <mn>2</mn>
              </msub>
              <mo>)</mo>
            </mrow>
            <annotation encoding="application/x-tex">f(e_1,e_2)</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10764em">
            f
          </span>
          <span class="mopen">(</span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">1</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">2</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mclose">)</span>
        </span>
      </span>
    </span>
  </span>
  는 간선
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <msub>
                <mi>e</mi>
                <mn>1</mn>
              </msub>
              <mo separator="true">,</mo>
              <msub>
                <mi>e</mi>
                <mn>2</mn>
              </msub>
            </mrow>
            <annotation encoding="application/x-tex">e_1,e_2</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.625em; vertical-align: -0.19444em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">1</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">2</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  </span>
  를 매개변수로 취하고
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <msub>
                <mi>e</mi>
                <mn>1</mn>
              </msub>
            </mrow>
            <annotation encoding="application/x-tex">e_1</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.58056em; vertical-align: -0.15em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">1</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  </span>
  과
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <msub>
                <mi>e</mi>
                <mn>2</mn>
              </msub>
            </mrow>
            <annotation encoding="application/x-tex">e_2</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.58056em; vertical-align: -0.15em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">2</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  </span>
  의 가중치 중 최대값을 반환하는 것으로 정의한다.
</p>
<p>
  '사이클 배열'
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mi>C</mi>
              <mo>=</mo>
              <mo>[</mo>
              <msub>
                <mi>e</mi>
                <mn>1</mn>
              </msub>
              <mo separator="true">,</mo>
              <msub>
                <mi>e</mi>
                <mn>2</mn>
              </msub>
              <mo separator="true">,</mo>
              <mi mathvariant="normal">.</mi>
              <mi mathvariant="normal">.</mi>
              <mi mathvariant="normal">.</mi>
              <mo separator="true">,</mo>
              <msub>
                <mi>e</mi>
                <mi>K</mi>
              </msub>
              <mo>]</mo>
            </mrow>
            <annotation encoding="application/x-tex">
              C=[e_1,e_2,...,e_K]
            </annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.07153em">
            C
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">=</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mopen">[</span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">1</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">2</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">.</span>
          <span class="mord">.</span>
          <span class="mord">.</span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.328331em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span
                          class="mord mathdefault mtight"
                          style="margin-right: 0.07153em"
                        >
                          K
                        </span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mclose">]</span>
        </span>
      </span>
    </span>
  </span>
  에 대해, '사이클 배열의 비용'을 1과
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>K</mi></mrow>
            <annotation encoding="application/x-tex">K</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.07153em">
            K
          </span>
        </span>
      </span>
    </span>
  </span>
  사이 모든
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>i</mi></mrow>
            <annotation encoding="application/x-tex">i</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.65952em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault">i</span>
        </span>
      </span>
    </span>
  </span>
  에 대한
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mi>f</mi>
              <mo>(</mo>
              <msub>
                <mi>e</mi>
                <mi>i</mi>
              </msub>
              <mo separator="true">,</mo>
              <msub>
                <mi>e</mi>
                <mrow>
                  <mi>i</mi>
                  <mo>+</mo>
                  <mn>1</mn>
                </mrow>
              </msub>
              <mo>)</mo>
            </mrow>
            <annotation encoding="application/x-tex">f(e_i,e_{i+1})</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10764em">
            f
          </span>
          <span class="mopen">(</span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mathdefault mtight">i</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">
                          <span class="mord mathdefault mtight">i</span>
                          <span class="mbin mtight">+</span>
                          <span class="mord mtight">1</span>
                        </span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.208331em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mclose">)</span>
        </span>
      </span>
    </span>
  </span>
  의 합으로 정의하자. (
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <msub>
                <mi>e</mi>
                <mn>1</mn>
              </msub>
              <mo>=</mo>
              <msub>
                <mi>e</mi>
                <mrow>
                  <mi>K</mi>
                  <mo>+</mo>
                  <mn>1</mn>
                </mrow>
              </msub>
            </mrow>
            <annotation encoding="application/x-tex">e_1=e_{K+1}</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.58056em; vertical-align: -0.15em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">1</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">=</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.638891em; vertical-align: -0.208331em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.328331em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">
                          <span
                            class="mord mathdefault mtight"
                            style="margin-right: 0.07153em"
                          >
                            K
                          </span>
                          <span class="mbin mtight">+</span>
                          <span class="mord mtight">1</span>
                        </span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.208331em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  </span>
  로 간주한다)
</p>
<p>
  그래프에 대한 '사이클 분할'을 교집합이 없는 '사이클 배열'들의 집합으로
  정의하자. '사이클 분할'의 원소들의 합집합은 그래프의 모든 간선들을
  포함해야한다. '사이클 분할의 비용'을 '사이클 분할'에 포함되어 있는 '사이클
  배열'들의 비용의 합으로 정의하자.
</p>
<p>
  하나의 그래프에 대해 다양한 '사이클 분할'이 존재할 수 있을 것이다. 그래프가
  주어지면, 가장 비용이 낮은 사이클 분할을 찾고, 그 비용을 출력하는 프로그램을
  작성하라.
</p>`,
        difficulty: Level.Level3,
        inputDescription: `<p>
  첫째 줄에 정점의 개수
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>N</mi></mrow>
            <annotation encoding="application/x-tex">N</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
        </span>
      </span>
    </span>
  </span>
  이 주어진다. (
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mn>3</mn>
              <mo>≤</mo>
              <mi>N</mi>
              <mo>&amp;lt;</mo>
              <mn>1</mn>
              <mo separator="true">,</mo>
              <mn>000</mn>
            </mrow>
            <annotation encoding="application/x-tex">
              3 \\le N &amp;lt;1,000
            </annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.78041em; vertical-align: -0.13597em"
          ></span>
          <span class="mord">3</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.72243em; vertical-align: -0.0391em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">&lt;</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.83888em; vertical-align: -0.19444em"
          ></span>
          <span class="mord">1</span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">0</span>
          <span class="mord">0</span>
          <span class="mord">0</span>
        </span>
      </span>
    </span>
  </span>
  ,
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>N</mi></mrow>
            <annotation encoding="application/x-tex">N</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
        </span>
      </span>
    </span>
  </span>
  은 홀수)
</p>
<p>
  둘째 줄부터
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mi>N</mi>
              <mi mathvariant="normal">∙</mi>
              <mo>(</mo>
              <mi>N</mi>
              <mo>−</mo>
              <mn>1</mn>
              <mo>)</mo>
              <mi mathvariant="normal">/</mi>
              <mn>2</mn>
            </mrow>
            <annotation encoding="application/x-tex">N∙(N-1)/2</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
          <span class="mord">∙</span>
          <span class="mopen">(</span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
          <span class="mspace" style="margin-right: 0.222222em"></span>
          <span class="mbin">−</span>
          <span class="mspace" style="margin-right: 0.222222em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord">1</span>
          <span class="mclose">)</span>
          <span class="mord">/</span>
          <span class="mord">2</span>
        </span>
      </span>
    </span>
  </span>
  개의 줄에는 세 정수
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mi>u</mi>
              <mo separator="true">,</mo>
              <mi>v</mi>
              <mo separator="true">,</mo>
              <mi>w</mi>
              <mo>(</mo>
              <mn>1</mn>
              <mo>≤</mo>
              <mi>u</mi>
              <mo separator="true">,</mo>
              <mi>v</mi>
              <mo>≤</mo>
              <mi>N</mi>
              <mo separator="true">,</mo>
              <mi>u</mi>
              <mi mathvariant="normal">≠</mi>
              <mi>v</mi>
              <mo separator="true">,</mo>
              <mn>1</mn>
              <mo>≤</mo>
              <mi>w</mi>
              <mo>≤</mo>
              <mn>1</mn>
              <msup>
                <mn>0</mn>
                <mn>9</mn>
              </msup>
              <mo>)</mo>
            </mrow>
            <annotation encoding="application/x-tex">
              u,v,w(1 \\le u, v \\le N, u \\ne v, 1 \\le w \\le 10^9)
            </annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord mathdefault">u</span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord mathdefault" style="margin-right: 0.03588em">
            v
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord mathdefault" style="margin-right: 0.02691em">
            w
          </span>
          <span class="mopen">(</span>
          <span class="mord">1</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.83041em; vertical-align: -0.19444em"
          ></span>
          <span class="mord mathdefault">u</span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord mathdefault" style="margin-right: 0.03588em">
            v
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">≤</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.88888em; vertical-align: -0.19444em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10903em">
            N
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord mathdefault">u</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">
            <span class="mrel">
              <span class="mord">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.69444em">
                      <span class="" style="top: -3em">
                        <span class="pstrut" style="height: 3em"></span>
                        <span class="rlap">
                          <span
                            class="strut"
                            style="
                              height: 0.88888em;
                              vertical-align: -0.19444em;
                            "
                          ></span>
                          <span class="inner">
                            <span class="mrel latin_fallback"≯
                          </span>
                        </span>
                        <span class="fix"></span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.19444em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mrel">=</span>
        </span>
        <span class="mspace" style="margin-right: 0.277778em"></span>
      </span>
      <span class="base">
        <span
          class="strut"
          style="height: 0.83888em; vertical-align: -0.19444em"
        ></span>
        <span class="mord mathdefault" style="margin-right: 0.03588em">v</span>
        <span class="mpunct">,</span>
        <span class="mspace" style="margin-right: 0.166667em"></span>
        <span class="mord">1</span>
        <span class="mspace" style="margin-right: 0.277778em"></span>
        <span class="mrel">≤</span>
        <span class="mspace" style="margin-right: 0.277778em"></span>
      </span>
      <span class="base">
        <span
          class="strut"
          style="height: 0.77194em; vertical-align: -0.13597em"
        ></span>
        <span class="mord mathdefault" style="margin-right: 0.02691em">w</span>
        <span class="mspace" style="margin-right: 0.277778em"></span>
        <span class="mrel">≤</span>
        <span class="mspace" style="margin-right: 0.277778em"></span>
      </span>
      <span class="base">
        <span
          class="strut"
          style="height: 1.064108em; vertical-align: -0.25em"
        ></span>
        <span class="mord">1</span>
        <span class="mord">
          <span class="mord">0</span>
          <span class="msupsub">
            <span class="vlist-t">
              <span class="vlist-r">
                <span class="vlist" style="height: 0.814108em">
                  <span class="" style="top: -3.063em; margin-right: 0.05em">
                    <span class="pstrut" style="height: 2.7em"></span>
                    <span class="sizing reset-size6 size3 mtight">
                      <span class="mord mtight">9</span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
        <span class="mclose">)</span>
      </span>
    </span>
  </span>
  가 주어진다. 정점
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>u</mi></mrow>
            <annotation encoding="application/x-tex">u</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.43056em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault">u</span>
        </span>
      </span>
    </span>
  </span>
  와 정점
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>v</mi></mrow>
            <annotation encoding="application/x-tex">v</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.43056em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.03588em">
            v
          </span>
        </span>
      </span>
    </span>
  </span>
  사이에 가중치
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>w</mi></mrow>
            <annotation encoding="application/x-tex">w</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.43056em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.02691em">
            w
          </span>
        </span>
      </span>
    </span>
    의 간선이 있다는 뜻이다.
  </span>
</p>`,
        outputDescription: `<p>
  첫째 줄에 그래프에 대한 '사이클 분할의 비용'의 최솟값을 하나의 정수로 출력한다.
</p>`,
        languages: [Language.C, Language.Cpp, Language.Java, Language.Python3],
        hint: `<p>
  예제에서 입력되는 순서대로 간선에 번호를 매겨보자.
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow><mi>i</mi></mrow>
            <annotation encoding="application/x-tex">i</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.65952em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault">i</span>
        </span>
      </span>
    </span>
  </span>
  번째 간선을
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <msub>
                <mi>e</mi>
                <mi>i</mi>
              </msub>
            </mrow>
            <annotation encoding="application/x-tex">e_i</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.58056em; vertical-align: -0.15em"
          ></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.311664em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mathdefault mtight">i</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
        </span>
      </span>
    </span>
  </span>
  라고 하자.
</p>
<p>
  첫 번째 예제에서 유일하게 가능한 사이클 분할은
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mi>S</mi>
              <mo>=</mo>
              <mrow>
                <mo>[</mo>
                <msub>
                  <mi>e</mi>
                  <mn>1</mn>
                </msub>
                <mo separator="true">,</mo>
                <msub>
                  <mi>e</mi>
                  <mn>2</mn>
                </msub>
                <mo separator="true">,</mo>
                <msub>
                  <mi>e</mi>
                  <mn>3</mn>
                </msub>
                <mo>]</mo>
              </mrow>
            </mrow>
            <annotation encoding="application/x-tex">
              S={[e_1,e_2,e_3]}
            </annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.05764em">
            S
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">=</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord">
            <span class="mopen">[</span>
            <span class="mord">
              <span class="mord mathdefault">e</span>
              <span class="msupsub">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.301108em">
                      <span
                        class=""
                        style="
                          top: -2.55em;
                          margin-left: 0em;
                          margin-right: 0.05em;
                        "
                      >
                        <span class="pstrut" style="height: 2.7em"></span>
                        <span class="sizing reset-size6 size3 mtight">
                          <span class="mord mtight">1</span>
                        </span>
                      </span>
                    </span>
                    <span class="vlist-s"></span>
                  </span>
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.15em">
                      <span class=""></span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
            <span class="mpunct">,</span>
            <span class="mspace" style="margin-right: 0.166667em"></span>
            <span class="mord">
              <span class="mord mathdefault">e</span>
              <span class="msupsub">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.301108em">
                      <span
                        class=""
                        style="
                          top: -2.55em;
                          margin-left: 0em;
                          margin-right: 0.05em;
                        "
                      >
                        <span class="pstrut" style="height: 2.7em"></span>
                        <span class="sizing reset-size6 size3 mtight">
                          <span class="mord mtight">2</span>
                        </span>
                      </span>
                    </span>
                    <span class="vlist-s"></span>
                  </span>
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.15em">
                      <span class=""></span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
            <span class="mpunct">,</span>
            <span class="mspace" style="margin-right: 0.166667em"></span>
            <span class="mord">
              <span class="mord mathdefault">e</span>
              <span class="msupsub">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.301108em">
                      <span
                        class=""
                        style="
                          top: -2.55em;
                          margin-left: 0em;
                          margin-right: 0.05em;
                        "
                      >
                        <span class="pstrut" style="height: 2.7em"></span>
                        <span class="sizing reset-size6 size3 mtight">
                          <span class="mord mtight">3</span>
                        </span>
                      </span>
                    </span>
                    <span class="vlist-s"></span>
                  </span>
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.15em">
                      <span class=""></span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
            <span class="mclose">]</span>
          </span>
        </span>
      </span>
    </span>
  </span>
  이다.
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mi>f</mi>
              <mo>(</mo>
              <msub>
                <mi>e</mi>
                <mn>1</mn>
              </msub>
              <mo separator="true">,</mo>
              <msub>
                <mi>e</mi>
                <mn>2</mn>
              </msub>
              <mo>)</mo>
              <mo>+</mo>
              <mi>f</mi>
              <mo>(</mo>
              <msub>
                <mi>e</mi>
                <mn>2</mn>
              </msub>
              <mo separator="true">,</mo>
              <msub>
                <mi>e</mi>
                <mn>3</mn>
              </msub>
              <mo>)</mo>
              <mo>+</mo>
              <mi>f</mi>
              <mo>(</mo>
              <msub>
                <mi>e</mi>
                <mn>3</mn>
              </msub>
              <mo separator="true">,</mo>
              <msub>
                <mi>e</mi>
                <mn>1</mn>
              </msub>
              <mo>)</mo>
              <mo>=</mo>
              <mn>1</mn>
              <mo>+</mo>
              <mn>1</mn>
              <mo>+</mo>
              <mn>1</mn>
              <mo>=</mo>
              <mn>3</mn>
            </mrow>
            <annotation encoding="application/x-tex">
              f(e_1,e_2)+f(e_2,e_3)+f(e_3,e_1)=1+1+1=3
            </annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10764em">
            f
          </span>
          <span class="mopen">(</span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">1</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">2</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mclose">)</span>
          <span class="mspace" style="margin-right: 0.222222em"></span>
          <span class="mbin">+</span>
          <span class="mspace" style="margin-right: 0.222222em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10764em">
            f
          </span>
          <span class="mopen">(</span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">2</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">3</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mclose">)</span>
          <span class="mspace" style="margin-right: 0.222222em"></span>
          <span class="mbin">+</span>
          <span class="mspace" style="margin-right: 0.222222em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.10764em">
            f
          </span>
          <span class="mopen">(</span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">3</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">1</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mclose">)</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">=</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.72777em; vertical-align: -0.08333em"
          ></span>
          <span class="mord">1</span>
          <span class="mspace" style="margin-right: 0.222222em"></span>
          <span class="mbin">+</span>
          <span class="mspace" style="margin-right: 0.222222em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.72777em; vertical-align: -0.08333em"
          ></span>
          <span class="mord">1</span>
          <span class="mspace" style="margin-right: 0.222222em"></span>
          <span class="mbin">+</span>
          <span class="mspace" style="margin-right: 0.222222em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.64444em; vertical-align: 0em"
          ></span>
          <span class="mord">1</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">=</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 0.64444em; vertical-align: 0em"
          ></span>
          <span class="mord">3</span>
        </span>
      </span>
    </span>
  </span>
</p>
<p>
  두 번째 예제에서 최적의 사이클 분할은
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mi>S</mi>
              <mo>=</mo>
              <mrow>
                <mo>[</mo>
                <msub>
                  <mi>e</mi>
                  <mn>3</mn>
                </msub>
                <mo separator="true">,</mo>
                <msub>
                  <mi>e</mi>
                  <mn>8</mn>
                </msub>
                <mo separator="true">,</mo>
                <msub>
                  <mi>e</mi>
                  <mn>9</mn>
                </msub>
                <mo>]</mo>
                <mo separator="true">,</mo>
                <mo>[</mo>
                <msub>
                  <mi>e</mi>
                  <mn>2</mn>
                </msub>
                <mo separator="true">,</mo>
                <msub>
                  <mi>e</mi>
                  <mn>4</mn>
                </msub>
                <mo separator="true">,</mo>
                <msub>
                  <mi>e</mi>
                  <mn>7</mn>
                </msub>
                <mo separator="true">,</mo>
                <msub>
                  <mi>e</mi>
                  <mn>10</mn>
                </msub>
                <mo separator="true">,</mo>
                <msub>
                  <mi>e</mi>
                  <mn>5</mn>
                </msub>
                <mo separator="true">,</mo>
                <msub>
                  <mi>e</mi>
                  <mn>1</mn>
                </msub>
                <mo separator="true">,</mo>
                <msub>
                  <mi>e</mi>
                  <mn>6</mn>
                </msub>
                <mo>]</mo>
              </mrow>
            </mrow>
            <annotation encoding="application/x-tex">
              S={[e_3,e_8,e_9],[e_2,e_4,e_7,e_{10},e_5,e_1,e_6]}
            </annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 0.68333em; vertical-align: 0em"
          ></span>
          <span class="mord mathdefault" style="margin-right: 0.05764em">
            S
          </span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
          <span class="mrel">=</span>
          <span class="mspace" style="margin-right: 0.277778em"></span>
        </span>
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mord">
            <span class="mopen">[</span>
            <span class="mord">
              <span class="mord mathdefault">e</span>
              <span class="msupsub">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.301108em">
                      <span
                        class=""
                        style="
                          top: -2.55em;
                          margin-left: 0em;
                          margin-right: 0.05em;
                        "
                      >
                        <span class="pstrut" style="height: 2.7em"></span>
                        <span class="sizing reset-size6 size3 mtight">
                          <span class="mord mtight">3</span>
                        </span>
                      </span>
                    </span>
                    <span class="vlist-s"></span>
                  </span>
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.15em">
                      <span class=""></span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
            <span class="mpunct">,</span>
            <span class="mspace" style="margin-right: 0.166667em"></span>
            <span class="mord">
              <span class="mord mathdefault">e</span>
              <span class="msupsub">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.301108em">
                      <span
                        class=""
                        style="
                          top: -2.55em;
                          margin-left: 0em;
                          margin-right: 0.05em;
                        "
                      >
                        <span class="pstrut" style="height: 2.7em"></span>
                        <span class="sizing reset-size6 size3 mtight">
                          <span class="mord mtight">8</span>
                        </span>
                      </span>
                    </span>
                    <span class="vlist-s"></span>
                  </span>
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.15em">
                      <span class=""></span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
            <span class="mpunct">,</span>
            <span class="mspace" style="margin-right: 0.166667em"></span>
            <span class="mord">
              <span class="mord mathdefault">e</span>
              <span class="msupsub">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.301108em">
                      <span
                        class=""
                        style="
                          top: -2.55em;
                          margin-left: 0em;
                          margin-right: 0.05em;
                        "
                      >
                        <span class="pstrut" style="height: 2.7em"></span>
                        <span class="sizing reset-size6 size3 mtight">
                          <span class="mord mtight">9</span>
                        </span>
                      </span>
                    </span>
                    <span class="vlist-s"></span>
                  </span>
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.15em">
                      <span class=""></span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
            <span class="mclose">]</span>
            <span class="mpunct">,</span>
            <span class="mspace" style="margin-right: 0.166667em"></span>
            <span class="mopen">[</span>
            <span class="mord">
              <span class="mord mathdefault">e</span>
              <span class="msupsub">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.301108em">
                      <span
                        class=""
                        style="
                          top: -2.55em;
                          margin-left: 0em;
                          margin-right: 0.05em;
                        "
                      >
                        <span class="pstrut" style="height: 2.7em"></span>
                        <span class="sizing reset-size6 size3 mtight">
                          <span class="mord mtight">2</span>
                        </span>
                      </span>
                    </span>
                    <span class="vlist-s"></span>
                  </span>
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.15em">
                      <span class=""></span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
            <span class="mpunct">,</span>
            <span class="mspace" style="margin-right: 0.166667em"></span>
            <span class="mord">
              <span class="mord mathdefault">e</span>
              <span class="msupsub">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.301108em">
                      <span
                        class=""
                        style="
                          top: -2.55em;
                          margin-left: 0em;
                          margin-right: 0.05em;
                        "
                      >
                        <span class="pstrut" style="height: 2.7em"></span>
                        <span class="sizing reset-size6 size3 mtight">
                          <span class="mord mtight">4</span>
                        </span>
                      </span>
                    </span>
                    <span class="vlist-s"></span>
                  </span>
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.15em">
                      <span class=""></span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
            <span class="mpunct">,</span>
            <span class="mspace" style="margin-right: 0.166667em"></span>
            <span class="mord">
              <span class="mord mathdefault">e</span>
              <span class="msupsub">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.301108em">
                      <span
                        class=""
                        style="
                          top: -2.55em;
                          margin-left: 0em;
                          margin-right: 0.05em;
                        "
                      >
                        <span class="pstrut" style="height: 2.7em"></span>
                        <span class="sizing reset-size6 size3 mtight">
                          <span class="mord mtight">7</span>
                        </span>
                      </span>
                    </span>
                    <span class="vlist-s"></span>
                  </span>
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.15em">
                      <span class=""></span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
            <span class="mpunct">,</span>
            <span class="mspace" style="margin-right: 0.166667em"></span>
            <span class="mord">
              <span class="mord mathdefault">e</span>
              <span class="msupsub">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.301108em">
                      <span
                        class=""
                        style="
                          top: -2.55em;
                          margin-left: 0em;
                          margin-right: 0.05em;
                        "
                      >
                        <span class="pstrut" style="height: 2.7em"></span>
                        <span class="sizing reset-size6 size3 mtight">
                          <span class="mord mtight">
                            <span class="mord mtight">1</span>
                            <span class="mord mtight">0</span>
                          </span>
                        </span>
                      </span>
                    </span>
                    <span class="vlist-s"></span>
                  </span>
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.15em">
                      <span class=""></span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
            <span class="mpunct">,</span>
            <span class="mspace" style="margin-right: 0.166667em"></span>
            <span class="mord">
              <span class="mord mathdefault">e</span>
              <span class="msupsub">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.301108em">
                      <span
                        class=""
                        style="
                          top: -2.55em;
                          margin-left: 0em;
                          margin-right: 0.05em;
                        "
                      >
                        <span class="pstrut" style="height: 2.7em"></span>
                        <span class="sizing reset-size6 size3 mtight">
                          <span class="mord mtight">5</span>
                        </span>
                      </span>
                    </span>
                    <span class="vlist-s"></span>
                  </span>
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.15em">
                      <span class=""></span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
            <span class="mpunct">,</span>
            <span class="mspace" style="margin-right: 0.166667em"></span>
            <span class="mord">
              <span class="mord mathdefault">e</span>
              <span class="msupsub">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.301108em">
                      <span
                        class=""
                        style="
                          top: -2.55em;
                          margin-left: 0em;
                          margin-right: 0.05em;
                        "
                      >
                        <span class="pstrut" style="height: 2.7em"></span>
                        <span class="sizing reset-size6 size3 mtight">
                          <span class="mord mtight">1</span>
                        </span>
                      </span>
                    </span>
                    <span class="vlist-s"></span>
                  </span>
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.15em">
                      <span class=""></span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
            <span class="mpunct">,</span>
            <span class="mspace" style="margin-right: 0.166667em"></span>
            <span class="mord">
              <span class="mord mathdefault">e</span>
              <span class="msupsub">
                <span class="vlist-t vlist-t2">
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.301108em">
                      <span
                        class=""
                        style="
                          top: -2.55em;
                          margin-left: 0em;
                          margin-right: 0.05em;
                        "
                      >
                        <span class="pstrut" style="height: 2.7em"></span>
                        <span class="sizing reset-size6 size3 mtight">
                          <span class="mord mtight">6</span>
                        </span>
                      </span>
                    </span>
                    <span class="vlist-s"></span>
                  </span>
                  <span class="vlist-r">
                    <span class="vlist" style="height: 0.15em">
                      <span class=""></span>
                    </span>
                  </span>
                </span>
              </span>
            </span>
            <span class="mclose">]</span>
          </span>
        </span>
      </span>
    </span>
  </span>
  이다.
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mo>[</mo>
              <msub>
                <mi>e</mi>
                <mn>3</mn>
              </msub>
              <mo separator="true">,</mo>
              <msub>
                <mi>e</mi>
                <mn>8</mn>
              </msub>
              <mo separator="true">,</mo>
              <msub>
                <mi>e</mi>
                <mn>9</mn>
              </msub>
              <mo>]</mo>
            </mrow>
            <annotation encoding="application/x-tex">[e_3,e_8,e_9]</annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mopen">[</span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">3</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">8</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">9</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mclose">]</span>
        </span>
      </span>
    </span>
  </span>
  의 비용은 12이고,
  <span>
    <span class="katex">
      <span class="katex-mathml">
        <math>
          <semantics>
            <mrow>
              <mo>[</mo>
              <msub>
                <mi>e</mi>
                <mn>2</mn>
              </msub>
              <mo separator="true">,</mo>
              <msub>
                <mi>e</mi>
                <mn>4</mn>
              </msub>
              <mo separator="true">,</mo>
              <msub>
                <mi>e</mi>
                <mn>7</mn>
              </msub>
              <mo separator="true">,</mo>
              <msub>
                <mi>e</mi>
                <mn>10</mn>
              </msub>
              <mo separator="true">,</mo>
              <msub>
                <mi>e</mi>
                <mn>5</mn>
              </msub>
              <mo separator="true">,</mo>
              <msub>
                <mi>e</mi>
                <mn>1</mn>
              </msub>
              <mo separator="true">,</mo>
              <msub>
                <mi>e</mi>
                <mn>6</mn>
              </msub>
              <mo>]</mo>
            </mrow>
            <annotation encoding="application/x-tex">
              [e_2,e_4,e_7,e_{10},e_5,e_1,e_6]
            </annotation>
          </semantics>
        </math>
      </span>
      <span class="katex-html" aria-hidden="true">
        <span class="base">
          <span
            class="strut"
            style="height: 1em; vertical-align: -0.25em"
          ></span>
          <span class="mopen">[</span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">2</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">4</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">7</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">
                          <span class="mord mtight">1</span>
                          <span class="mord mtight">0</span>
                        </span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">5</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">1</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mpunct">,</span>
          <span class="mspace" style="margin-right: 0.166667em"></span>
          <span class="mord">
            <span class="mord mathdefault">e</span>
            <span class="msupsub">
              <span class="vlist-t vlist-t2">
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.301108em">
                    <span
                      class=""
                      style="
                        top: -2.55em;
                        margin-left: 0em;
                        margin-right: 0.05em;
                      "
                    >
                      <span class="pstrut" style="height: 2.7em"></span>
                      <span class="sizing reset-size6 size3 mtight">
                        <span class="mord mtight">6</span>
                      </span>
                    </span>
                  </span>
                  <span class="vlist-s"></span>
                </span>
                <span class="vlist-r">
                  <span class="vlist" style="height: 0.15em">
                    <span class=""></span>
                  </span>
                </span>
              </span>
            </span>
          </span>
          <span class="mclose">]</span>
        </span>
      </span>
    </span>
  </span>
  의 비용은 23이다. 따라서 사이클 분할의 비용은 35이다.
</p>`,
        timeLimit: 2000,
        memoryLimit: 256,
        source: 'ICPC Regionals SEERC 2019 J번'
      }
    })
  )

  problems.push(
    await prisma.problem.create({
      data: {
        title: '회전 표지판',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
        description: `<p style="margin-left: 0px">
  예술가 민정이는 바람에 자유롭게 회전해도 알아볼 수 있는 표지판을 만들려고
  한다. 이러한 표지판을 만들기 위해 민정이는 180도 회전해도 변하지 않는 문자인
  H, I, N, O, S, X, Z만을 사용할 수 있다.
</p>
<p>
  단어를 보고, 그 단어가 회전 표지판에 사용될 수 있는지를 결정하는 프로그램을
  작성하라.
</p>`,
        difficulty: Level.Level1,
        inputDescription: `<p>
  <span style="color: rgb(51, 51, 51)">
    공백 없이 알파벳 대문자로만 이루어진 하나의 문자열
    <span>
      <span class="katex">
        <span class="katex-mathml">
          <math>
            <semantics>
              <mrow><mi>S</mi></mrow>
              <annotation encoding="application/x-tex">S</annotation>
            </semantics>
          </math>
        </span>
        <span class="katex-html" aria-hidden="true">
          <span class="base">
            <span
              class="strut"
              style="height: 0.68333em; vertical-align: 0em"
            ></span>
            <span class="mord mathdefault" style="margin-right: 0.05764em">
              S
            </span>
          </span>
        </span>
      </span>
    </span>
    가 주어진다. 문자열의 길이는 30을 넘지 않는다.
  </span>
  <br />
</p>`,
        outputDescription: `<p>
  <span style="color: rgb(51, 51, 51)">
    단어
    <span>
      <span class="katex">
        <span class="katex-mathml">
          <math>
            <semantics>
              <mrow><mi>S</mi></mrow>
              <annotation encoding="application/x-tex">S</annotation>
            </semantics>
          </math>
        </span>
        <span class="katex-html" aria-hidden="true">
          <span class="base">
            <span
              class="strut"
              style="height: 0.68333em; vertical-align: 0em"
            ></span>
            <span class="mord mathdefault" style="margin-right: 0.05764em">
              S
            </span>
          </span>
        </span>
      </span>
    </span>
    가 회전 표지판에 사용될 수 있다면
    <code>YES</code>
    를, 사용될 수 없다면
    <code>NO</code>
    를 출력한다.
  </span>
  <br />
</p>`,
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
        title: '회전 표지판',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
        description: `<p style="margin-left: 0px">
  예술가 민정이는 바람에 자유롭게 회전해도 알아볼 수 있는 표지판을 만들려고
  한다. 이러한 표지판을 만들기 위해 민정이는 180도 회전해도 변하지 않는 문자인
  H, I, N, O, S, X, Z만을 사용할 수 있다.
</p>
<p>
  단어를 보고, 그 단어가 회전 표지판에 사용될 수 있는지를 결정하는 프로그램을
  작성하라.
</p>`,
        difficulty: Level.Level1,
        inputDescription: `<p>
  <span style="color: rgb(51, 51, 51)">
    공백 없이 알파벳 대문자로만 이루어진 하나의 문자열
    <span>
      <span class="katex">
        <span class="katex-mathml">
          <math>
            <semantics>
              <mrow><mi>S</mi></mrow>
              <annotation encoding="application/x-tex">S</annotation>
            </semantics>
          </math>
        </span>
        <span class="katex-html" aria-hidden="true">
          <span class="base">
            <span
              class="strut"
              style="height: 0.68333em; vertical-align: 0em"
            ></span>
            <span class="mord mathdefault" style="margin-right: 0.05764em">
              S
            </span>
          </span>
        </span>
      </span>
    </span>
    가 주어진다. 문자열의 길이는 30을 넘지 않는다.
  </span>
  <br />
</p>`,
        outputDescription: `<p>
  <span style="color: rgb(51, 51, 51)">
    단어
    <span>
      <span class="katex">
        <span class="katex-mathml">
          <math>
            <semantics>
              <mrow><mi>S</mi></mrow>
              <annotation encoding="application/x-tex">S</annotation>
            </semantics>
          </math>
        </span>
        <span class="katex-html" aria-hidden="true">
          <span class="base">
            <span
              class="strut"
              style="height: 0.68333em; vertical-align: 0em"
            ></span>
            <span class="mord mathdefault" style="margin-right: 0.05764em">
              S
            </span>
          </span>
        </span>
      </span>
    </span>
    가 회전 표지판에 사용될 수 있다면
    <code>YES</code>
    를, 사용될 수 없다면
    <code>NO</code>
    를 출력한다.
  </span>
  <br />
</p>`,
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
        title: '회전 표지판',
        createdById: superAdminUser.id,
        groupId: publicGroup.id,
        description: `<p style="margin-left: 0px">
  예술가 민정이는 바람에 자유롭게 회전해도 알아볼 수 있는 표지판을 만들려고
  한다. 이러한 표지판을 만들기 위해 민정이는 180도 회전해도 변하지 않는 문자인
  H, I, N, O, S, X, Z만을 사용할 수 있다.
</p>
<p>
  단어를 보고, 그 단어가 회전 표지판에 사용될 수 있는지를 결정하는 프로그램을
  작성하라.
</p>`,
        difficulty: Level.Level1,
        inputDescription: `<p>
  <span style="color: rgb(51, 51, 51)">
    공백 없이 알파벳 대문자로만 이루어진 하나의 문자열
    <span>
      <span class="katex">
        <span class="katex-mathml">
          <math>
            <semantics>
              <mrow><mi>S</mi></mrow>
              <annotation encoding="application/x-tex">S</annotation>
            </semantics>
          </math>
        </span>
        <span class="katex-html" aria-hidden="true">
          <span class="base">
            <span
              class="strut"
              style="height: 0.68333em; vertical-align: 0em"
            ></span>
            <span class="mord mathdefault" style="margin-right: 0.05764em">
              S
            </span>
          </span>
        </span>
      </span>
    </span>
    가 주어진다. 문자열의 길이는 30을 넘지 않는다.
  </span>
  <br />
</p>`,
        outputDescription: `<p>
  <span style="color: rgb(51, 51, 51)">
    단어
    <span>
      <span class="katex">
        <span class="katex-mathml">
          <math>
            <semantics>
              <mrow><mi>S</mi></mrow>
              <annotation encoding="application/x-tex">S</annotation>
            </semantics>
          </math>
        </span>
        <span class="katex-html" aria-hidden="true">
          <span class="base">
            <span
              class="strut"
              style="height: 0.68333em; vertical-align: 0em"
            ></span>
            <span class="mord mathdefault" style="margin-right: 0.05764em">
              S
            </span>
          </span>
        </span>
      </span>
    </span>
    가 회전 표지판에 사용될 수 있다면
    <code>YES</code>
    를, 사용될 수 없다면
    <code>NO</code>
    를 출력한다.
  </span>
  <br />
</p>`,
        languages: [Language.Cpp],
        hint: '',
        timeLimit: 1000,
        memoryLimit: 128,
        source: 'Canadian Computing Competition(CCC) 2013 Junior 2번'
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

  await prisma.problemTestcase.createMany({
    data: [
      {
        problemId: 8,
        input: 'input.in',
        output: 'output.out'
      },
      {
        problemId: 8,
        input: 'input.in',
        output: 'output.out'
      },
      {
        problemId: 9,
        input: 'input.in',
        output: 'output.out'
      },
      {
        problemId: 9,
        input: 'input.in',
        output: 'output.out'
      },
      {
        problemId: 10,
        input: 'input.in',
        output: 'output.out'
      },
      {
        problemId: 10,
        input: 'input.in',
        output: 'output.out'
      }
    ]
  })

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
  // add ongoing contenst
  contest = await prisma.contest.create({
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
      startTime: dayjs().add(-30, 'day').toDate(),
      endTime: dayjs().add(30, 'day').toDate(),
      config: {
        isVisible: true,
        isRankVisible: true
      }
    }
  })

  // add ended contest
  await prisma.contest.create({
    data: {
      title: 'Long Time Ago Contest',
      description: '<p>이 대회는 오래 전에 끝났어요</p>',
      createdById: superAdminUser.id,
      groupId: publicGroup.id,
      startTime: dayjs().add(-1, 'hour').add(-1, 'year').toDate(),
      endTime: dayjs().add(2, 'hour').add(-1, 'year').toDate(),
      config: {
        isVisible: true,
        isRankVisible: false
      }
    }
  })

  // add oncoming contest
  await prisma.contest.create({
    data: {
      title: 'Future Contest',
      description: '<p>이 대회는 언젠가 열리겠죠...?</p>',
      createdById: superAdminUser.id,
      groupId: privateGroup.id,
      startTime: dayjs().add(-1, 'hour').add(1, 'year').toDate(),
      endTime: dayjs().add(2, 'hour').add(1, 'year').toDate(),
      config: {
        isVisible: true,
        isRankVisible: true
      }
    }
  })

  // add problems to contest
  for (const problem of problems) {
    await prisma.contestProblem.create({
      data: {
        id: String(problem.id),
        contestId: contest.id,
        problemId: problem.id
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
        id: String(problem.id),
        workbookId: workbooks[0].id,
        problemId: problem.id
      }
    })
    await prisma.workbookProblem.create({
      data: {
        id: String(problem.id),
        workbookId: privateWorkbooks[0].id,
        problemId: problem.id
      }
    })
  }
}

const createSubmissions = async () => {
  const generateHash = () => {
    return Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0')
  }

  submissions.push(
    await prisma.submission.create({
      data: {
        id: generateHash(),
        userId: users[0].id,
        problemId: problems[0].id,
        contestId: contest.id,
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

  submissions.push(
    await prisma.submission.create({
      data: {
        id: generateHash(),
        userId: users[1].id,
        problemId: problems[1].id,
        contestId: contest.id,
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
      id: submissions[0].id
    },
    data: { result: ResultStatus.WrongAnswer }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        id: generateHash(),
        userId: users[2].id,
        problemId: problems[2].id,
        contestId: contest.id,
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
      id: submissions[0].id
    },
    data: { result: ResultStatus.CompileError }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        id: generateHash(),
        userId: users[3].id,
        problemId: problems[3].id,
        contestId: contest.id,
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
      id: submissions[0].id
    },
    data: { result: ResultStatus.RuntimeError }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        id: generateHash(),
        userId: users[4].id,
        problemId: problems[4].id,
        contestId: contest.id,
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
      id: submissions[0].id
    },
    data: { result: ResultStatus.TimeLimitExceeded }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        id: generateHash(),
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
      id: submissions[0].id
    },
    data: { result: ResultStatus.MemoryLimitExceeded }
  })

  submissions.push(
    await prisma.submission.create({
      data: {
        id: generateHash(),
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
      id: submissions[0].id
    },
    data: { result: ResultStatus.OutputLimitExceeded }
  })
}

const createAnnouncements = async () => {
  for (let i = 0; i < 10; ++i) {
    announcements.push(
      await prisma.announcement.create({
        data: {
          content: `Announcement_${i}`
        }
      })
    )
  }

  for (let i = 0; i < 5; ++i) {
    if (!problems[i] || !announcements[i]) {
      continue
    }
    await prisma.problemAnnouncement.create({
      data: {
        problemId: problems[i].id,
        announcementId: announcements[i].id
      }
    })
  }

  for (let i = 0; i < 5; ++i) {
    if (!contest || !announcements[i]) {
      continue
    }
    await prisma.contestAnnouncement.create({
      data: {
        contestId: contest.id,
        announcementId: announcements[i].id
      }
    })
  }
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
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    process.exit(1)
  })
