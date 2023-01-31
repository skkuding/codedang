<script setup lang="ts">
import WorkbookTitle from '../components/WorkbookTitle.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import IconCheck from '~icons/fa6-regular/circle-check'
import { computed, ref, onMounted } from 'vue'
import { axios } from 'axios'

// TODO: define interface in separte file
interface Problem {
  id: number
  title: string
  tags: string
  result: string
}

defineProps<{
  id: number
}>()

const showTags = ref(false)
const fields = computed(() =>
  showTags.value
    ? [{ key: 'id', label: '#' }, { key: 'title' }, { key: 'tags' }]
    : [{ key: 'id', label: '#' }, { key: 'title' }]
)

const workbookProblemList = ref<Problem[]>([])

// TODO: use API to get workbook-problem list of initial page
onMounted(async () => {
  const response = await axios.get('/api/workbook/')
  workbookProblemList.value = response.data
})

// TODO: implement change-page function to reset workbookProblemList using API when click pagination buttons
</script>

<template>
  <div class="my-10">
    <WorkbookTitle text="CATS 대비 문제집 Level 1" color="red" class="mb-2" />
    <PaginationTable
      :fields="fields"
      :items="workbookProblemList"
      :number-of-pages="1"
      no-search-bar
      @row-clicked="({ id }) => $router.push('/problem/' + id)"
    >
      <template #option>
        <Switch v-model="showTags" label="Tags" />
      </template>

      <template #title="{ row }">
        <div class="flex items-center gap-2">
          {{ row.title }}
          <IconCheck v-if="row.result === 'accepted'" class="text-green" />
        </div>
      </template>
    </PaginationTable>
  </div>
</template>
