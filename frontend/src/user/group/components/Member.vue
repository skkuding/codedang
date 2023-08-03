<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import Dialog from '@/common/components/Molecule/Dialog.vue'
import { useDialog } from '@/common/composables/dialog'
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import NameList from './NameList.vue'

const props = defineProps<{
  id: number
  createdBy: number
}>()

const showLeaveModal = ref(false)
const showErrorModal = ref(false)

const dialog = useDialog()
const router = useRouter()

const user = ref({ leader: [], member: [] })

const leave = async () => {
  showLeaveModal.value = false
  try {
    await axios.delete(`/api/group/${props.id}/leave`)
    router.push('/group')
  } catch (e) {
    showErrorModal.value = true
    dialog.error({
      title: 'Request Failed',
      content: "You can't leave this group"
    })
  }
}

const clickLeave = () => {
  showLeaveModal.value = true
  dialog.confirm({
    title: 'Leave Group',
    content: 'Do you really want to leave group?',
    yes: 'yes'
  })
}

onMounted(async () => {
  const groupLeader = await axios.get(`/api/group/${props.id}/leaders`)
  const groupMember = await axios.get(`/api/group/${props.id}/members`)
  user.value.leader = groupLeader.data
  user.value.member = groupMember.data
})
</script>

<template>
  <div class="mx-auto mt-8 flex flex-col gap-20">
    <div class="flex flex-col justify-center gap-10">
      <NameList title="Leader" :user-list="user.leader" />
      <NameList title="Member" :user-list="user.member" />
    </div>
    <Button class="self-end" @click="clickLeave()">Leave Group</Button>
  </div>
  <Dialog v-if="showLeaveModal" @yes="leave" />
  <Dialog v-if="showErrorModal" />
</template>
