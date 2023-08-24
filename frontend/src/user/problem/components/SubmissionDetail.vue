<script setup lang="ts">
import CodeEditor from '@/common/components/Organism/CodeEditor.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import axios from 'axios'
import { onUpdated, ref } from 'vue'
import { useProblemStore } from '../store/problem'

const props = defineProps<{
  id: string
}>()

type Submission = {
  id: string
  createTime: string
  language: string
  result: string
  user: {
    username: string
  }
}
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
const item = ref<Submission>({
  id: '',
  createTime: '',
  language: '',
  result: '',
  user: {
    username: ''
  }
})
const getSubmission = async () => {
  const { data: item } = await axios.get(
    '/api/problem/1/submission/' + props.id
  )
  console.log(item)
}
onUpdated(() => {
  getSubmission()
})
</script>

<template>
  <div class="bg-default flex flex-col gap-8">
    <h2 class="text-3xl font-bold">Submission #{{ item.id }}</h2>
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
          <td>{{ store.problem }}</td>
          <td>{{ item.createTime }}</td>
          <td>{{ item.user }}</td>
          <td>{{ item.language }}</td>
          <td :class="item.result === 'Accepted' ? 'text-green' : 'text-red'">
            {{ item.result }}
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
