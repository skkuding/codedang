<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import Pagination from '@/common/components/Molecule/Pagination.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import AuthModal from '@/common/components/Organism/AuthModal.vue'
import { useListAPI } from '@/common/composables/api'
import { useAuthStore } from '@/common/store/auth'
import { OnClickOutside } from '@vueuse/components'
import axios from 'axios'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import IconGear from '~icons/fa6-solid/gear'
import IconUserGroup from '~icons/fa6-solid/user-group'

const isMenuOpen = ref(false)
const modalContent = ref<'login' | 'close'>('close')

type Group = {
  id: number
  groupName: string
  description: string
  memberNum: number
  groupImage?: string
  isGroupLeader: boolean
}

type OneGroup = {
  id: number
  groupName: string
  description: string
  isGroupLeader?: boolean
  allowJoin?: boolean
  memberNum?: number
  isJoined: boolean
  leaders?: string[]
}

const COLOR_CLASS = [
  'bg-green-dark',
  'bg-green',
  'bg-gray',
  'bg-blue',
  'bg-blue-dark',
  'bg-red'
]

const props = defineProps<{
  title: string
  isMyGroup: boolean
}>()
const groupList = ref<Group[]>([])
const store = useAuthStore()
const currentPage = ref(1)
const totalPages = ref(1)

if (props.isMyGroup) {
  axios.get('/api/group/joined').then(({ data }) => {
    groupList.value.push(...data)
  })
} else {
  const {
    items,
    totalPages: totalPageCnt,
    changePage
  } = useListAPI<Group>('group', 8, 5)
  watch(totalPageCnt, (newValue) => {
    totalPages.value = newValue
  })
  watch(items, (newValue) => {
    if (newValue.length !== 0) {
      groupList.value = [...newValue]
    }
  })
  watch(currentPage, (page) => {
    changePage(page)
  })
}
const selectedGroup = ref<OneGroup | undefined>({
  id: 1,
  groupName: '',
  description: '',
  isJoined: false,
  memberNum: 0
})

const modalVisible = ref(false)
const modalType = ref('desc')
const router = useRouter()
const goGroup = async (id: number) => {
  const { data } = await axios.get(`/api/group/${id}`)
  // 사용자가 해당 group에 소속되어 있으면
  if (data.isJoined) router.push(`/group/${id}`)
  // 소속 되어 있지 않으면
  else {
    selectedGroup.value = data
    modalVisible.value = true
  }
}
watch(modalVisible, (value) => {
  if (!value && modalType.value === 'info') {
    router.go(0)
    modalType.value = 'desc'
  } else if (!value) {
    modalType.value = 'desc'
  }
})
const joinGroup = async (id: number) => {
  try {
    const { data } = await axios.post(`/api/group/${id}/join`)
    if (!data.isJoined && data.requireApprovalBeforeJoin) {
      //need approval
      modalType.value = 'wait'
    } else {
      modalType.value = 'info' // 성공 로직
    }
  } catch {
    modalType.value = 'error'
  }
}
</script>

<template>
  <OnClickOutside @trigger="isMenuOpen = false">
    <section class="mb-20 flex flex-col gap-4">
      <div class="flex flex-wrap justify-between gap-6">
        <PageTitle :text="title" />
        <SearchBar
          v-if="!isMyGroup && groupList.length !== 0"
          class="self-end"
          placeholder="Search group names!"
        />
      </div>
      <p v-if="groupList.length === 0" class="text-gray-dark py-6 text-center">
        No Group
      </p>
      <div v-else class="flex flex-col gap-16">
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <article
            v-for="(
              {
                id,
                groupName,
                description,
                memberNum,
                groupImage,
                isGroupLeader
              },
              index
            ) in groupList"
            :key="id"
            class="border-gray hover:outline-gray relative flex cursor-pointer flex-col items-center gap-4 rounded-md border p-4 shadow-md hover:shadow-xl hover:outline hover:outline-1"
            @click="!store.isLoggedIn ? (modalContent = 'login') : goGroup(id)"
          >
            <div class="flex w-full flex-1 flex-row justify-center">
              <img v-if="groupImage" :src="groupImage" class="h-16 w-16" />
              <div
                v-else
                :class="COLOR_CLASS[index % COLOR_CLASS.length]"
                class="flex h-16 w-16 items-center justify-center rounded text-white"
              >
                {{ groupName.slice(0, 2) }}
              </div>
              <IconGear
                v-if="isGroupLeader"
                class="border-pink absolute right-7 my-2 h-4 w-4"
                @click.stop="$router.push(`/admin/${id}`)"
              />
            </div>

            <h1 class="text-center text-2xl font-bold">{{ groupName }}</h1>
            <p class="line-clamp-3 items-center text-center">
              {{ description }}
            </p>
            <div
              class="flex w-full flex-wrap items-center justify-between self-end text-sm"
            >
              <p class="text-text-subtitle flex gap-2 font-bold">
                <IconUserGroup />
                {{ memberNum }}
              </p>
            </div>
          </article>
        </div>
        <Pagination
          v-if="!isMyGroup"
          v-model="currentPage"
          :number-of-pages="totalPages"
          class="self-center"
        />
      </div>
    </section>

    <Modal v-model="modalVisible">
      <!-- TODO: modal을 dialog로 변경 -->
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
                <p class="mb-4">{{ selectedGroup.memberNum || 0 }}</p>
                <PageSubtitle text="Group Manager" />
                <span
                  v-for="(item, index) in selectedGroup.leaders"
                  :key="index"
                  class="border-green border-1 w-17 mb-1 rounded-lg border px-2 py-0.5"
                >
                  {{ item }}
                </span>
              </div>
            </div>
          </div>
          <Button
            v-if="selectedGroup.allowJoin"
            class="absolute right-10 rounded-2xl px-4"
            @click="joinGroup(selectedGroup.id)"
          >
            Join
          </Button>
        </div>

        <div
          v-else-if="modalType === 'info'"
          class="flex w-full max-w-96 items-center justify-center px-6 py-12"
        >
          <p class="text-center font-bold">
            Invitation has been succeed!
            <br />
            Welcome to group {{ selectedGroup?.groupName }} :)
          </p>
        </div>
        <div
          v-else-if="modalType === 'wait'"
          class="flex w-full max-w-96 items-center justify-center px-6 py-12"
        >
          <p class="text-center font-bold">
            Invitation succesfully requested!
            <br />
            Please wait for group manager’s approval :)
          </p>
        </div>
        <div
          v-else-if="modalType === 'error'"
          class="flex w-full max-w-96 items-center justify-center px-6 py-12"
        >
          <p class="text-center font-bold">
            You have already joined or sent request to this group!
            <br />
            Duplicated join request is not allowed.
          </p>
        </div>
      </transition>
    </Modal>
  </OnClickOutside>
  <AuthModal v-model="modalContent" />
</template>
