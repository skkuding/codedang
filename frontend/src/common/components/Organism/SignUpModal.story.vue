<script setup lang="ts">
import { ref } from 'vue'
import SignUpModal from './SignUpModal.vue'
const isSignUpModalVisible = ref(false)

function close() {
  isSignUpModalVisible.value = false
}
</script>

<template>
  <story>
    <button @click="isSignUpModalVisible = true">회원가입 모달</button>
    <SignUpModal
      v-if="isSignUpModalVisible"
      class="text-green h-[687px] w-[360px]"
      @close="close"
    ></SignUpModal>
  </story>
</template>
