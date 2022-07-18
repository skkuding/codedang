<script setup lang="ts">
import { computed } from 'vue'
import IconoirCancel from '~icons/iconoir/cancel'
import { ref } from 'vue'

const props = defineProps<{
  title: string
  titleColor: string
  img?: string
}>()

const ModalStyle = computed(() => {
  if (props.titleColor == 'green') {
    return 'w-[360px] h-[656px] text-center text-xl text-green'
  } else {
    return 'w-[360px] h-[656px] text-center text-xl text-gray'
  }
})
const iconStyle = computed(() => {
  if (props.titleColor == 'green') {
    return 'stroke-green'
  } else {
    return 'stroke-gray'
  }
})

let isModalVisible = ref(true)

function close() {
  isModalVisible.value = false
}
</script>

<template>
  <div
    v-show="isModalVisible"
    class="relative rounded-lg p-2"
    :class="ModalStyle"
  >
    <div v-show="img" class="my-2 flex justify-center">
      <img :src="img" class="text-align stroke-green aspect-square w-20" />
      <IconoirCancel
        class="absolute right-0 float-right cursor-pointer"
        :class="iconStyle"
        @click="close"
      />
    </div>
    <span :class="ModalStyle">{{ title }}</span>
    <IconoirCancel
      v-if="!img"
      class="float-right cursor-pointer"
      @click="close"
    />
  </div>
</template>
