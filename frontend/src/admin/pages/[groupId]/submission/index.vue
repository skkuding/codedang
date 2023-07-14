<script setup lang="ts">
import RadioButton from '@/common/components/Molecule/RadioButton.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { ref, type Ref } from 'vue'
import SubmissionDetailModal from './SubmissionDetailModal.vue'

const selectedFilter: Ref<string> = ref('Contest')
const showModal = ref(false)
const selectRow = ref()

const items: { [key: string]: Record<string, string>[] } = {
  Contest: [
    {
      id: '1',
      submissionTime: '2022.06.08 21:08:45',
      user: 'goo314',
      contest: '솔방울코딩대회',
      problem: '사장님 올때 메로나',
      language: 'Python3',
      result: 'Runtime error'
    },
    {
      id: '134',
      submissionTime: '2022.06.08 21:08:45',
      user: 'minseo999',
      contest: '솔방울코딩대회',
      problem: '가파른 경사',
      language: 'Java',
      result: 'Compile error'
    },
    {
      id: '123',
      submissionTime: '2022.06.08 21:08:45',
      user: 'cranemont',
      contest: 'SCAT 대회',
      problem: '연습문제',
      language: 'C',
      result: 'Wrong Answer'
    },
    {
      id: '234',
      submissionTime: '2022.06.08 21:08:45',
      user: 'jimin',
      contest: '솔방울코딩대회',
      problem: '사장님 올때 메로나',
      language: 'C++',
      result: 'Accepted'
    }
  ],
  Workbook: [
    {
      id: '12354',
      submissionTime: '2022.06.08 21:08:45',
      user: 'goo314',
      workbook: '솔방울코딩대회',
      problem: '사장님 올때',
      language: 'Java',
      result: 'Runtime error'
    },
    {
      id: '112234',
      submissionTime: '2022.06.08 21:08:45',
      user: 'minseo999',
      workbook: '솔방울대회',
      problem: '가파른',
      language: 'Python',
      result: 'Compile error'
    },
    {
      id: '124234',
      submissionTime: '2022.06.08 21:08:45',
      user: 'cranemont',
      workbook: 'SCAT 대회',
      problem: '연습',
      language: 'C',
      result: 'Wrong Answer'
    },
    {
      id: '12334',
      submissionTime: '2022.06.08 21:08:45',
      user: 'jimin',
      workbook: '솔방울코딩대회',
      problem: '사장님 올때 메로나',
      language: 'C++',
      result: 'Accepted'
    }
  ]
}
</script>

<template>
  <SubmissionDetailModal
    v-if="selectRow"
    :item="selectRow"
    :toggle="showModal"
    :set-toggle="
      () => {
        showModal = !showModal
      }
    "
  />
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
      @row-clicked="
        (row) => {
          selectRow = row
          showModal = true
        }
      "
    >
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
