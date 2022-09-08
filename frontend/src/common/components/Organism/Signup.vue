<script setup lang="ts">
import { ref } from 'vue'
import Button from '../Atom/Button.vue'
import InputItem from '../Atom/InputItem.vue'

defineEmits<{
  (e: 'to', value: 'login' | 'signup' | 'password'): void
}>()

const username = ref('')
const email = ref('')
const studentId = ref('')
const realName = ref('')
const password = ref('')
const passwordAgain = ref('')
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="text-green mb-8 w-60 text-center text-xl font-bold">
      Welcome to
      <br />
      SKKU Coding Platform
    </h1>
    <form class="flex w-60 flex-col gap-3" @submit.prevent>
      <InputItem v-model="username" placeholder="Username" class="rounded-md" />
      <InputItem
        v-model="email"
        type="email"
        placeholder="Email Address"
        class="rounded-md"
      />
      <InputItem
        v-model="studentId"
        type="number"
        placeholder="Student ID"
        class="rounded-md"
      />
      <InputItem
        v-model="realName"
        placeholder="Real Name"
        class="rounded-md"
      />
      <InputItem
        v-model="password"
        type="password"
        placeholder="Password"
        class="rounded-md"
      />
      <InputItem
        v-model="passwordAgain"
        type="password"
        placeholder="Password Again"
        class="rounded-md"
      />
      <Button type="submit" class="rounded-md">Register</Button>
    </form>
    <!-- TODO: form validation -->
    <!-- TODO: email verification -->
    <!-- TODO: captcha -->
    <div class="text-gray-dark mt-6 flex flex-col items-center text-sm">
      Already have an account?
      <a
        class="text-gray-dark hover:text-gray-dark/80 active:text-gray-dark/60 w-fit cursor-pointer text-sm underline"
        @click="$emit('to', 'login')"
      >
        Sign In
      </a>
    </div>
  </div>
</template>
