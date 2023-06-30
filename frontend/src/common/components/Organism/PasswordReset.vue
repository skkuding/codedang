<script setup lang="ts">
import { ref } from 'vue'
import IconCheck from '~icons/fa6-solid/check'
import IconPaperPlane from '~icons/fa6-solid/paper-plane'
import Button from '../Atom/Button.vue'
import InputItem from '../Atom/InputItem.vue'

defineEmits<{
  (e: 'to', value: 'login' | 'signup' | 'password'): void
}>()

const email = ref('')
const verificationCode = ref('')
const password = ref('')
const passwordAgain = ref('')
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="text-green mb-6 text-xl font-bold">Password Recovery</h1>
    <form class="flex w-60 flex-col gap-3" @submit.prevent>
      <div class="flex gap-2">
        <InputItem
          v-model="email"
          type="email"
          placeholder="Email Address"
          class="min-w-0 rounded-md"
        />
        <Button class="aspect-square h-[34px] rounded-md">
          <IconPaperPlane />
        </Button>
      </div>
      <div class="flex gap-2">
        <InputItem
          v-model="verificationCode"
          type="number"
          placeholder="Verification Code"
          class="min-w-0 rounded-md"
        />
        <Button class="aspect-square h-[34px] rounded-md">
          <IconCheck />
        </Button>
      </div>
      <InputItem
        v-model="password"
        type="password"
        placeholder="New Password"
        class="rounded-md"
      />
      <InputItem
        v-model="passwordAgain"
        type="password"
        placeholder="New Password Again"
        class="rounded-md"
      />
      <Button type="submit" class="rounded-md">Reset Password</Button>
    </form>
    <a
      class="text-gray-dark hover:text-gray-dark/80 active:text-gray-dark/60 mt-4 cursor-pointer text-sm underline"
      @click="$emit('to', 'login')"
    >
      Back to Log In
    </a>
  </div>
</template>
