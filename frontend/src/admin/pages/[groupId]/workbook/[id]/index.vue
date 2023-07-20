<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import IconTrash from '~icons/fa/trash-o'
</script>

<template>
  <div class="flex flex-col">
    <div class="text-right text-lg font-semibold">SKKUDING</div>
    <div class="bg-gray h-[1px]" />
    <div class="mt-10">
      <h1 class="text-gray-dark mr-6 inline text-2xl font-semibold">
        1주차 과제
      </h1>
    </div>
    <div class="mt-8 flex items-center justify-between">
      <div>
        <h2 class="text-xl">Problem List</h2>
        <div>Total Problem: 10, Total Score: 100</div>
      </div>
      <div class="flex">
        <Button class="mr-8 h-8">+ Create</Button>
        <Button class="h-8">Import</Button>
      </div>
    </div>
    <PaginationTable
      :fields="[
        {
          key: 'id',
          label: '#',
          width: '10%'
        },
        {
          key: 'displayId',
          label: 'Display ID',
          width: '20%'
        },
        {
          key: 'title',
          label: 'Title',
          width: '20%'
        },
        {
          key: 'difficulty',
          label: 'Difficulty',
          width: '15%'
        },
        {
          key: 'lastUpdate',
          label: 'Last Update',
          width: '30%'
        },
        {
          key: 'score',
          label: 'Score',
          width: '15%'
        },
        {
          key: 'delete',
          label: 'Delete',
          width: '10%'
        }
      ]"
      :items="[
        {
          id: 1,
          displayId: 'A',
          title: '가파른 경사',
          difficulty: 'Level 1',
          lastUpdate: '2021-12-31 16:30:45',
          score: '20',
          delete: ''
        }
      ]"
      placeholder="keywords"
      :number-of-pages="3"
      no-search-bar
      no-pagination
    >
      <template #delete="{}">
        <Button class="flex h-[32px] w-[32px] items-center justify-center">
          <IconTrash />
        </Button>
      </template>
    </PaginationTable>
    <h2 class="mt-10 text-xl">Submission List</h2>
    <PaginationTable
      :fields="[
        {
          key: 'submissionTime',
          label: 'Submission Time',
          width: '30%'
        },
        {
          key: 'user',
          label: 'User',
          width: '20%'
        },
        {
          key: 'problem',
          label: 'Problem',
          width: '30%'
        },
        {
          key: 'language',
          label: 'Language',
          width: '20%'
        },
        {
          key: 'result',
          label: 'Result',
          width: '20%'
        }
      ]"
      :items="[
        {
          submissionTime: '2022-06-08 21:08:24',
          user: {
            name: 'goo314',
            id: '202031234'
          },
          problem: '사장님 올 때 메로나',
          language: 'Python3',
          result: 'Accepted'
        },
        {
          submissionTime: '2022-06-09 18:22:49',
          user: {
            name: 'st42597',
            id: '2020311119'
          },
          problem: '사장님 올 때 메로나',
          language: 'Python3',
          result: 'Wrong Answer'
        }
      ]"
      placeholder="keywords"
      :number-of-pages="3"
    >
      <template #user="{ row }">
        <div class="flex flex-col">
          <div>{{ row.user.name }}</div>
          <div>{{ row.user.id }}</div>
        </div>
      </template>
      <template #result="{ row }">
        <span :class="row.result === 'Accepted' ? 'text-green' : 'text-red'">
          {{ row.result }}
        </span>
      </template>
    </PaginationTable>
  </div>
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
