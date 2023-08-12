<script setup lang="ts">
import Modal from '@/common/components/Molecule/Modal.vue'
import CodeEditor from '@/common/components/Organism/CodeEditor.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import { ref } from 'vue'

defineProps<{
  item: Record<string, string>
  toggle: boolean
  setToggle: (a: boolean) => void
}>()
const code = ref(`#include <iostream>
using namespace std;

int main() {
    cout << "Hello, world!" << endl;
    return 0;
}`)
</script>

<template>
  <Modal
    class="bg-default w-full max-w-[70%]"
    :model-value="toggle"
    dark
    @update:model-value="
      () => {
        setToggle(toggle)
      }
    "
  >
    <div class="flex flex-col gap-8">
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
            <td>{{ item.problem }}</td>
            <td>{{ item.submissionTime }}</td>
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
          :fields="[
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
          ]"
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
  </Modal>
</template>
