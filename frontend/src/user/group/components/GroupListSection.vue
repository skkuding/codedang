<script setup lang="ts">
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import Pagination from '@/common/components/Molecule/Pagination.vue'
import CardItem from '@/common/components/Molecule/CardItem.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import Button from '@/common/components/Atom/Button.vue'
import BaselineArrowForward from '~icons/ic/baseline-arrow-forward'

import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

type Group = {
  id: number
  createdBy: number
  groupName: string
  private: boolean
  invitationCode: string
  description: string
  member: number
  createdUser: string
}

defineProps<{
  title: string
  groupList: Group[]
  pagination?: boolean
}>()

const selectedGroup: Group = {
  id: 2,
  createdBy: 1,
  groupName: 'TSS',
  private: false,
  invitationCode: 'cdefg',
  description: '성균관대학교 개발동아리입니다',
  member: 10,
  createdUser: '구성현'
}

const router = useRouter()

const currentPage = ref(1)
const ModalVisible = ref(false)

const belongGroup = ref(false)
const modalswitch = ref('desc')
watch(ModalVisible, () => {
  if (!ModalVisible.value) modalswitch.value = 'desc'
})

const goGroup = (id: number) => {
  // 사용자가 해당 group에 소속되어 있으면
  if (belongGroup.value) router.push('/group/' + id)
  // 소속 되어 있지 않으면
  else {
    ModalVisible.value = true
  }
}
</script>

<template>
  <div class="mb-20">
    <PageTitle :text="title" />
    <div class="mb-4 flex w-full justify-end"><SearchBar /></div>
    <div v-if="groupList.length === 0" class="text-center">No Group</div>
    <div v-else>
      <CardItem
        v-for="group in groupList"
        :key="group.id"
        :title="group.groupName"
        :description="group.description"
        :additional-text="'Member: ' + group.member"
        :colored-text="'Created By ' + group.createdUser"
        border-color="gray"
        class="mb-4"
        @click="goGroup(group.id)"
      />
    </div>
    <div v-if="pagination" class="flex w-full justify-end">
      <Pagination v-model="currentPage" :number-of-pages="3" />
    </div>
  </div>

  <Modal v-model="ModalVisible">
    <transition
      enter-active-class="transition-opacity"
      leave-active-class="transition-opacity"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
      mode="out-in"
    >
      <div v-if="modalswitch === 'desc'" class="h-96 w-[600px] p-14">
        <PageTitle :text="selectedGroup.groupName" />
        <div class="mt-4 mb-8 flex">
          <div class="border-green mr-8 border-l-2 pl-6 text-left">
            <PageSubtitle text="Description" />
            {{ selectedGroup.description }}
          </div>
          <div class="border-green mr-8 space-y-4 border-l-2 pl-6 text-left">
            <div>
              <PageSubtitle text="Member" />
              {{ selectedGroup.member }}
            </div>
            <div>
              <PageSubtitle text="Group Admin" />
              {{ selectedGroup.member }}
            </div>
            <div>
              <PageSubtitle text="Group Manager" />
              {{ selectedGroup.member }}
            </div>
          </div>
        </div>
        <Button class="absolute right-10" @click="modalswitch = 'info'">
          Join {{ selectedGroup.groupName }}
          <BaselineArrowForward class="inline" />
        </Button>
      </div>

      <div
        v-else-if="modalswitch === 'info'"
        class="flex h-48 w-96 items-center justify-center"
      >
        <div>
          Invitation succesfully requested!
          <br />
          Please wait for group manager’s approval :)
        </div>
      </div>
    </transition>
  </Modal>
</template>
