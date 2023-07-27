<script setup lang="ts">
import { useTimeAgo, useIntervalFn } from '@vueuse/core'
import { NProgress } from 'naive-ui'
import { ref } from 'vue'

const props = defineProps<{
  title: string
  startTime: string
  endTime: string
  state: string
}>()

const percentage = ref(0)

useIntervalFn(() => {
  const now = Date.now()
  const start = new Date(props.startTime).getTime()
  const end = new Date(props.endTime).getTime()
  if (now < start) {
    percentage.value = 0
  } else if (now > end) {
    percentage.value = 100
  } else {
    percentage.value = ((now - start) / (end - start)) * 100
  }
}, 1000)

const timeAgo = useTimeAgo(
  props.state === 'ongoing' ? props.endTime : props.startTime
)
</script>

<template>
  <div
    class="flex flex-wrap justify-between gap-2 border-b border-slate-50 py-5 last:border-none last:pb-0"
  >
    <div class="flex items-center gap-2">
      <p>
        {{ title }}
      </p>
      <div
        :class="`${
          state === 'ongoing' ? 'bg-green' : 'bg-yellow'
        } h-3 w-3 shrink-0 rounded-full`"
      />
    </div>
    <p class="shrink-0 text-right text-sm text-slate-300">
      {{ `${state === 'ongoing' ? 'Ends in ' : 'Start in'} ${timeAgo}` }}
    </p>
    <div class="flex w-full gap-5">
      <NProgress
        v-if="state === 'ongoing'"
        :percentage="percentage"
        color="#8DC63F"
        type="line"
        :height="10"
        :show-indicator="false"
        class="mt-2"
      />
    </div>
  </div>
</template>
