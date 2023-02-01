<script setup lang="ts">
import { ref, watch } from 'vue'
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
    key: 'problem'
  },
  {
    key: 'submissionTime',
    label: 'Submission Time'
  },
  {
    key: 'user'
  },
  {
    key: 'language'
  },
  {
    key: 'result'
  }
]

type JudgeResult =
  | 'compile error'
  | 'wrong answer'
  | 'accepted'
  | 'time limit exceeded'
  | 'memory limit exceeded'
  | 'runtime error'
  | 'system error'
  | 'pending'
  | 'judging'
  | 'partial accepted'
  | 'submitting'

interface InfoItem {
  problem: string
  submissionTime: string
  user: string
  language: string
  result: JudgeResult
}
const infoItems: InfoItem[] = [
  {
    problem: 'A. 가파른 경사',
    submissionTime: '2021-01-05 10:30:21',
    user: 'root',
    language: 'C++',
    result: 'compile error'
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

interface DetailItem {
  number: number
  result: JudgeResult
  execTime: string
  memory: string
}

const detailItems: DetailItem[] = [
  {
    number: 1,
    result: 'accepted',
    execTime: '36ms',
    memory: '29468KB'
  },
  {
    number: 2,
    result: 'accepted',
    execTime: '36ms',
    memory: '29468KB'
  },
  {
    number: 3,
    result: 'wrong answer',
    execTime: '36ms',
    memory: '29468KB'
  },
  {
    number: 4,
    result: 'wrong answer',
    execTime: '36ms',
    memory: '29468KB'
  }
]

const judgeResultInfo = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'compile error': {
    short: 'CE',
    color: 'text-level-5'
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'wrong answer': {
    short: 'WA',
    color: 'text-red'
  },
  accepted: {
    short: 'AC',
    color: 'text-green'
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'time limit exceeded': {
    short: 'TLE',
    color: 'text-red'
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'memory limit exceeded': {
    short: 'MLE',
    color: 'text-red'
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'runtime error': {
    short: 'RE',
    color: 'text-red'
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'system error': {
    short: 'SE',
    color: 'text-red'
  },
  pending: {
    name: 'Pending',
    color: 'text-level-5'
  },
  judging: {
    name: 'Judging',
    color: 'text-blue'
  },
  // eslint-disable-next-line @typescript-eslint/naming-convention
  'partial accepted': {
    short: 'PAC',
    color: 'text-blue'
  },
  submitting: {
    short: 'ING',
    color: 'text-level-5'
  }
}
defineProps<{
  modelValue: string
  lang?: 'cpp' | 'python' | 'javascript' | 'java'
  submissionId: number
}>()
const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

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
        <span :class="judgeResultInfo[row.result as JudgeResult].color">
          {{ row.result }}
        </span>
      </template>
    </PaginationTable>
    <PageSubtitle
      text="Source Code (612 Bytes)"
      class="pt-10 pb-4"
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
    >
      <template #result="{ row }">
        <span :class="judgeResultInfo[row.result as JudgeResult].color">
          {{ row.result }}
        </span>
      </template>
    </PaginationTable>
  </div>
</template>

<route lang="yaml">
meta:
  layout: empty
</route>
