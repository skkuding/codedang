<script setup lang="ts">
import CodeEditor from '@/common/components/Organism/CodeEditor.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import axios from 'axios'
import { onMounted, ref, watch } from 'vue'
import { useProblemStore } from '../store/problem'

const props = defineProps<{
  item: {
    id: string
    createTime: string
    language: string
    result: string
    user: string
  }
  id: string
}>()
// const item = toRefs(props.item)
console.log('detail item', props.item)
console.log('detail id', props.id)
// type Submission = {
//   id: 13
//   submissionId: '692c41'
//   problemTestcaseId: 1
//   result: 'WrongAnswer'
//   cpuTime: '0'
//   memoryUsage: 0
//   createTime: '2023-09-11T15:32:08.947Z'
//   updateTime: '2023-09-11T15:32:08.947Z'
// }
const store = useProblemStore()
const code = ref(`#include <iostream>
using namespace std;

int main() {
    cout << "Hello, world!" << endl;
    return 0;
}`)

const fields = [
  {
    key: 'index',
    label: '#',
    width: '10%'
  },
  {
    key: 'result',
    label: 'Result',
    width: '30%'
  },
  {
    key: 'execTime',
    label: 'Exec Time',
    width: '30%'
  },
  {
    key: 'memory',
    label: 'Memory',
    width: '30%'
  }
]
// const item = ref<Submission>({
//   id: '',
//   createTime: '',
//   language: '',
//   result: '',
//   user: {
//     username: ''
//   }
// })
const submissionItem = ref<Record<string, string>>({
  id: '',
  createTime: '',
  language: '',
  result: '',
  user: ''
})
const getSubmission = async () => {
  // const { data } = await axios.get('/api/problem/1/submission/7c3326')
  await axios
    .get(`/api/problem/${store.problem.id}/submission/${props.item.id}`)
    .then(({ data }) => {
      submissionItem.value = data // { ...res.data, user: res.data.user.username }
    })
}
watch(props.item, () => getSubmission())
onMounted(async () => {
  await getSubmission()
})
// onBeforeUpdate(async () => {
//   await getSubmission()
// })
</script>

<template>
  <div class="bg-default flex flex-col gap-8 text-white">
    <h2 class="text-3xl font-bold">Submission #{{ submissionItem.id }}</h2>
    <table class="text-center">
      <thead class="font-bold">
        <tr>
          <th>Problem</th>
          <th>Submission Time</th>
          <th>User</th>
          <th>Language</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{{ store.problem.title }}</td>
          <td>{{ submissionItem.createTime }}</td>
          <td>{{ submissionItem.user }}</td>
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
      <div class="flex items-center gap-3">
        <h3 class="text-lg font-bold">Source Code</h3>
        <p class="text-gray">(612 Bytes)</p>
      </div>
      <CodeEditor :model-value="code" lang="Cpp" lock />
      <PaginationTable
        :fields="fields"
        :items="[
          {
            index: '1',
            result: 'Accepted',
            execTime: '36ms',
            memory: '29468KB'
          },
          {
            index: '2',
            result: 'Wrong Answer',
            execTime: '36ms',
            memory: '29468KB'
          }
        ]"
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
