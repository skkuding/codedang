<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import IconUp from '~icons/fa/arrow-up'
import IconDown from '~icons/fa/arrow-down'
import IconTrash from '~icons/fa/trash-o'
import IconCheck from '~icons/fa/check'
import IconClose from '~icons/fa/close'
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
      <template #_option="{}">
        <div class="flex items-center gap-2">
          <Button class="flex h-[32px] w-[32px] items-center justify-center">
            <IconDown></IconDown>
          </Button>
          <Button class="flex h-[32px] w-[32px] items-center justify-center">
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
      <template #_option="{}">
        <div class="flex items-center gap-2">
          <Button class="flex h-[32px] w-[32px] items-center justify-center">
            <IconUp></IconUp>
          </Button>
          <Button class="flex h-[32px] w-[32px] items-center justify-center">
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
      <template #_option="{}">
        <div class="flex items-center gap-2">
          <Button class="flex h-[32px] w-[32px] items-center justify-center">
            <IconCheck></IconCheck>
          </Button>
          <Button class="flex h-[32px] w-[32px] items-center justify-center">
            <IconClose></IconClose>
          </Button>
        </div>
      </template>
    </PaginationTable>
  </div>
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
