<script setup lang="ts">
import CreatePorblemModal from '@/admin/components/CreatePorblemModal.vue'
import ImportProblemModal from '@/admin/components/ImportProblemModal.vue'
import Button from '@/common/components/Atom/Button.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { ref } from 'vue'
import IconTrash from '~icons/fa/trash-o'

const showProblemModal = ref(false)
const showImportModal = ref(false)
</script>

<template>
  <ImportProblemModal
    :toggle="showImportModal"
    :set-toggle="() => (showImportModal = !showImportModal)"
  />
  <CreatePorblemModal
    :toggle="showProblemModal"
    :set-toggle="
      (a) => {
        showProblemModal = !a
      }
    "
  />
  <div class="flex flex-col">
    <div class="border-gray border-b text-right text-lg font-semibold">
      SKKUDING
    </div>
    <div class="mt-10 flex justify-between gap-5">
      <h1 class="text-gray-dark mr-6 inline text-2xl font-semibold">Problem</h1>
      <div class="flex gap-5">
        <Button @click="() => (showProblemModal = true)">+ Create</Button>
        <Button @click="() => (showImportModal = true)">Import</Button>
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
          key: 'displayId',
          label: 'Display Id',
          width: '12%'
        },
        {
          key: 'title',
          label: 'Title',
          width: '30%'
        },
        {
          key: 'difficulty',
          label: 'Difficulty',
          width: '15%'
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
          displayId: 'A',
          title: '가파른 경사',
          difficulty: 'Level1',
          lastUpdated: '2021-12-31 08:30:45',
          option: '123'
        }
      ]"
      placeholder="keywords"
      :number-of-pages="3"
      :no-search-bar="true"
    >
      <template #_delete="{}">
        <div class="flex items-center gap-2">
          <Button class="flex h-[32px] w-[32px] items-center justify-center">
            <IconTrash></IconTrash>
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
