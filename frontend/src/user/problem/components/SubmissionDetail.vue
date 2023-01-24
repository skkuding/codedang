<script setup lang="ts">
import { ref, watch, withDefaults } from 'vue'
import CodeEditor from '@/common/components/Organism/CodeEditor.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'

const code = ref(`#include <iostream>
using namespace std;

int main() {
    cout << "Hello, world!" << endl;
    return 0;
}
`)

const infoFields = [
  {
    key: 'problem',
    label: 'Problem'
  },
  {
    key: 'submissionTime',
    label: 'submission Time'
  },
  {
    key: 'user',
    label: 'User'
  },
  {
    key: 'language',
    label: 'Language'
  },
  {
    key: 'result',
    label: 'Result'
  }
]
const infoItems = [
  {
    problem: 'A. 가파른 경사',
    submissionTime: '2021-01-05 10:30:21',
    user: 'root',
    language: 'C++',
    result: '-1'
  }
]

const detailFields = [
  {
    key: 'number',
    label: '#'
  },
  {
    key: 'result',
    label: 'Result'
  },
  {
    key: 'execTime',
    label: 'Exec Time'
  },
  {
    key: 'memory',
    label: 'Memory'
  }
]

const detailItems = [
  {
    number: '1',
    result: 'Accepted',
    execTime: '36ms',
    momory: '29468KB'
  },
  {
    number: '2',
    result: 'Accepted',
    execTime: '36ms',
    momory: '29468KB'
  },
  {
    number: '3',
    result: 'Wrong Answer',
    execTime: '36ms',
    momory: '29468KB'
  },
  {
    number: '4',
    result: 'Wrong Answer',
    execTime: '36ms',
    momory: '29468KB'
  }
]

const judgeResult = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '-2': {
    name: 'Compile Error',
    short: 'CE',
    color: 'yellow',
    type: 'warning'
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '-1': {
    name: 'Wrong Answer',
    short: 'WA',
    color: 'red',
    type: 'error'
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '0': {
    name: 'Accepted',
    short: 'AC',
    color: 'green',
    type: 'success'
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '1': {
    name: 'Time Limit Exceeded',
    short: 'TLE',
    color: 'red',
    type: 'error'
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '2': {
    name: 'Time Limit Exceeded',
    short: 'TLE',
    color: 'red',
    type: 'error'
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '3': {
    name: 'Memory Limit Exceeded',
    short: 'MLE',
    color: 'red',
    type: 'error'
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '4': {
    name: 'Runtime Error',
    short: 'RE',
    color: 'red',
    type: 'error'
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '5': {
    name: 'System Error',
    short: 'SE',
    color: 'red',
    type: 'error'
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '6': {
    name: 'Pending',
    color: 'yellow',
    type: 'warning'
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '7': {
    name: 'Judging',
    color: 'blue',
    type: 'info'
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  8: {
    name: 'Partial Accepted',
    short: 'PAC',
    color: 'blue',
    type: 'info'
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  9: {
    name: 'Submitting',
    color: 'yellow',
    type: 'warning'
  }
}
defineProps<{
  modelValue: string
  lang?: 'cpp' | 'python' | 'javascript' | 'java'
  submissionId: number
}>()
const emit = defineEmits(['update:modelValue'])

watch(code, (value) => {
  emit('update:modelValue', value)
})
</script>

<template>
  <div class="bg-[#282c34] p-5">
    <PageTitle :text="'Submission #' + submissionId" color="white"></PageTitle>
    <PaginationTable
      :fields="infoFields"
      :items="infoItems"
      :number-of-pages="1"
      mode="dark"
      no-search-bar
      no-pagination
    >
      <template #result="{ row }">
        {{ judgeResult['-1'].color }}
        {{ row.result }}
      </template>
    </PaginationTable>
    <PageSubtitle
      text="Source Code (612 Bytes)"
      class="pt-5"
      color="white"
    ></PageSubtitle>
    <CodeEditor
      v-model="code"
      class="max-h-52 overflow-y-scroll"
      :lang="lang"
    ></CodeEditor>
    <PaginationTable
      :fields="detailFields"
      :items="detailItems"
      :number-of-pages="1"
      mode="dark"
      no-search-bar
      no-pagination
    ></PaginationTable>
  </div>
</template>

<route lang="yaml">
meta:
  layout: empty
</route>
