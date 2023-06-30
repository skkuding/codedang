<script setup lang="ts">
import { ref } from 'vue'
import Button from '../Atom/Button.vue'
import Modal from './Modal.vue'

const show = ref(false)
</script>

<template>
  <Story>
    <main class="h-screen w-screen">
      <div>Click the button, and it shows modal!</div>
      <Button @click="show = true">Show</Button>
      <Modal
        v-model="show"
        class="flex items-center justify-center p-12 text-xl font-bold"
      >
        Modal opened!
      </Modal>
    </main>
  </Story>
</template>
