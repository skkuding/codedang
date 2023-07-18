<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { ref } from 'vue'
import IconDown from '~icons/fa/arrow-down'
import IconUp from '~icons/fa/arrow-up'
import IconCheck from '~icons/fa/check'
import IconClose from '~icons/fa/close'
import IconTrash from '~icons/fa/trash-o'

const selectedName = ref('')
const deleteModal = ref(false)
const changeModal = ref(false)
const changeToX = ref('')
const approvalModal = ref(false)
const approvalStat = ref('')
</script>

<template>
  <div class="flex flex-col">
    <div class="text-right text-lg font-semibold">SKKUDING</div>
    <div class="bg-gray h-[1px]"></div>
    <div class="mt-10">
      <h1 class="text-gray-dark mr-6 inline text-2xl font-semibold">Member</h1>
      <Button>+ Register</Button>
    </div>
    <h2 class="mt-8 text-lg font-semibold">Group Manager</h2>
    <PaginationTable
      :fields="[
        {
          key: 'studentId',
          label: 'Student ID',
          width: '20%'
        },
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
      ]"
      :items="[
        {
          studentId: '2019123456',
          userId: 'goo314',
          realName: '구성현',
          email: 'goo@skku.edu',
          option: '123'
        }
      ]"
      placeholder="keywords"
      :number-of-pages="3"
      :no-search-bar="true"
      :no-pagination="true"
    >
      <template #_option="{ row }">
        <div class="flex items-center gap-2">
          <Button
            class="flex h-[32px] w-[32px] items-center justify-center"
            @click="
              (changeModal = true),
                (changeToX = 'member'),
                (selectedName = row.realName)
            "
          >
            <IconDown></IconDown>
          </Button>
          <Button
            class="flex h-[32px] w-[32px] items-center justify-center"
            @click="(deleteModal = true), (selectedName = row.realName)"
          >
            <IconTrash></IconTrash>
          </Button>
        </div>
      </template>
    </PaginationTable>
    <h2 class="mt-24 text-lg font-semibold">Group Member</h2>
    <PaginationTable
      :fields="[
        {
          key: 'studentId',
          label: 'Student ID',
          width: '20%'
        },
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
      ]"
      :items="[
        {
          studentId: '2019123456',
          userId: 'goo314',
          realName: '구성현',
          email: 'goo@skku.edu',
          option: '123'
        }
      ]"
      placeholder="keywords"
      :number-of-pages="3"
    >
      <template #_option="{ row }">
        <div class="flex items-center gap-2">
          <Button
            class="flex h-[32px] w-[32px] items-center justify-center"
            @click="
              (changeModal = true),
                (changeToX = 'manager'),
                (selectedName = row.realName)
            "
          >
            <IconUp></IconUp>
          </Button>
          <Button
            class="flex h-[32px] w-[32px] items-center justify-center"
            @click="(deleteModal = true), (selectedName = row.realName)"
          >
            <IconTrash></IconTrash>
          </Button>
        </div>
      </template>
    </PaginationTable>
    <h2 class="mt-24 text-lg font-semibold">Group Member Approval</h2>
    <PaginationTable
      :fields="[
        {
          key: 'studentId',
          label: 'Student ID',
          width: '20%'
        },
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
      ]"
      :items="[
        {
          studentId: '2019123456',
          userId: 'goo314',
          realName: '구성현',
          email: 'goo@skku.edu',
          option: '123'
        }
      ]"
      placeholder="keywords"
      :number-of-pages="3"
    >
      <template #_option="{ row }">
        <div class="flex items-center gap-2">
          <Button
            class="flex h-[32px] w-[32px] items-center justify-center"
            @click="
              (approvalModal = true),
                (approvalStat = 'approve'),
                (selectedName = row.realName)
            "
          >
            <IconCheck></IconCheck>
          </Button>
          <Button
            class="flex h-[32px] w-[32px] items-center justify-center"
            @click="
              (approvalModal = true),
                (approvalStat = 'disapprove'),
                (selectedName = row.realName)
            "
          >
            <IconClose></IconClose>
          </Button>
        </div>
      </template>
    </PaginationTable>
  </div>
  <Modal v-model="changeModal">
    <div class="flex flex-col items-center gap-10">
      <h1 class="text-xl font-semibold">Change to {{ changeToX }}</h1>
      <div>
        Do you really want to change to {{ changeToX }} {{ selectedName }}?
      </div>
      <div class="flex">
        <Button class="mr-4 px-8 py-2">Yes</Button>
        <Button class="px-8 py-2">No</Button>
      </div>
    </div>
  </Modal>
  <Modal v-model="deleteModal">
    <div class="flex flex-col items-center gap-10">
      <h1 class="text-xl font-semibold">Remove User</h1>
      <div>Do you really want to remove {{ selectedName }}?</div>
      <div class="flex">
        <Button class="mr-4 px-8 py-2">Yes</Button>
        <Button class="px-8 py-2">No</Button>
      </div>
    </div>
  </Modal>
  <Modal v-model="approvalModal">
    <div class="flex flex-col items-center gap-10">
      <h1 class="text-xl font-semibold">Approval User</h1>
      <div>Do you really want to {{ approvalStat }} {{ selectedName }}?</div>
      <div class="flex">
        <Button class="mr-4 px-8 py-2">Yes</Button>
        <Button class="px-8 py-2">No</Button>
      </div>
    </div>
  </Modal>
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
