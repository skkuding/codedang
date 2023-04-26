<script setup lang="ts">
import { ref } from 'vue'
import { useClipboard, useDraggable } from '@vueuse/core'
import { useToast } from '@/common/composables/toast'
import { useProblemStore } from '../../store/problem'
import Clarification from '../../components/Clarification.vue'
import CodeEditor from '@/common/components/Organism/CodeEditor.vue'
import IconCopy from '~icons/fa6-regular/copy'

defineProps<{
  id: string
}>()

const code = ref('')
const sample = ref([{ input: '1 2 3', output: '1 2 3' }])

const store = useProblemStore()

const { copy } = useClipboard()
const openToast = useToast()
const copySample = (index: number, type: 'input' | 'output') => {
  copy(sample.value[index][type])
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
const codeBlockHeight = ref<number>(window.innerHeight - 112 - 236 - 24)
const resizingBarY = ref<HTMLDivElement>()
const { y } = useDraggable(resizingBarY, {
  initialValue: { x: 0, y: 240 },
  onMove: (p) => {
    p.y = window.innerHeight - p.y - 24
    codeBlockHeight.value = window.innerHeight - 112 - p.y - 24
    if (p.y < 4) p.y = 4
  }
})
</script>

<template>
  <main class="flex h-[calc(100vh-112px)] border-t border-slate-400">
    <Clarification v-model="x" />
    <div
      class="flex w-[600px] min-w-[400px] flex-col gap-4 overflow-y-auto bg-slate-700 p-8 text-white"
      :style="{ width: x + 'px' }"
    >
      <h1 class="text-xl font-bold">습격자 초라기</h1>
      <p>
        처음으로 인사캠을 방문한 율전이는 너무나 가파른 오르막길에 놀랐다. 이를
        본 율전이는 인사캠의 경사가 얼마나 심한지 알기 위해 네 지점의 높이를
        측정하기로 마음먹었다. 이때 율전이는 측정한 높이를 다음과 같이 네 가지
        경우로 나누려고 한다. (단, 측정한 순서는 유지한다)
      </p>
      <p>
        처음으로 인사캠을 방문한 율전이는 너무나 가파른 오르막길에 놀랐다. 이를
        본 율전이는 인사캠의 경사가 얼마나 심한지 알기 위해 네 지점의 높이를
        측정하기로 마음먹었다. 이때 율전이는 측정한 높이를 다음과 같이 네 가지
        경우로 나누려고 한다. (단, 측정한 순서는 유지한다)
      </p>
      <p>
        처음으로 인사캠을 방문한 율전이는 너무나 가파른 오르막길에 놀랐다. 이를
        본 율전이는 인사캠의 경사가 얼마나 심한지 알기 위해 네 지점의 높이를
        측정하기로 마음먹었다. 이때 율전이는 측정한 높이를 다음과 같이 네 가지
        경우로 나누려고 한다. (단, 측정한 순서는 유지한다)
      </p>
      <ol>
        <li>
          1. 4개의 증가(strictly increasing)하는 높이를 읽은 경우(“Uphill”) (예:
          3 4 7 9)
        </li>
        <li>
          2. 4개의 감소(strictly decreasing)하는 높이를 읽은 경우(“Downhill”)
          (예: 9 6 5 2)
        </li>
        <li>3. 4개의 일정한 높이를 읽은 경우(“Flat Land”) (예: 5 5 5 5)</li>
        <li>
          4. 위 경우 중 어느 것에도 속하지 않는 경우(“Unknown”) 율전이가 측정한
          높이가 주어졌을 때, 어떤 경우에 속하는지 출력하라.
        </li>
      </ol>
      <h2 class="mt-4 text-lg font-bold">Input</h2>
      <p>네 줄에 걸쳐 높이 h가 주어진다. (0 &lt; h &le; 1000)</p>
      <h2 class="mt-4 text-lg font-bold">Output</h2>
      <p>
        만약 네 개의 높이가 증가(strictly increasing)하면 “Uphill”,
        감소(strictly decreasing)하면 “Downhill”을 출력한다. 또한 높이가
        일정하다면 “Flat Land”를 출력하고, 어느 경우에도 속하지 않으면
        “Unknown”을 출력한다.
      </p>
      <div class="flex items-end justify-between">
        <h2 class="mt-4 text-lg font-bold">Sample Input 1</h2>
        <IconCopy
          class="cursor-pointer hover:text-white/75 active:text-white/50"
          @click="copySample(0, 'input')"
        />
      </div>
      <div class="bg-default w-full rounded-lg p-3 font-mono">
        {{ sample[0].input }}
      </div>
      <div class="flex items-end justify-between">
        <h2 class="mt-4 text-lg font-bold">Sample Output 1</h2>
        <IconCopy
          class="cursor-pointer hover:text-white/75 active:text-white/50"
          @click="copySample(0, 'output')"
        />
      </div>
      <div class="bg-default w-full rounded-lg p-3 font-mono">
        {{ sample[0].output }}
      </div>
    </div>
    <div
      ref="resizingBarX"
      class="hover:bg-blue w-px cursor-ew-resize bg-slate-400 hover:w-1"
    />
    <div
      class="flex min-w-[400px] grow flex-col justify-between overflow-hidden bg-[#292c33]"
    >
      <CodeEditor
        v-model="code"
        :lang="store.language"
        class="overflow-auto"
        :style="{ height: codeBlockHeight + 'px' }"
      />

      <div :style="{ height: y + 'px' }">
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
8</pre
            >
          </div>
          <div class="h-full overflow-auto p-4 text-white">
            <pre>
3
2
4</pre
            >
          </div>
        </div>
      </div>
      <div
        class="flex h-[24px] items-center justify-between bg-slate-900 px-4 py-1 text-white"
      >
        <div>C++</div>
        <div>-O2 -Wall -std=gnu++17</div>
      </div>
    </div>
  </main>
</template>
