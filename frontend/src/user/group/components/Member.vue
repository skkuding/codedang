<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import { useToast } from '@/common/composables/toast'
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import NameList from './NameList.vue'

const router = useRouter()
const openToast = useToast()

const props = defineProps<{
  id: number
  createdBy: number
}>()

const isModalVisible = ref(false)
function close() {
  isModalVisible.value = false
}
// TODO : Yes 눌렀을때 API 호출하도록 변경 필요
// {
//   "userId": 2,
//   "groupId": 4,
//   "isGroupLeader": false,
//   "createTime": "2023-07-11T09:44:39.089Z",
//   "updateTime": "2023-07-11T09:44:39.089Z"
// }
const signout = async () => {
  isModalVisible.value = false
  try {
    await axios.delete(`/api/group/${props.id}/leave`)
    router.replace('/')
    openToast({ message: 'Successfully left the group!', type: 'success' })
  } catch (err) {
    router.replace('/404')
    openToast({ message: 'Something went wrong', type: 'error' })
  }
}

const groupAdmin = ref<string[]>([])
const groupMember = ref<string[]>([])

onMounted(async () => {
  try {
    await getList()
  } catch (err) {
    router.replace('/404')
  }
})

const getList = async () => {
  axios.get(`/api/group/${props.id}/members`).then((res) => {
    groupMember.value = res.data
  })
  axios.get(`/api/group/${props.id}/leaders`).then((res) => {
    groupAdmin.value = res.data
  })
}
</script>

<template>
  <div class="mx-auto mt-8 flex flex-col gap-20">
    <div class="flex flex-col justify-center gap-10">
      <NameList title="Manager" :user-list="groupAdmin" />
      <NameList title="Member" :user-list="groupMember" />
    </div>
    <Button class="self-end" @click="isModalVisible = true">Leave Group</Button>
  </div>
  <Modal v-model="isModalVisible" class="shadow-md">
    <div class="flex flex-col items-center justify-center gap-6 p-8">
      <h1 class="text-lg font-bold">Leave Group</h1>
      <p>Do you really want to leave group?</p>
      <div class="flex gap-8">
        <Button class="w-20" @click="signout">Yes</Button>
        <Button class="w-20" @click="close">No</Button>
      </div>
    </div>
  </Modal>
</template>
