<script setup lang="ts">
import Modal from './Modal.vue'
import Button from '../Atom/Button.vue'
import { ref } from 'vue'

const show = ref(false)
</script>

<template>
  <Story>
    <main class="h-screen w-screen">
      <div>Click the button, and it shows modal!</div>
      <Button @click="show = true">Show</Button>
      <Modal v-model="show" class="flex items-center justify-center font-bold">
        Modal opened!
      </Modal>
    </main>
  </Story>
</template>
