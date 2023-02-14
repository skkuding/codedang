<script setup lang="ts">
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import Pagination from '@/common/components/Molecule/Pagination.vue'
import CardItem from '@/common/components/Molecule/CardItem.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import Button from '@/common/components/Atom/Button.vue'

import { ref } from 'vue'
import { useRouter } from 'vue-router'

type Group = {
  id: number
  createdBy: number
  groupName: string
  groupAdmin: string
  groupManager: string
  private: boolean
  invitationCode: string
  description: string
  member: number
  createdUser: string
}

const props = defineProps<{
  title: string
  groupList: Group[]
  pagination?: boolean
}>()

const selectedGroup = ref<Group | undefined>(props.groupList[0])

const router = useRouter()

const currentPage = ref(1)
const modalVisible = ref(false)

const belongGroup = ref(false)
const modalswitch = ref('desc')

const goGroup = (id: number) => {
  // 사용자가 해당 group에 소속되어 있으면
  if (belongGroup.value) router.push(`/group/${id}`)
  // 소속 되어 있지 않으면
  else {
    selectedGroup.value = props.groupList.find((item) => item.id === id)
    modalVisible.value = true
    modalswitch.value = 'desc'
  }
}
</script>

<template>
  <section class="mb-20">
    <PageTitle :text="title" />
    <p v-if="groupList.length === 0" class="py-5 text-center">No Group</p>
    <div v-else class="flex flex-col gap-4">
      <SearchBar class="self-end" />
      <CardItem
        v-for="group in groupList"
        :key="group.id"
        :title="group.groupName"
        :description="group.description"
        :additional-text="'Member: ' + group.member"
        :colored-text="'Created By ' + group.createdUser"
        border-color="gray"
        @click="goGroup(group.id)"
      />
      <Pagination
        v-if="pagination"
        v-model="currentPage"
        :number-of-pages="3"
        class="self-end"
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
        v-if="modalswitch === 'desc' && selectedGroup"
        class="w-[600px] p-14"
      >
        <PageTitle :text="selectedGroup.groupName" />
        <div class="mt-4 mb-8 flex">
          <div
            class="border-green mr-8 flex flex-col gap-2 border-l-2 py-4 pl-6"
          >
            <PageSubtitle text="Description" />
            <p class="font-bold">{{ selectedGroup.description }}</p>
          </div>
          <div
            class="border-green mr-8 flex flex-col gap-6 border-l-2 py-4 pl-6 text-left"
          >
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
        <Button class="absolute right-10" @click="modalswitch = 'info'">
          Join
        </Button>
      </div>

      <div
        v-else-if="modalswitch === 'info'"
        class="flex h-48 w-96 items-center justify-center"
      >
        <p class="text-center">
          Invitation succesfully requested!
          <br />
          Please wait for group manager’s approval :)
        </p>
      </div>
    </transition>
  </Modal>
</template>
