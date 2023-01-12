<script setup lang="ts">
import Namebox from './Namebox.vue'
import Button from '@/common/components/Atom/Button.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import { ref } from 'vue'

defineProps<{
  id: number
  createdBy: number
}>()

const isModalVisible = ref(false)
function close() {
  isModalVisible.value = false
}
// TODO : Yes 눌렀을때 API 호출하도록 변경 필요

const groupAdmin = [
  { id: 1, username: '하솔비', studentId: '201831xxxx', role: 'group_admin' },
  { id: 3, username: '하솔비', studentId: '201833xxxx', role: 'group_admin' },
  { id: 7, username: '하솔비', studentId: '201837xxxx', role: 'group_admin' },
  { id: 8, username: '하솔비', studentId: '201838xxxx', role: 'group_admin' },
  { id: 9, username: '하솔비', studentId: '201839xxxx', role: 'group_admin' },
  { id: 11, username: '하솔비', studentId: '201831xxxx', role: 'group_admin' }
]

const groupMember = [
  { id: 2, username: '하솔비', studentId: '201832xxxx', role: 'user' },
  { id: 4, username: '하솔비', studentId: '201834xxxx', role: 'user' },
  { id: 5, username: '하솔비', studentId: '201835xxxx', role: 'user' },
  { id: 6, username: '하솔비', studentId: '201836xxxx', role: 'user' },
  { id: 10, username: '하솔비', studentId: '201832xxxx', role: 'user' }
]
</script>

<template>
  <div class="relative mx-auto mb-32">
    <Namebox
      class="mb-12"
      title="Manager"
      :user-list="groupAdmin"
      :creator="createdBy"
    />
    <Namebox
      class="mb-28"
      title="Member"
      :user-list="groupMember"
      :creator="createdBy"
    />
    <Button class="absolute right-0 -bottom-20" @click="isModalVisible = true">
      Leave Group
    </Button>
    <Modal
      v-model="isModalVisible"
      title="Skku coding platform"
      title-color="green"
      class="h-48 w-80"
    >
      <template #modal-title>Leave Group</template>
      <template #modal-content>
        Do you really want to leave group?
        <Button class="m-4 mt-6 w-20" @click="close">Yes</Button>
        <Button class="m-4 mt-6 w-20" @click="close">No</Button>
      </template>
    </Modal>
  </div>
</template>
