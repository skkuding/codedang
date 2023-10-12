<script setup lang="ts">
import CreateNoticeModal from '@/admin/components/CreateNoticeModal.vue'
import ImportProblemModal from '@/admin/components/ImportProblemModal.vue'
import Button from '@/common/components/Atom/Button.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { ref } from 'vue'
import IconTrash from '~icons/fa/trash-o'

const showImportModal = ref(false)
const showNoticeModal = ref(false)
const showProblemModal = ref(false)
const editing = ref(false)

const problemList = ref([
  {
    id: '1',
    title: '가파른 경사',
    difficulty: 'Level1',
    lastUpdated: '2021-12-31 08:30:45'
  },
  {
    id: '2',
    title: '가파른 경사2',
    difficulty: 'Level1',
    lastUpdated: '2021-12-31 08:30:45'
  },
  {
    id: '3',
    title: '가파른 경사3',
    difficulty: 'Level1',
    lastUpdated: '2021-12-31 08:30:45'
  }
])
</script>

<template>
  <div class="flex flex-col">
    <ImportProblemModal
      :toggle="showImportModal"
      :set-toggle="() => (showImportModal = !showImportModal)"
    />
    <CreateNoticeModal
      :toggle="showNoticeModal"
      :set-toggle="
        (a) => {
          showNoticeModal = !a
        }
      "
    />
    <div class="border-gray border-b text-right text-lg font-semibold">
      SKKUDING
    </div>
    <div class="mt-10">
      <h1 class="text-gray-dark mr-6 inline text-2xl font-semibold">
        SKKU Coding platfom 모의대회
      </h1>
    </div>
    <div class="mt-8 flex justify-between">
      <h2 class="text-lg font-semibold">Problem List</h2>
      <div class="flex gap-3 text-sm">
        <Button
          @click="
            () => {
              showProblemModal = true
            }
          "
        >
          + Create
        </Button>
        <Button
          @click="
            () => {
              showImportModal = true
            }
          "
        >
          Import
        </Button>
        <Button
          v-if="!editing"
          color="gray-dark"
          @click="
            () => {
              editing = true
            }
          "
        >
          Edit Sort
        </Button>
        <Button
          v-else
          color="red"
          @click="
            () => {
              editing = false
              // TODO: api 요청
            }
          "
        >
          Submit
        </Button>
      </div>
    </div>
    <PaginationTable
      v-model:items="problemList"
      :editing="editing"
      :fields="[
        {
          key: 'title',
          label: 'Title',
          width: '35%'
        },
        {
          key: 'difficulty',
          label: 'Difficulty',
          width: '20%'
        },
        {
          key: 'lastUpdated',
          label: 'Last Updated',
          width: '30%'
        },
        {
          key: '_delete',
          label: 'Delete',
          width: '10%'
        }
      ]"
      placeholder="keywords"
      :number-of-pages="3"
      no-search-bar
    >
      <template #_delete="{}">
        <div class="flex items-center gap-2">
          <Button class="flex h-[32px] w-[32px] items-center justify-center">
            <IconTrash />
          </Button>
        </div>
      </template>
    </PaginationTable>
    <div class="mt-16 flex justify-between">
      <h2 class="text-lg font-semibold">Notice List</h2>
      <div class="flex gap-3 text-sm">
        <Button
          @click="
            () => {
              showNoticeModal = true
            }
          "
        >
          + Create
        </Button>
      </div>
    </div>
    <PaginationTable
      :fields="[
        {
          key: 'id',
          label: 'ID',
          width: '8%'
        },
        {
          key: 'problemId',
          label: 'Problem Id',
          width: '12%'
        },
        {
          key: 'title',
          label: 'Title',
          width: '40%'
        },
        {
          key: 'lastUpdated',
          label: 'Last Updated',
          width: '25%'
        },
        {
          key: '_delete',
          label: 'Delete',
          width: '10%'
        }
      ]"
      :items="[
        {
          id: '1',
          problemId: 'A',
          title: '하솔비 학생 지금 당장 연구실로 오세요',
          lastUpdated: '2021-12-31 08:30:45',
          option: '123'
        }
      ]"
      placeholder="keywords"
      :number-of-pages="3"
      no-search-bar
    >
      <template #_delete="{}">
        <div class="flex items-center gap-2">
          <Button class="flex h-[32px] w-[32px] items-center justify-center">
            <IconTrash />
          </Button>
        </div>
      </template>
    </PaginationTable>
    <div class="mt-16 flex justify-between">
      <h2 class="text-lg font-semibold">Submission List</h2>
    </div>
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
          width: '20%'
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
      :items="[
        {
          submissionTime: '2022.06.08 21:08:45',
          user: '2030319999 goo314',
          problem: '사장님 올 때 메로나',
          language: 'Python3',
          result: 'Runtime error'
        },
        {
          submissionTime: '2022.06.08 21:08:45',
          user: '2030319999 goo314',
          problem: '사장님 올 때 메로나',
          language: 'Python3',
          result: 'Accepted'
        },
        {
          submissionTime: '2022.06.08 21:08:45',
          user: '2030319999 goo314',
          problem: '사장님 올 때 메로나',
          language: 'Python3',
          result: 'Compile error'
        }
      ]"
      placeholder="keywords"
      :number-of-pages="3"
    >
      <template #result="{ row }">
        <p v-if="row.result === 'Accepted'" class="text-green">
          {{ row.result }}
        </p>
        <p v-else class="text-red">{{ row.result }}</p>
      </template>
    </PaginationTable>
  </div>
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
