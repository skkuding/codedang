<script setup lang="ts">
import CodeEditor from '@/common/components/Organism/CodeEditor.vue'
import { useToast } from '@/common/composables/toast'
import { useClipboard, useDraggable } from '@vueuse/core'
import axios from 'axios'
import { onMounted, ref, toRefs } from 'vue'
import IconCopy from '~icons/fa6-regular/copy'
// import Clarification from '../../components/Clarification.vue'
import { useProblemStore, type Problem } from '../../store/problem'

const props = defineProps<{
  id: string
}>()

interface Sample {
  input: string
  output: string
}

const store = useProblemStore()
const { problem } = toRefs(store)

const { copy } = useClipboard()
const openToast = useToast()
const samples = ref<Sample[]>([])
const copySample = (index: number, type: 'input' | 'output') => {
  copy(samples.value[index][type])
  openToast({
    message: `${type === 'input' ? 'Input' : 'Output'} copied!`,
    type: 'success'
  })
}

const resizingBarX = ref<HTMLDivElement>()
const { x } = useDraggable(resizingBarX, {
  initialValue: { x: 600, y: 0 },
  onMove: (p) => {
    if (p.x < 400) p.x = 400
    if (window.innerWidth - 400 < p.x) p.x = window.innerWidth - 400
  }
})
// const codeBlockHeight = ref<number>(window.innerHeight - 112 - 236 - 24)
// const resizingBarY = ref<HTMLDivElement>()
// const { y } = useDraggable(resizingBarY, {
//   initialValue: { x: 0, y: 240 },
//   onMove: (p) => {
//     p.y = window.innerHeight - p.y - 24
//     codeBlockHeight.value = window.innerHeight - 112 - p.y - 24
//     if (p.y < 4) p.y = 4
//   }
// })

onMounted(async () => {
  const { data } = await axios.get<Problem>(`/api/problem/${props.id}`)
  if (!store.language || problem.value.title != data.title) {
    store.language = data.languages[0]
  }
  problem.value = data
  store.type = 'problem'
  samples.value = problem.value.inputExamples.map((input, index) => ({
    input,
    output: problem.value.outputExamples[index]
  }))
})
</script>

<template>
  <main class="flex h-[calc(100vh-112px)] border-t border-slate-400">
    <!-- <Clarification v-model="x" /> -->
    <div
      class="flex w-[600px] min-w-[400px] flex-col gap-8 overflow-y-auto bg-slate-700 p-8 text-white"
      :style="{ width: x + 'px' }"
    >
      <h1 class="text-xl font-bold">{{ problem.title }}</h1>
      <div v-dompurify-html="problem.description" class="prose prose-invert" />
      <h2 class="text-lg font-bold">Input</h2>
      <div
        v-dompurify-html="problem.inputDescription"
        class="prose prose-invert"
      />
      <h2 class="text-lg font-bold">Output</h2>
      <div
        v-dompurify-html="problem.outputDescription"
        class="prose prose-invert"
      />
      <div v-for="(sample, index) in samples" :key="index">
        <div class="flex items-end justify-between">
          <h2 class="text-lg font-bold">Sample Input {{ index + 1 }}</h2>
          <IconCopy
            class="cursor-pointer hover:text-white/75 active:text-white/50"
            @click="copySample(index, 'input')"
          />
        </div>
        <div class="bg-default w-full rounded-lg p-3 font-mono">
          {{ sample.input }}
        </div>
        <div class="flex items-end justify-between">
          <h2 class="text-lg font-bold">Sample Output {{ index + 1 }}</h2>
          <IconCopy
            class="cursor-pointer hover:text-white/75 active:text-white/50"
            @click="copySample(index, 'output')"
          />
        </div>
        <div class="bg-default w-full rounded-lg p-3 font-mono">
          {{ sample.output }}
        </div>
      </div>
      <h2 class="text-lg font-bold">
        Time Limit:
        <span class="font-normal">{{ problem.timeLimit }} ms</span>
      </h2>
      <h2 class="text-lg font-bold">
        Memory Limit:
        <span class="font-normal">{{ problem.memoryLimit }} MB</span>
      </h2>
    </div>
    <div
      ref="resizingBarX"
      class="hover:bg-blue w-px cursor-ew-resize bg-slate-400 hover:w-1"
    />
    <div
      class="flex min-w-[400px] grow flex-col justify-between overflow-hidden bg-[#292c33]"
    >
      <CodeEditor
        v-model="store.code"
        :lang="store.language"
        class="overflow-auto"
      />

      <!-- <div :style="{ height: y + 'px' }">
        <div
          ref="resizingBarY"
          class="hover:bg-blue mt-[3px] h-px cursor-ns-resize bg-slate-400 hover:mt-0 hover:h-1"
        />
        <div
          class="grid h-full grid-cols-2"
          :class="`grid-rows-[36px_minmax(0px,_1fr)]`"
        >
          <div
            class="flex items-center border-y border-r border-slate-400 px-4 text-white"
          >
            Input
          </div>
          <div
            class="flex items-center border-y border-slate-400 px-4 text-white"
          >
            Output
          </div>
          <div
            class="h-full overflow-auto border-r border-slate-400 p-4 text-white"
          >
            <pre>
              1
              2
              3
              4
              5
              6
              7
              8
            </pre>
          </div>
          <div class="h-full overflow-auto p-4 text-white">
            <pre>
              3
              2
              4
            </pre>
          </div>
        </div>
      </div>
      <div
        class="flex h-[24px] items-center justify-between bg-slate-900 px-4 py-1 text-white"
      >
        <div>{{ problem?.languages[0] }}</div>
        <div>-O2 -Wall -std=gnu++17</div>
      </div> -->
    </div>
  </main>
</template>
