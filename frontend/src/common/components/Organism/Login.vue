<script setup lang="ts">
import { ref } from 'vue'
import SymbolLogo from '../Atom/SymbolLogo.vue'
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
    <SymbolLogo class="fill-green h-28" />
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
      <Button type="submit" class="rounded-md">Log In</Button>
    </form>
    <div class="absolute inset-x-0 bottom-0 flex w-full justify-between p-3">
      <a
        class="text-gray-dark hover:text-gray-dark/80 active:text-gray-dark/60 cursor-pointer text-sm underline"
        @click="$emit('to', 'signup')"
      >
        Register now
      </a>
      <a
        class="text-gray-dark hover:text-gray-dark/80 active:text-gray-dark/60 cursor-pointer text-sm underline"
        @click="$emit('to', 'password')"
      >
        Forgot password?
      </a>
    </div>
  </div>
</template>
