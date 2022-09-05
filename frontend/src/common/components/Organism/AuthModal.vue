<script setup lang="ts">
import { ref } from 'vue'
import Modal from '../Molecule/Modal.vue'
import InputItem from '../Atom/InputItem.vue'
import Button from '../Atom/Button.vue'

defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const username = ref('')
const password = ref('')
</script>

<template>
  <Modal
    class="flex flex-col items-center justify-center p-12"
    :model-value="modelValue"
    @update:model-value="(value) => $emit('update:modelValue', value)"
  >
    <!-- Login Page -->
    <img src="@/common/assets/logo.svg" width="100" />
    <h1 class="text-green my-6 w-40 text-center text-xl font-bold">
      SKKU
      <br />
      Coding Platform
    </h1>
    <form class="mb-8 flex w-60 flex-col gap-4" @submit.prevent>
      <InputItem v-model="username" placeholder="Username" class="rounded-md" />
      <InputItem
        v-model="password"
        placeholder="Password"
        class="rounded-md"
        type="password"
      />
      <Button type="submit" class="rounded-md">Sign In</Button>
    </form>
    <div class="absolute inset-x-0 bottom-0 flex w-full justify-between">
      <!-- TODO: non-outlined button style -->
      <Button class="bottom underline" color="white">Register now</Button>
      <Button class="bottom underline" color="white">Forgot password?</Button>
    </div>
  </Modal>
</template>
