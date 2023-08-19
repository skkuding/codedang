<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import InputItem from '@/common/components/Atom/InputItem.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import TextEditor from '@/common/components/Organism/TextEditor.vue'
import type { Language, Level } from '@/user/problem/types'
import { ref } from 'vue'
import IconTrash from '~icons/fa/trash-o'

defineProps<{
  toggle: boolean
  setToggle: (a: boolean) => void
}>()

interface Snippet {
  id: number
  text: string
  locked: boolean
}

interface Template {
  language: Language
  code: Snippet[]
}

interface Testcase {
  input: string
  output: string
  scoreWeight?: number
}

interface Problem {
  title: string
  description: string
  inputDescription: string
  outputDescription: string
  hint: string
  template: Template[]
  languages: Language[]
  timeLimit: number
  memoryLimit: number
  difficulty: Level
  source: string
  inputExamples: string[]
  outputExamples: string[]
  testcases: Testcase[]
  tagIds: number[]
}

const data = ref<Problem>({
  title: '',
  description: '',
  inputDescription: '',
  outputDescription: '',
  hint: '',
  template: [],
  languages: [],
  timeLimit: 2000,
  memoryLimit: 512,
  difficulty: 'Level1',
  source: '',
  inputExamples: [''],
  outputExamples: [''],
  testcases: [{ input: '', output: '' }],
  tagIds: []
})

const levelLabels: Record<Level, string> = {
  Level1: 'Level 1',
  Level2: 'Level 2',
  Level3: 'Level 3',
  Level4: 'Level 4',
  Level5: 'Level 5'
}

const languageLabels: Record<Language, string> = {
  C: 'C',
  Cpp: 'C++',
  Python3: 'Python',
  Java: 'Java',
  Golang: 'Go'
}

const toggleLanguage = (language: Language) => {
  if (data.value.languages.includes(language)) {
    data.value.languages.splice(data.value.languages.indexOf(language), 1)
  } else {
    data.value.languages.push(language)
  }
}
</script>

