<script setup lang="ts">
import { computed } from 'vue'
import IconoirCancel from '~icons/iconoir/cancel'
import { ref } from 'vue'

const props = defineProps<{
  title: string
  titleColor: string
  width: string
  height: string
  bgColor: string
}>()

const backgroundColor = computed(() => {
  return 'bg-' + props.bgColor
})
const getHeight = computed(() => {
  return 'h-[' + props.height + ']'
})
const getWidth = computed(() => {
  return 'w-[' + props.width + ']'
})

let isModalVisible = ref(true)

function close() {
  isModalVisible.value = false
}
</script>

<template>
  <div
    v-show="isModalVisible"
    :class="`bg-${props.bgColor} w-${props.width} h-${props.height} rounded-lg p-2`"
  >
    <span>{{ title }}</span>
    <IconoirCancel class="float-right cursor-pointer" @click="close" />
  </div>
</template>
