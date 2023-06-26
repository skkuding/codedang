<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import Pagination from '@/common/components/Molecule/Pagination.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import IconUserGroup from '~icons/fa6-solid/user-group'

type Group = {
  id: number
  createdBy: number
  groupName: string
  groupAdmin: string
  groupManager: string
  isPrivate: boolean
  invitationCode: string
  description: string
  member: number
  createdUser: string
  belong: boolean
  groupImage?: string
}

//getMyGroups
const myGroupList: Group[] = [
  {
    id: 1,
    createdBy: 1,
    groupName: 'SKKUDING',
    groupAdmin: 'Prof. Kim',
    groupManager: '홍길동',
    isPrivate: false,
    invitationCode: 'abcde',
    description: '성균관대학교 개발동아리입니다 성균관대학교 개발동아리입니다',
    member: 23,
    createdUser: '구성현',
    belong: true,
    groupImage: 'https://www.skku.edu/_res/skku/img/skku_s.png'
  },
  {
    id: 2,
    createdBy: 1,
    groupName: 'TSS',
    groupAdmin: 'Prof. Kim',
    groupManager: '홍길동',
    isPrivate: false,
    invitationCode: 'cdefg',
    description: '성균관대학교 개발동아리입니다',
    member: 10,
    createdUser: '구성현',
    belong: true
  }
]

//getNonPrivateGroups
const allGroupList: Group[] = [
  {
    id: 1,
    createdBy: 1,
    groupName: 'SKKUDING',
    groupAdmin: 'Prof. Kim',
    groupManager: '홍길동',
    isPrivate: false,
    invitationCode: 'abcde',
    description: '성균관대학교 개발동아리입니다',
    member: 10,
    createdUser: '구성현',
    belong: false,
    groupImage: 'https://www.skku.edu/_res/skku/img/skku_s.png'
  },
  {
    id: 2,
    createdBy: 1,
    groupName: 'TSS',
    groupAdmin: 'Prof. Kim',
    groupManager: '홍길동',
    isPrivate: false,
    invitationCode: 'cdefg',
    description: '성균관대학교 개발동아리입니다',
    member: 10,
    createdUser: '구성현',
    belong: false
  },
  {
    id: 3,
    createdBy: 1,
    groupName: 'TSS',
    groupAdmin: 'Prof. Kim',
    groupManager: '홍길동',
    isPrivate: false,
    invitationCode: 'cdefg',
    description:
      '성균관대학교 개발동아리입니다, 성균관대학교 개발동아리입니다, 성균관대학교 개발동아리입니다, 성균관대학교 개발동아리입니다',
    member: 10,
    createdUser: '구성현',
    belong: false,
    groupImage: 'https://www.skku.edu/_res/skku/img/skku_s.png'
  },
  {
    id: 4,
    createdBy: 1,
    groupName: 'TSS',
    groupAdmin: 'Prof. Kim',
    groupManager: '홍길동',
    isPrivate: false,
    invitationCode: 'cdefg',
    description: '성균관대학교 개발동아리입니다',
    member: 10,
    createdUser: '구성현',
    belong: false
  },
  {
    id: 5,
    createdBy: 1,
    groupName: 'SKKUDING',
    groupAdmin: 'Prof. Kim',
    groupManager: '홍길동',
    isPrivate: false,
    invitationCode: 'abcde',
    description: '성균관대학교 개발동아리입니다',
    member: 23,
    createdUser: '구성현',
    belong: false,
    groupImage: 'https://www.skku.edu/_res/skku/img/skku_s.png'
  },
  {
    id: 6,
    createdBy: 1,
    groupName: 'TSS',
    groupAdmin: 'Prof. Kim',
    groupManager: '홍길동',
    isPrivate: true,
    invitationCode: 'cdefg',
    description: '성균관대학교 개발동아리입니다',
    member: 10,
    createdUser: '구성현',
    belong: false
  },
  {
    id: 7,
    createdBy: 1,
    groupName: 'TSS',
    groupAdmin: 'Prof. Kim',
    groupManager: '홍길동',
    isPrivate: false,
    invitationCode: 'cdefg',
    description: '성균관대학교 개발동아리입니다',
    member: 10,
    createdUser: '구성현',
    belong: false
  }
]

const props = defineProps<{
  title: string
  pagination?: boolean
  isMyGroup: boolean
}>()

