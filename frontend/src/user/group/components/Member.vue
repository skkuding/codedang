<script setup lang="ts">
import Namebox from './NameList.vue'
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

// dummy data
const groupAdmin = [
  { id: 1, username: '하솔비', studentId: '201831xxxx', role: 'group_admin' },
  { id: 3, username: '하솔비', studentId: '201833xxxx', role: 'group_admin' },
  { id: 7, username: '하솔비', studentId: '201837xxxx', role: 'group_admin' },
  { id: 8, username: '하솔비', studentId: '201838xxxx', role: 'group_admin' },
  { id: 9, username: '아무이름', studentId: '201839xxxx', role: 'group_admin' },
  { id: 11, username: '하하하', studentId: '201831xxxx', role: 'group_admin' }
]
const groupMember = [
  { id: 2, username: 'David Kim', studentId: '201832xxxx', role: 'user' },
  { id: 4, username: '하솔비', studentId: '201834xxxx', role: 'user' },
  { id: 5, username: '하솔비', studentId: '201835xxxx', role: 'user' },
  { id: 6, username: '하솔비', studentId: '201836xxxx', role: 'user' },
  { id: 10, username: '하솔비', studentId: '201832xxxx', role: 'user' }
]
</script>

<template>
  <div class="mx-auto mt-8 flex flex-col gap-20">
    <div class="flex flex-wrap justify-center gap-y-10 gap-x-20">
      <Namebox title="Manager" :user-list="groupAdmin" :creator="createdBy" />
      <Namebox title="Member" :user-list="groupMember" :creator="createdBy" />
    </div>
    <Button class="self-end" @click="isModalVisible = true">Leave Group</Button>
  </div>
  <Modal v-model="isModalVisible" class="shadow-md">
    <div class="flex flex-col items-center justify-center gap-6 p-8">
      <h1 class="text-lg font-bold">Leave Group</h1>
      <p>Do you really want to leave group?</p>
      <div class="flex gap-8">
        <Button class="w-20" @click="close">Yes</Button>
        <Button class="w-20" @click="close">No</Button>
      </div>
    </div>
  </Modal>
</template>
