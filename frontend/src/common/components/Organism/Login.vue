<script setup lang="ts">
import { ref } from 'vue'
import Button from '../Atom/Button.vue'
import InputItem from '../Atom/InputItem.vue'

defineEmits<{
  (e: 'to', value: 'login' | 'signup' | 'password'): void
}>()

const username = ref('')
const password = ref('')
</script>

<template>
  <div class="flex flex-col items-center justify-center">
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
      <Button
        class="bottom underline"
        color="white"
        @click="$emit('to', 'signup')"
      >
        Register now
      </Button>
      <Button
        class="bottom underline"
        color="white"
        @click="$emit('to', 'password')"
      >
        Forgot password?
      </Button>
    </div>
  </div>
</template>
