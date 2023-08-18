<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import Dialog from '@/common/components/Molecule/Dialog.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { useDialog } from '@/common/composables/dialog'
import { ref } from 'vue'
import IconDown from '~icons/fa/arrow-down'
import IconUp from '~icons/fa/arrow-up'
import IconCheck from '~icons/fa/check'
import IconClose from '~icons/fa/close'
import IconTrash from '~icons/fa/trash-o'

type Row = {
  userId: string
  realName: string
  email: string
  option: string
}
const dialog = useDialog()

const selectedName = ref('')
const deleteModal = ref(false)
const changeModal = ref(false)
const changeToX = ref('')
const approvalModal = ref(false)
const approvalStat = ref('')

const fields = [
  {
    key: 'userId',
    label: 'User ID',
    width: '20%'
  },
  {
    key: 'realName',
    label: 'Real Name',
    width: '20%'
  },
  {
    key: 'email',
    label: 'Email',
    width: '20%'
  },
  {
    key: '_option',
    label: 'Option',
    width: '20%'
  }
]
const leaderItem: Row[] = [
  {
    userId: 'goo314',
    realName: '구성현',
    email: 'goo@skku.edu',
    option: '123'
  }
]
const memberItem: Row[] = [
  {
    userId: 'goo314',
    realName: '구성현',
    email: 'goo@skku.edu',
    option: '123'
  }
]
const memberApprovalItem: Row[] = [
  {
    userId: 'goo314',
    realName: '구성현',
    email: 'goo@skku.edu',
    option: '123'
  }
]

const changeRole = (row: Row, role: 'member' | 'leader') => {
  changeToX.value = role
  selectedName.value = row.realName
  changeModal.value = true
  dialog.confirm({
    title: 'Change Role',
    content: `Do you really want to change ${selectedName.value} to ${changeToX.value}`
  })
}
const deleteUser = (row: Row) => {
  selectedName.value = row.realName
  deleteModal.value = true
  dialog.confirm({
    title: 'Remove User',
    content: `Do you really want to remove ${selectedName.value}?`
  })
}
const approveOption = (row: Row, stat: 'approve' | 'disapprove') => {
  approvalStat.value = stat
  selectedName.value = row.realName
  approvalModal.value = true
  dialog.confirm({
    title: 'Approval User',
    content: `Do you really want to ${approvalStat.value} ${selectedName.value}?`
  })
}
</script>

<template>
  <div class="flex flex-col">
    <div class="text-right text-lg font-semibold">SKKUDING</div>
    <div class="bg-gray h-[1px]" />
    <div class="mt-10">
      <h1 class="text-gray-dark mr-6 inline text-2xl font-semibold">Member</h1>
      <Button>+ Register</Button>
    </div>
    <h2 class="mt-8 text-lg font-semibold">Group Leaders</h2>
    <PaginationTable
      :fields="fields"
      :items="leaderItem"
      placeholder="keywords"
      :number-of-pages="3"
      no-search-bar
      no-pagination
    >
      <template #_option="{ row }">
        <div class="flex items-center gap-2">
          <Button
            class="flex h-[32px] w-[32px] items-center justify-center"
            @click="changeRole(row, 'member')"
          >
            <IconDown />
          </Button>
          <Button
            class="flex h-[32px] w-[32px] items-center justify-center"
            @click="deleteUser(row)"
          >
            <IconTrash />
          </Button>
        </div>
      </template>
    </PaginationTable>
    <h2 class="mt-24 text-lg font-semibold">Group Members</h2>
    <PaginationTable
      :fields="fields"
      :items="memberItem"
      placeholder="keywords"
      :number-of-pages="3"
    >
      <template #_option="{ row }">
        <div class="flex items-center gap-2">
          <Button
            class="flex h-[32px] w-[32px] items-center justify-center"
            @click="changeRole(row, 'leader')"
          >
            <IconUp />
          </Button>
          <Button
            class="flex h-[32px] w-[32px] items-center justify-center"
            @click="deleteUser(row)"
          >
            <IconTrash />
          </Button>
        </div>
      </template>
    </PaginationTable>
    <h2 class="mt-24 text-lg font-semibold">Group Member Approval</h2>
    <PaginationTable
      :fields="fields"
      :items="memberApprovalItem"
      placeholder="keywords"
      :number-of-pages="3"
    >
      <template #_option="{ row }">
        <div class="flex items-center gap-2">
          <Button
            class="flex h-[32px] w-[32px] items-center justify-center"
            @click="approveOption(row, 'approve')"
          >
            <IconCheck />
          </Button>
          <Button
            class="flex h-[32px] w-[32px] items-center justify-center"
            @click="approveOption(row, 'disapprove')"
          >
            <IconClose />
          </Button>
        </div>
      </template>
    </PaginationTable>
  </div>

  <Dialog
    v-if="changeModal"
    @yes="changeModal = false"
    @no="changeModal = false"
  />
  <Dialog
    v-if="deleteModal"
    @yes="deleteModal = false"
    @no="deleteModal = false"
  />
  <Dialog
    v-if="approvalModal"
    @yes="approvalModal = false"
    @no="approvalModal = false"
  />
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
