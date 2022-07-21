<script setup lang="ts">
import { computed } from 'vue'
import IconoirCancel from '~icons/iconoir/cancel'
import { ref } from 'vue'

const props = defineProps<{
  title: string
  titleColor: string
}>()

const ModalStyle = computed(() => {
  if (props.titleColor == 'green') {
    return 'text-center text-xl text-green'
  } else {
    return 'text-center text-xl text-gray'
  }
})
const iconStyle = computed(() => {
  if (props.titleColor == 'green') {
    return 'stroke-green'
  } else {
    return 'stroke-gray'
  }
})

const isModalVisible = ref(true)

function close() {
  isModalVisible.value = false
}
</script>

<template>
  <div v-show="isModalVisible" class="relative rounded-lg p-2 text-center">
    <div class="my-2 flex justify-center">
      <slot name="modal-image"></slot>
      <IconoirCancel
        class="absolute right-0 float-right cursor-pointer"
        :class="iconStyle"
        @click="close"
      />
    </div>
    <span :class="ModalStyle">{{ title }}</span>

    <div>
      <slot name="modal-content"></slot>
    </div>
  </div>
</template>
