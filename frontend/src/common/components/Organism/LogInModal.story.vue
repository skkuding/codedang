<script setup lang="ts">
import { ref } from 'vue'
import LogInModal from './LogInModal.vue'
const isLogInModalVisible = ref(false)

function close() {
  isLogInModalVisible.value = false
}
</script>

<template>
  <story>
    <button @click="isLogInModalVisible = true">로그인 모달</button>
    <LogInModal
      v-if="isLogInModalVisible"
      class="text-green h-[537px] w-[360px]"
      @close="close"
    ></LogInModal>
  </story>
</template>
