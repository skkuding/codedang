<script setup lang="ts">
import { useTimeAgo, useIntervalFn } from '@vueuse/core'
import { NProgress } from 'naive-ui'
import { computed, ref } from 'vue'

const props = defineProps<{
  title: string
  startTime: string
  endTime: string
  state: string
  href: string
}>()

const getPercentage = () => {
  const now = Date.now()
  const start = new Date(props.startTime).getTime()
  const end = new Date(props.endTime).getTime()
  if (now < start) {
    return 0
  } else if (now > end) {
    return 100
  } else {
    return ((now - start) / (end - start)) * 100
  }
}

const percentage = ref(getPercentage())

useIntervalFn(() => {
  percentage.value = getPercentage()
}, 1000)

const timeAgo = computed(
  () =>
    useTimeAgo(props.state === 'ongoing' ? props.endTime : props.startTime)
      .value
)
</script>

<template>
  <div
    class="flex flex-wrap justify-between gap-2 border-b border-slate-50 py-5 last:border-none last:pb-0"
  >
    <div class="flex items-center gap-2">
      <RouterLink :to="href">
        {{ title }}
      </RouterLink>
      <div
        :class="`${
          state === 'ongoing' ? 'bg-green' : 'bg-yellow'
        } h-3 w-3 shrink-0 rounded-full`"
      />
    </div>
    <p class="shrink-0 text-right text-sm text-slate-300">
      {{ `${state === 'ongoing' ? 'Ends in ' : 'Start in'} ${timeAgo}` }}
    </p>
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
</template>
