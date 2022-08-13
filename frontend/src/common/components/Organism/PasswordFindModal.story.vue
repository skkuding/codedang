<script setup lang="ts">
import { ref } from 'vue'
import PasswordFindModal from './PasswordFindModal.vue'
const isPasswordFindModalVisible = ref(false)

function close() {
  isPasswordFindModalVisible.value = false
}
</script>

<template>
  <story>
    <button @click="isPasswordFindModalVisible = true">
      비밀번호 찾기 모달
    </button>
    <PasswordFindModal
      v-if="isPasswordFindModalVisible"
      class="text-green h-[401px] w-[360px]"
      @close="close"
    ></PasswordFindModal>
  </story>
</template>
