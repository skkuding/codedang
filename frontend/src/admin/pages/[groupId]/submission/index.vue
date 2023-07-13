<script setup lang="ts">
import RadioButton from '@/common/components/Molecule/RadioButton.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { ref, type Ref } from 'vue'

const selectedFilter: Ref<string> = ref('Contest')

const items: { [key: string]: Record<string, string>[] } = {
  Contest: [
    {
      submissionTime: '2022.06.08 21:08:45',
      user: '2030319999 goo314',
      contest: '솔방울코딩대회',
      problem: '사장님 올때 메로나',
      language: 'Python3',
      result: 'Runtime error'
    },
    {
      submissionTime: '2022.06.08 21:08:45',
      user: '2024311234 minseo999',
      contest: '솔방울코딩대회',
      problem: '가파른 경사',
      language: 'Java',
      result: 'Compile error'
    },
    {
      submissionTime: '2022.06.08 21:08:45',
      user: '2030319999 cranemont',
      contest: 'SCAT 대회',
      problem: '연습문제',
      language: 'C',
      result: 'Wrong Answer'
    },
    {
      submissionTime: '2022.06.08 21:08:45',
      user: '2002310667 jimin',
      contest: '솔방울코딩대회',
      problem: '사장님 올때 메로나',
      language: 'C++',
      result: 'Accepted'
    }
  ],
  Workbook: [
    {
      submissionTime: '2022.06.08 21:08:45',
      user: '2030319999 goo314',
      workbook: '솔방울코딩대회',
      problem: '사장님 올때',
      language: 'Java',
      result: 'Runtime error'
    },
    {
      submissionTime: '2022.06.08 21:08:45',
      user: '2024311234 minseo999',
      workbook: '솔방울대회',
      problem: '가파른',
      language: 'Python',
      result: 'Compile error'
    },
    {
      submissionTime: '2022.06.08 21:08:45',
      user: '2030319999 cranemont',
      workbook: 'SCAT 대회',
      problem: '연습',
      language: 'C',
      result: 'Wrong Answer'
    },
    {
      submissionTime: '2022.06.08 21:08:45',
      user: '2002310667 jimin',
      workbook: '솔방울코딩대회',
      problem: '사장님 올때 메로나',
      language: 'C++',
      result: 'Accepted'
    }
  ]
}
</script>

<template>
  <div class="flex flex-col">
    <div class="border-gray border-b text-right text-lg font-semibold">
      SKKUDING
    </div>
    <div class="mt-10 flex flex-col gap-5">
      <h1 class="text-gray-dark mr-6 inline text-2xl font-semibold">
        Submission
      </h1>
      <RadioButton v-model="selectedFilter" :texts="['Contest', 'Workbook']" />
    </div>

    <PaginationTable
      :fields="[
        {
          key: 'submissionTime',
          label: 'Submission Time',
          width: '20%'
        },
        {
          key: 'user',
          label: 'User',
          width: '15%'
        },
        {
          key: selectedFilter.toLowerCase(),
          label: selectedFilter,
          width: '20%'
        },
        {
          key: 'problem',
          label: 'Problem',
          width: '15%'
        },
        {
          key: 'language',
          label: 'Language',
          width: '15%'
        },
        {
          key: 'result',
          label: 'Result',
          width: '15%'
        }
      ]"
      :items="items[selectedFilter]"
      placeholder="keywords"
      :number-of-pages="3"
    >
      <template #user="{ row }">
        <p v-for="item in row.user.split(' ')" :key="item">{{ item }}</p>
      </template>
      <template #result="{ row }">
        <span
          :class="
            (row.result === 'Accepted' ? 'text-green' : 'text-red') +
            ' font-bold'
          "
        >
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