<template>
  <Modal
    class="w-full max-w-[70%]"
    :model-value="toggle"
    @update:model-value="
      () => {
        setToggle(toggle)
      }
    "
  >
    <div class="flex flex-col gap-8">
      <h1 class="text-gray-dark text-2xl font-semibold">Create Problem</h1>
      <div class="col-span-3">
        <label class="text-lg font-bold">Title</label>
        <InputItem
          v-model="data.title"
          class="mt-3 w-full"
          placeholder="Title"
        />
      </div>
      <div class="flex justify-between gap-5">
        <div class="flex flex-1 flex-col gap-3">
          <label class="text-lg font-bold">Difficulty</label>
          <select
            id="difficulty"
            v-model="data.difficulty"
            name="difficulty"
            class="border-gray focus:border-green focus:ring-green w-full rounded border px-3 py-1 outline-none focus:ring-1"
          >
            <option
              v-for="(label, value) in levelLabels"
              :key="value"
              :value="value"
            >
              {{ label }}
            </option>
          </select>
        </div>
        <div class="flex flex-1 flex-col gap-3">
          <label class="text-lg font-bold">Language</label>
          <div class="flex gap-3">
            <button
              v-for="(label, value) in languageLabels"
              :key="value"
              class="rounded px-3 py-1 font-medium"
              :class="
                data.languages.includes(value)
                  ? 'bg-blue hover:bg-blue/90 text-white'
                  : 'bg-gray/25 hover:bg-gray/40 text-text/50'
              "
              @click="toggleLanguage(value)"
            >
              {{ label }}
            </button>
          </div>
        </div>
      </div>
      <div>
        <h2 class="mb-3 text-lg font-bold">Description</h2>
        <TextEditor v-model="data.description" size="lg" />
      </div>
      <div class="grid grid-cols-2 gap-5">
        <div>
          <label class="mb-3 text-lg font-bold">Input Description</label>
          <textarea
            v-model="data.inputDescription"
            class="border-gray focus:border-green focus:ring-green mt-3 h-[120px] w-full resize-none rounded-lg outline-none focus:ring-1"
          />
        </div>
        <div>
          <label class="text-lg font-bold">Output Description</label>
          <textarea
            v-model="data.outputDescription"
            class="border-gray focus:border-green focus:ring-green mt-3 h-[120px] w-full resize-none rounded-lg outline-none focus:ring-1"
          />
        </div>
      </div>
      <div class="grid grid-cols-2 gap-5">
        <div>
          <label class="mb-3 text-lg font-bold">Time Limit (ms)</label>
          <InputItem
            v-model="data.timeLimit"
            placeholder="Time Limit (ms)"
            class="mt-3 w-full"
            type="number"
          />
        </div>
        <div>
          <label class="mb-3 text-lg font-bold">Memory Limit (MB)</label>
          <InputItem
            v-model="data.memoryLimit"
            placeholder="Memory Limit (MB)"
            class="mt-3 w-full"
            type="number"
          />
        </div>
      </div>
      <div>
        <h2 class="mb-3 text-lg font-bold">Hint</h2>
        <TextEditor size="lg" />
      </div>
      <div
        v-for="(_, index) in data.inputExamples"
        :key="index"
        class="flex flex-col gap-5"
      >
        <div class="flex justify-between">
          <h2 class="text-lg font-bold">Sample {{ index + 1 }}</h2>
          <Button
            v-if="data.inputExamples.length > 1"
            class="flexitems-center justify-center gap-2"
            @click="
              () => {
                data.inputExamples.splice(index, 1)
                data.outputExamples.splice(index, 1)
              }
            "
          >
            <IconTrash />
            Delete
          </Button>
        </div>
        <div class="rounded-lg bg-slate-50 bg-opacity-50 p-5">
          <div class="grid grid-cols-2 gap-5">
            <div>
              <label class="text-gray-dark mb-3 text-lg font-bold">
                Input Sample
              </label>
              <textarea
                v-model="data.inputExamples[index]"
                class="border-gray focus:border-green focus:ring-green mt-3 h-[180px] w-full resize-none rounded-lg font-mono outline-none focus:ring-1"
              />
            </div>
            <div>
              <label class="text-gray-dark text-lg font-bold">
                Output Sample
              </label>
              <textarea
                v-model="data.outputExamples[index]"
                class="border-gray focus:border-green focus:ring-green mt-3 h-[180px] w-full resize-none rounded-lg font-mono outline-none focus:ring-1"
              />
            </div>
          </div>
        </div>
      </div>
      <Button
        class="border-gray text-gray-dark flex h-[45px] items-center justify-center border"
        color="white"
        @click="
          () => {
            data.inputExamples.push('')
            data.outputExamples.push('')
          }
        "
      >
        Add Sample
      </Button>
      <div
        v-for="(item, index) in data.testcases"
        :key="index"
        class="flex flex-col gap-5"
      >
        <div class="flex justify-between">
          <h2 class="text-lg font-bold">Testcase {{ index + 1 }}</h2>
          <Button
            v-if="data.testcases.length > 1"
            class="flex h-[32px] items-center justify-center gap-2"
            @click="data.testcases.splice(index, 1)"
          >
            <IconTrash />
            Delete
          </Button>
        </div>
        <div class="rounded-lg bg-slate-50 bg-opacity-50 p-5">
          <div class="grid grid-cols-2 gap-5">
            <div>
              <label class="text-gray-dark mb-3 text-lg font-bold">
                Input Testcase
              </label>
              <textarea
                v-model="item.input"
                class="border-gray focus:border-green focus:ring-green mt-3 h-[180px] w-full resize-none rounded-lg font-mono outline-none focus:ring-1"
              />
            </div>
            <div>
              <label class="text-gray-dark text-lg font-bold">
                Output Testcase
              </label>
              <textarea
                v-model="item.output"
                class="border-gray focus:border-green focus:ring-green mt-3 h-[180px] w-full resize-none rounded-lg font-mono outline-none focus:ring-1"
              />
            </div>
          </div>
        </div>
      </div>
      <Button
        class="border-gray text-gray-dark flex h-[45px] items-center justify-center border"
        color="white"
        @click="data.testcases.push({ input: '', output: '' })"
      >
        Add Testcase
      </Button>
    </div>
    <div class="mt-10 flex justify-end gap-3 py-5">
      <Button color="gray-dark">Cancel</Button>
      <Button>Save</Button>
    </div>
  </Modal>
</template>
