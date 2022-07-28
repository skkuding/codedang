<script setup lang="ts">
import Modal from './Modal.vue'
import Button from '../Atom/Button.vue'
import { ref } from 'vue'
const isModalVisible = ref(false)
function close() {
  isModalVisible.value = false
}
</script>

<template>
  <Story>
    <div>Click the button, and it shows modal!</div>
    <Button @click="isModalVisible = true">showmodal</Button>
    <Modal
      v-if="isModalVisible"
      title="Skku coding platform"
      title-color="green"
      class="h-80 w-72"
      @close="close"
    >
      <template #modal-image>
        <img src="@/common/assets/logo.svg" class="w-20" alt="" />
      </template>
      <template #modal-content>this is modal</template>
    </Modal>
  </Story>
</template>
