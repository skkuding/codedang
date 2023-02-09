<script setup lang="ts">
import { ref } from 'vue'
import Header from '../components/Header.vue'
import Navigator from '../components/Navigator.vue'
import Clarification from '../components/Clarification.vue'
import IconCopy from '~icons/fa6-regular/copy'
import CodeEditor from '@/common/components/Organism/CodeEditor.vue'

defineProps<{
  id?: number
}>()

const code = ref('')
const language = ref<'cpp' | 'python' | 'javascript' | 'java'>('cpp')
</script>

<template>
  <Header />
  <Navigator v-model="language" />
  <div class="flex h-[calc(100vh-112px)] border-t border-slate-400">
    <Clarification />
    <div
      class="flex w-[600px] min-w-[400px] resize-x flex-col gap-4 overflow-scroll border-r border-slate-400 bg-slate-700 p-8 text-white"
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
      <div class="flex justify-between">
        <h2>Sample Input1</h2>
        <IconCopy class="cursor-pointer" />
      </div>
      <div class="bg-default w-full rounded p-3">1 2 3</div>
      <div class="flex justify-between">
        <h2>Sample Output1</h2>
        <IconCopy class="cursor-pointer" />
      </div>
      <div class="bg-default w-full rounded p-3">1 2 3</div>
    </div>
    <div
      class="flex grow flex-col justify-between overflow-scroll bg-[#292c33]"
    >
      <CodeEditor v-model="code" :lang="language" />
      <div class="grid grid-cols-2 grid-rows-[36px_200px]">
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
        <div class="overflow-scroll border-r border-slate-400 p-4 text-white">
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
        <div class="overflow-scroll p-4 text-white">
          <pre>
3
2
4
          </pre>
        </div>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: empty
</route>
