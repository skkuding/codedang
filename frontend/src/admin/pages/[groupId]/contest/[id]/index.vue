<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { ref, type Ref } from 'vue'
import IconPlus from '~icons/fa/plus'
import IconXmark from '~icons/fa/times-circle'
import IconTrash from '~icons/fa/trash-o'

interface Row {
  id: string
  title: string
  level: string
  group: string
  tag: string
  selected: boolean
}

const toggle = ref(false)
const problem: Ref<Row[]> = ref([
  {
    id: '1',
    title: '가파른 경사',
    level: 'Level1',
    group: 'Public',
    tag: 'Array',
    selected: false
  },
  {
    id: '2',
    title: 'TEST',
    level: 'Level2',
    group: 'Public',
    tag: 'Array',
    selected: false
  },
  {
    id: '3',
    title: '안녕',
    level: 'Level3',
    group: 'Public',
    tag: 'Array',
    selected: false
  }
])
const selectedTags: Ref<string[]> = ref([])

const tags = [
  ['Problem Group', 'Public', 'NPC 초급반', 'My Problem'],
  ['Language', 'C', 'C++', 'Pypy', 'Java'],
  ['Level', 'Level1', 'Level2', 'Level3', 'Level4', 'Level5']
]
</script>

<template>
  <div class="flex flex-col">
    <Modal
      :model-value="toggle"
      class="max-w-3xl"
      @update:model-value="
        () => {
          toggle = !toggle
        }
      "
    >
      <h2 class="text-gray-dark text-2xl font-bold">Import Problem</h2>
      <div class="my-10 flex flex-col gap-5">
        <div v-for="tag in tags" :key="tag[0]" class="flex items-center gap-5">
          <label class="font-bold">{{ tag[0] }}</label>
          <div class="flex gap-5 overflow-x-auto">
            <div
              v-for="t in tag.slice(1)"
              :key="t"
              :class="
                (selectedTags.findIndex((item) => item == t) == -1
                  ? 'bg-gray'
                  : 'bg-blue') +
                ' flex cursor-pointer items-center justify-center gap-3 whitespace-nowrap rounded-full px-5 py-1 text-white'
              "
              @click="
                () => {
                  const index = selectedTags.findIndex((item) => item == t)
                  if (index == -1) {
                    selectedTags = [...selectedTags, t]
                  } else {
                    selectedTags[index] = ''
                  }
                }
              "
            >
              {{ t }}
              <IconXmark
                v-if="selectedTags.findIndex((item) => item == t) != -1"
                class="w-3"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="border-gray my-5 flex gap-5 border-y py-5">
        <label class="flex shrink-0 items-center justify-center">
          Selection List
        </label>
        <div
          v-if="selectedTags.length"
          class="flex items-center gap-5 overflow-x-auto"
        >
          <div
            v-for="t in selectedTags.filter((item) => item)"
            :key="t"
            class="bg-blue flex cursor-pointer items-center justify-center gap-3 whitespace-nowrap rounded-full px-5 py-1 text-white"
            @click="
              () => {
                const index = selectedTags.findIndex((item) => item == t)
                if (index == -1) {
                  selectedTags = [...selectedTags, t]
                } else {
                  selectedTags[index] = ''
                }
              }
            "
          >
            {{ t }}
            <IconXmark class="w-3" />
          </div>
        </div>
      </div>
      <PaginationTable
        :fields="[
          {
            key: 'id',
            label: 'ID',
            width: '10%'
          },
          {
            key: 'title',
            label: 'Title',
            width: '25%'
          },
          {
            key: 'level',
            label: 'Level',
            width: '15%'
          },
          {
            key: 'group',
            label: 'Group',
            width: '15%'
          },
          {
            key: 'tag',
            label: 'Tag',
            width: '25%'
          },
          { key: 'add', label: '', width: '10%' }
        ]"
        :items="problem"
        placeholder="keywords"
        :number-of-pages="3"
      >
        <template #level="{ row }">
          <div class="flex items-center gap-2">
            <span
              :class="
                'bg-level-' +
                row.level[row.level.length - 1] +
                ' h-3 w-3 rounded-full'
              "
            />
            {{ row.level }}
          </div>
        </template>
        <template #add="{ row }: { row: Row }">
          <div class="flex items-center gap-2">
            <Button
              class="flex h-[32px] w-[32px] items-center justify-center"
              @click="
                () => {
                  const index = problem.findIndex((a) => a.id === row.id)
                  problem[index].selected = true
                }
              "
            >
              <IconPlus width="12px" />
            </Button>
          </div>
        </template>
      </PaginationTable>
      <h3>Selected Problem</h3>
      <PaginationTable
        :fields="[
          {
            key: 'id',
            label: 'ID',
            width: '10%'
          },
          {
            key: 'title',
            label: 'Title',
            width: '25%'
          },
          {
            key: 'level',
            label: 'Level',
            width: '15%'
          },
          {
            key: 'group',
            label: 'Group',
            width: '15%'
          },
          {
            key: 'tag',
            label: 'Tag',
            width: '25%'
          },
          {
            key: '_delete',
            label: '',
            width: '10%'
          }
        ]"
        :items="problem.filter((item) => item.selected)"
        placeholder="keywords"
        :number-of-pages="3"
        :no-search-bar="true"
      >
        <template #level="{ row }: { row: Row }">
          <div class="flex items-center gap-2">
            <span
              :class="
                'bg-level-' +
                row.level[row.level.length - 1] +
                ' h-3 w-3 rounded-full'
              "
            />
            {{ row.level }}
          </div>
        </template>
        <template #_delete="{ row }: { row: Row }">
          <div class="flex items-center gap-2">
            <Button
              class="bg-red hover:bg-red flex h-[32px] w-[32px] items-center justify-center"
              @click="
                () => {
                  const index = problem.findIndex((a) => a.id === row.id)
                  problem[index].selected = !problem[index].selected
                }
              "
            >
              <IconTrash></IconTrash>
            </Button>
          </div>
        </template>
      </PaginationTable>
    </Modal>
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
        <Button>+ Create</Button>
        <Button
          @click="
            () => {
              toggle = !toggle
            }
          "
        >
          Import
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
    <div class="mt-16 flex justify-between">
      <h2 class="text-lg font-semibold">Notice List</h2>
      <div class="flex gap-3 text-sm">
        <Button>+ Create</Button>
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
