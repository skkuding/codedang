<script setup lang="ts">
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import Pagination from '@/common/components/Molecule/Pagination.vue'
import CardItem from '@/common/components/Molecule/CardItem.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import Button from '@/common/components/Atom/Button.vue'
import BaselineArrowForward from '~icons/ic/baseline-arrow-forward'

import { ref } from 'vue'
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
  currentPage?: number
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

const groupDescModalVisible = ref(false)
const closeGroupDescModal = () => {
  groupDescModalVisible.value = false
}

const infoModalVisible = ref(false)
const closeInfoModal = () => {
  infoModalVisible.value = false
}

const belongGroup = ref(true)

const goGroup = (id: number) => {
  // 사용자가 해당 group에 소속되어 있으면
  if (belongGroup.value) router.push('/group/' + id)
  // 소속 되어 있지 않으면
  else groupDescModalVisible.value = true
}
</script>

<template>
  <div class="mb-20">
    <PageTitle :text="title" />
    <div class="mb-4 flex w-full justify-end"><SearchBar /></div>
    <div v-if="groupList.length === 0" class="text-center">No Group</div>
    <CardItem
      v-for="group in groupList"
      v-else
      :key="group.id"
      :title="group.groupName"
      :description="group.description"
      :additional-text="'Member: ' + group.member"
      :colored-text="'Created By ' + group.createdUser"
      border-color="gray"
      class="mb-4"
      @click="goGroup(group.id)"
    />
    <div v-if="pagination" class="flex w-full justify-end">
      <Pagination :modelvalue="currentPage" :numberOfPages="3" />
    </div>
  </div>
  <Modal
    v-if="groupDescModalVisible"
    class="h-96 w-[600px]"
    @close="closeGroupDescModal"
  >
    <template #modal-title>{{ selectedGroup.groupName }}</template>
    <template #modal-content>
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
      <Button class="absolute right-0" @click="infoModalVisible = true">
        Join {{ selectedGroup.groupName }}
        <BaselineArrowForward class="inline" />
      </Button>
    </template>
  </Modal>
  <Modal v-if="infoModalVisible" class="h-48 w-96" @close="closeInfoModal">
    <template #modal-content>
      Invitation succesfully requested!
      <br />
      Please wait for group manager’s approval :)
    </template>
  </Modal>
</template>
