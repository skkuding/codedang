<script setup lang="ts">
import CodeEditor from '@/common/components/Organism/CodeEditor.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { useToast } from '@/common/composables/toast'
import { useDateFormat } from '@vueuse/core'
import axios, { type AxiosError } from 'axios'
import { ref, watch } from 'vue'
import { useProblemStore } from '../store/problem'

const props = defineProps<{
  item: {
    id: string
    createTime: string
    language: string
    result: string
    user: string
  }
}>()
watch(props, () => getSubmission())
type TestcaseResult = {
  id: number
  submissionId: string
  problemTestcaseId: number
  result: string
  cpuTime: string
  memoryUsage: number
  createTime: string
  updateTime: string
}
type Submission = {
  problemId: number
  username: string
  code: string
  language: string
  createTime: string
  result: string
  testcaseResult: TestcaseResult[]
}
const store = useProblemStore()
const toast = useToast()
const testCaseFields = [
  {
    key: 'problemTestcaseId',
    label: '#',
    width: '10%'
  },
  {
    key: 'result',
    width: '30%'
  },
  {
    key: 'cpuTime',
    label: 'Exec Time (ms)',
    width: '30%'
  },
  {
    key: 'memoryUsage',
    label: 'Memory (Byte)',
    width: '30%'
  }
]
const submissionItem = ref<Submission>({
  problemId: 0,
  username: '',
  code: '',
  language: '',
  createTime: '',
  result: '',
  testcaseResult: [
    {
      id: 0,
      submissionId: '',
      problemTestcaseId: 0,
      result: '',
      cpuTime: '',
      memoryUsage: 0,
      createTime: '',
      updateTime: ''
    }
  ]
})
const getSubmission = async () => {
  try {
    await axios
      .get(`/api/problem/${store.problem.id}/submission/${props.item.id}`)
      .then(({ data }) => {
        submissionItem.value = data
        submissionItem.value.createTime = useDateFormat(
          submissionItem.value.createTime,
          'YYYY-MM-DD hh:mm:ss'
        ).value
        submissionItem.value.testcaseResult =
          submissionItem.value.testcaseResult.sort(
            (a, b) => a.problemTestcaseId - b.problemTestcaseId
          )
      })
  } catch (err) {
    const { response } = err as unknown as AxiosError
    if (response!.status === 403) {
      console.log(response)
      toast({ message: 'You must pass the problem first', type: 'error' })
    }
  }
}
watch(props.item, () => getSubmission())
</script>

<template>
  <div class="bg-default flex flex-col gap-8 p-5 text-white">
    <h2 class="text-3xl font-bold">
      Submission #{{ submissionItem.testcaseResult[0].submissionId }}
    </h2>
    <table class="text-center">
      <thead class="font-bold">
        <tr>
          <th>Problem Id</th>
          <th>Submission Time</th>
          <th>User</th>
          <th>Language</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ submissionItem.problemId }}</td>
          <td>{{ submissionItem.createTime }}</td>
          <td>{{ submissionItem.username }}</td>
          <td>{{ submissionItem.language }}</td>
          <td
            :class="
              submissionItem.result === 'Accepted' ? 'text-green' : 'text-red'
            "
          >
            {{ submissionItem.result }}
          </td>
        </tr>
      </tbody>
    </table>
    <div class="flex flex-col gap-3">
      <h3 class="flex items-center gap-3 text-lg font-bold">Source Code</h3>
      <CodeEditor :model-value="submissionItem.code" lang="Cpp" lock />
      <PaginationTable
        :fields="testCaseFields"
        :items="submissionItem.testcaseResult"
        mode="dark"
        :number-of-pages="3"
        no-search-bar
        no-pagination
        class="pointer-events-none"
      >
        <template #result="{ row }">
          <p :class="row.result === 'Accepted' ? 'text-green' : 'text-red'">
            {{ row.result }}
          </p>
        </template>
      </PaginationTable>
    </div>
  </div>
</template>
