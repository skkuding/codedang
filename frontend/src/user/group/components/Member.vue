<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import Dialog from '@/common/components/Molecule/Dialog.vue'
import { useDialog } from '@/common/composables/dialog'
import { useToast } from '@/common/composables/toast'
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import NameList from './NameList.vue'

const props = defineProps<{
  id: number
}>()

const showLeaveModal = ref(false)
const showErrorModal = ref(false)

const groupLeader = ref<string[]>([])
const groupMember = ref<string[]>([])

const openToast = useToast()
const dialog = useDialog()
const router = useRouter()

const clickLeave = () => {
  showLeaveModal.value = true
  dialog.confirm({
    title: 'Leave Group',
    content: 'Do you really want to leave group?',
    yes: 'Yes'
  })
}

const leave = async () => {
  showLeaveModal.value = false
  try {
    await axios.delete(`/api/group/${props.id}/leave`)
    router.replace('/group')
    openToast({ message: 'Successfully left the group!', type: 'success' })
  } catch (err) {
    // when the last leader tries to leave a group
    showErrorModal.value = true
    dialog.error({
      title: 'Request Failed',
      content: "You can't leave this group"
    })
  }
}

onMounted(async () => {
  try {
    const { data: member } = await axios.get(`/api/group/${props.id}/members`)
    const { data: leader } = await axios.get(`/api/group/${props.id}/leaders`)

    groupMember.value = member
    groupLeader.value = leader
  } catch (err) {
    router.replace('/404')
  }
})
</script>

<template>
  <div class="mx-auto mt-8 flex flex-col gap-20">
    <div class="flex flex-col justify-center gap-10">
      <NameList title="Leader" :user-list="groupLeader" />
      <NameList title="Member" :user-list="groupMember" />
    </div>
    <Button class="self-end" @click="clickLeave">Leave Group</Button>
  </div>
  <Dialog v-if="showLeaveModal" @yes="leave" @no="showLeaveModal = false" />
  <Dialog v-if="showErrorModal" @yes="showErrorModal = false" />
</template>
