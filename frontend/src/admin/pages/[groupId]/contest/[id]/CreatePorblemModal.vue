<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import InputItem from '@/common/components/Atom/InputItem.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import TextEditor from '@/common/components/Organism/TextEditor.vue'
import { ref } from 'vue'
import IconTrash from '~icons/fa/trash-o'

defineProps<{
  toggle: boolean
  setToggle: (a: boolean) => void
}>()
const data = ref({
  displayId: '',
  title: '',
  difficulty: 'Level1',
  language: 'C',
  timeLimit: '',
  memoryLimit: '',
  inputDesc: '',
  outputDesc: '',
  sample: [{ input: '', output: '' }],
  testcase: [{ input: '', output: '' }]
})
const levelItems = ['Level1', 'Level2', 'Level3', 'Level4', 'Level5']
const languageItems = ['C', 'C++', 'Python3', 'Java']
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
      <h2 class="text-gray-dark border-gray border-b pb-5 font-semibold">
        SKKU 프로그래밍 대회 - SKKUDING
      </h2>

      <div class="col-span-3">
        <label class="text-lg font-bold">Title</label>
        <InputItem
          v-model="data.title"
          class="mt-3 w-full"
          placeholder="Title"
        />
      </div>
      <div class="grid grid-cols-3 gap-5">
        <div class="flex flex-col gap-3">
          <label class="text-lg font-bold">Display ID</label>
          <InputItem
            v-model="data.displayId"
            placeholder="Display ID"
            class="w-full"
          />
        </div>
        <div class="flex flex-col gap-3">
          <label class="text-lg font-bold">Difficulty</label>
          <select
            id="difficulty"
            v-model="data.difficulty"
            name="difficulty"
            class="border-gray focus:border-green focus:ring-green w-full rounded border px-3 py-1 outline-none focus:ring-1"
          >
            <option v-for="item in levelItems" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>
        <div class="flex flex-col gap-3">
          <label class="text-lg font-bold">Language</label>
          <select
            id="language"
            v-model="data.language"
            name="language"
            class="border-gray focus:border-green focus:ring-green w-full rounded border px-3 py-1 outline-none focus:ring-1"
          >
            <option v-for="item in languageItems" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>
      </div>
      <div>
        <h2 class="text-lg font-bold">Description</h2>
        <TextEditor class="h-[360px] w-full" />
      </div>
      <div class="grid grid-cols-2 gap-5">
        <div>
          <label class="mb-3 text-lg font-bold">Input Description</label>
          <textarea
            v-model="data.inputDesc"
            class="border-gray focus:border-green focus:ring-green mt-3 h-[120px] w-full resize-none rounded-lg outline-none focus:ring-1"
          ></textarea>
        </div>
        <div>
          <label class="text-lg font-bold">Output Description</label>
          <textarea
            v-model="data.outputDesc"
            class="border-gray focus:border-green focus:ring-green mt-3 h-[120px] w-full resize-none rounded-lg outline-none focus:ring-1"
          ></textarea>
        </div>
      </div>
      <div class="grid grid-cols-2 gap-5">
        <div>
          <label class="mb-3 text-lg font-bold">Time Limit (ms)</label>
          <InputItem
            v-model="data.timeLimit"
            placeholder="Time Limit (ms)"
            class="mt-3 w-full"
          />
        </div>
        <div>
          <label class="mb-3 text-lg font-bold">Memory Limit (MB)</label>
          <InputItem
            v-model="data.memoryLimit"
            placeholder="Memory Limit (MB)"
            class="mt-3 w-full"
          />
        </div>
      </div>
      <div>
        <label class="text-lg font-bold">Hint</label>
        <TextEditor class="h-[360px] w-full" height="120px" />
      </div>
      <div
        v-for="(item, index) in data.sample"
        :key="index"
        class="flex flex-col gap-5"
      >
        <div class="flex justify-between">
          <h2 class="text-lg font-bold">Sample {{ index + 1 }}</h2>
          <Button
            class="flex h-[32px] items-center justify-center gap-2"
            @click="
              () => {
                data.sample = [
                  ...data.sample.slice(0, index),
                  ...data.sample.slice(index + 1)
                ]
                if (data.sample.length == 0)
                  data.sample = [{ input: '', output: '' }]
              }
            "
          >
            <IconTrash></IconTrash>
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
                v-model="item.input"
                class="border-gray focus:border-green focus:ring-green mt-3 h-[180px] w-full resize-none rounded-lg outline-none focus:ring-1"
              ></textarea>
            </div>
            <div>
              <label class="text-gray-dark text-lg font-bold">
                Output Sample
              </label>
              <textarea
                v-model="item.output"
                class="border-gray focus:border-green focus:ring-green mt-3 h-[180px] w-full resize-none rounded-lg outline-none focus:ring-1"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      <Button
        class="border-gray text-gray-dark flex h-[45px] items-center justify-center border"
        color="white"
        @click="
          () => {
            data.sample = [...data.sample, { input: '', output: '' }]
          }
        "
      >
        Add Sample
      </Button>
      <div
        v-for="(item, index) in data.testcase"
        :key="index"
        class="flex flex-col gap-5"
      >
        <div class="flex justify-between">
          <h2 class="text-lg font-bold">Testcase {{ index + 1 }}</h2>
          <Button
            class="flex h-[32px] items-center justify-center gap-2"
            @click="
              () => {
                data.testcase = [
                  ...data.testcase.slice(0, index),
                  ...data.testcase.slice(index + 1)
                ]
                if (data.testcase.length == 0)
                  data.testcase = [{ input: '', output: '' }]
              }
            "
          >
            <IconTrash></IconTrash>
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
                class="border-gray focus:border-green focus:ring-green mt-3 h-[180px] w-full resize-none rounded-lg outline-none focus:ring-1"
              ></textarea>
            </div>
            <div>
              <label class="text-gray-dark text-lg font-bold">
                Output Testcase
              </label>
              <textarea
                v-model="item.output"
                class="border-gray focus:border-green focus:ring-green mt-3 h-[180px] w-full resize-none rounded-lg outline-none focus:ring-1"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      <Button
        class="border-gray text-gray-dark flex h-[45px] items-center justify-center border"
        color="white"
        @click="
          () => {
            data.testcase = [...data.testcase, { input: '', output: '' }]
          }
        "
      >
        Add Testcase
      </Button>
    </div>
    <div class="border-gray mt-10 flex justify-end gap-3 border-t py-5">
      <Button class="font-normal capitalize" color="gray-dark">cancel</Button>
      <Button class="font-normal capitalize">save</Button>
    </div>
  </Modal>
</template>
