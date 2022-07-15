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

const modalStyle = computed(() => {
  return (
    'bg-' + props.bgColor + ' h-[' + props.height + '] w-[' + props.width + ']'
  )
})

let isModalVisible = ref(true)

function close() {
  isModalVisible.value = false
}
</script>

<template>
  <div class="rounded-lg p-2" :class="modalStyle" v-show="isModalVisible">
    <span>{{ title }}</span>
    <IconoirCancel class="float-right cursor-pointer" @click="close" />
  </div>
</template>