const COLOR_CLASS = [
  'bg-green-dark',
  'bg-green',
  'bg-gray',
  'bg-blue',
  'bg-blue-dark',
  'bg-red'
]

const groupList = props.isMyGroup ? myGroupList : allGroupList // dummy data
const selectedGroup = ref<Group | undefined>(groupList[0])
const currentPage = ref(1)
const modalVisible = ref(false)
const modalType = ref('desc')
const router = useRouter()
const goGroup = (id: number) => {
  const group = groupList.find((item) => item.id === id)
  // 사용자가 해당 group에 소속되어 있으면
  if (group?.belong) router.push(`/group/${id}`)
  // 소속 되어 있지 않으면
  else {
    selectedGroup.value = group
    modalVisible.value = true
  }
}
watch(modalVisible, (value) => {
  if (!value) {
    modalType.value = 'desc'
  }
})
const joinGroup = () => {
  // call API
  modalType.value = 'info' // 성공 로직
}
</script>

<template>
  <section class="mb-20 flex flex-col gap-4">
    <div class="flex flex-wrap justify-between gap-6">
      <PageTitle :text="title" />
      <SearchBar
        v-if="!isMyGroup && groupList.length !== 0"
        class="self-end"
        placeholder="그룹 이름을 검색해보세요!"
      />
    </div>
    <p v-if="groupList.length === 0" class="text-gray-dark py-6 text-center">
      No Group
    </p>
    <div v-else class="flex flex-col gap-16">
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        <article
          v-for="(
            { id, groupName, description, member, groupImage, createdUser },
            index
          ) in groupList.filter((group) =>
            group.belong ? true : !group.isPrivate
          )"
          :key="id"
          class="border-gray hover:outline-gray relative flex cursor-pointer flex-col items-center gap-4 rounded-md border p-4 shadow-md hover:shadow-xl hover:outline hover:outline-1"
          @click="goGroup(id)"
        >
          <img v-if="groupImage" :src="groupImage" class="h-16 w-16" />
          <div
            v-else
            :class="COLOR_CLASS[index % COLOR_CLASS.length]"
            class="flex h-16 w-16 items-center justify-center rounded text-white"
          >
            {{ groupName.slice(0, 2) }}
          </div>
          <h1 class="text-center text-2xl font-bold">{{ groupName }}</h1>
          <p class="line-clamp-2 flex grow items-center text-center">
            {{ description }}
          </p>
          <div
            class="flex w-full flex-wrap items-center justify-between self-end text-sm"
          >
            <p>Creator: {{ createdUser }}</p>
            <p class="text-text-subtitle flex gap-2 font-bold">
              <IconUserGroup />
              {{ member }}
            </p>
          </div>
        </article>
      </div>
      <Pagination
        v-if="pagination"
        v-model="currentPage"
        :number-of-pages="3"
        class="self-center"
      />
    </div>
  </section>

  <Modal v-model="modalVisible">
    <transition
      enter-active-class="transition-opacity"
      leave-active-class="transition-opacity"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
      mode="out-in"
    >
      <div
        v-if="modalType === 'desc' && selectedGroup"
        class="w-full max-w-[600px] p-14"
      >
        <PageTitle :text="selectedGroup.groupName" />
        <div class="mb-8 mt-4 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
          <div class="border-green flex flex-col gap-2 border-l-2 py-4 pl-6">
            <PageSubtitle text="Description" />
            <p class="w-full font-bold">{{ selectedGroup.description }}</p>
          </div>
          <div class="border-green flex flex-col gap-6 border-l-2 py-4 pl-6">
            <div class="flex flex-col gap-1 font-bold">
              <PageSubtitle text="Member" />
              {{ selectedGroup.member }}
            </div>
            <div class="flex flex-col gap-1 font-bold">
              <PageSubtitle text="Group Admin" />
              {{ selectedGroup.groupAdmin }}
            </div>
            <div class="flex flex-col gap-1 font-bold">
              <PageSubtitle text="Group Manager" />
              {{ selectedGroup.groupManager }}
            </div>
          </div>
        </div>
        <Button class="absolute right-10 rounded-2xl px-4" @click="joinGroup">
          Join
        </Button>
      </div>

      <div
        v-else-if="modalType === 'info'"
        class="max-w-96 flex w-full items-center justify-center px-6 py-12"
      >
        <p class="text-center font-bold">
          Invitation succesfully requested!
          <br />
          Please wait for group manager’s approval :)
        </p>
      </div>
    </transition>
  </Modal>
</template>
