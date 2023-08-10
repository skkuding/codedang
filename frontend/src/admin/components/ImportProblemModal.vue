<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { ref, type Ref } from 'vue'
import IconPlus from '~icons/fa/plus'
import IconTrash from '~icons/fa/trash-o'

interface Row {
  id: string
  title: string
  level: string
  group: string
  tag: string
  selected: boolean
}

const selectedTags: Ref<string[]> = ref([])
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

const tags = [
  ['Language', 'C', 'C++', 'Pypy', 'Java'],
  ['Level', 'Level1', 'Level2', 'Level3', 'Level4', 'Level5']
]

defineProps<{
  toggle: boolean
  setToggle: (a: boolean) => void
}>()
</script>

<template>
  <Modal
    :model-value="toggle"
    class="max-w-3xl"
    @update:model-value="setToggle"
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
      no-search-bar
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
            class="bg-red hover:bg-red active:bg-red flex h-[32px] w-[32px] items-center justify-center"
            @click="
              () => {
                const index = problem.findIndex((a) => a.id === row.id)
                problem[index].selected = false
              }
            "
          >
            <IconTrash />
          </Button>
        </div>
      </template>
    </PaginationTable>
  </Modal>
</template>
