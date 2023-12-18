<script setup lang="ts">
import Logo from '@/common/assets/codedang.svg'
import { useAuthStore } from '@/common/store/auth'
import { ref } from 'vue'
import RegularEye from '~icons/fa6-regular/eye'
import EyeSlash from '~icons/fa6-regular/eye-slash'
import Button from '../Atom/Button.vue'
import InputItem from '../Atom/InputItem.vue'

const emit = defineEmits<{
  (e: 'to', value: 'login' | 'signup' | 'password' | 'close'): void
}>()

const username = ref('')
const password = ref('')

const passwordVisible = ref(false)

const auth = useAuthStore()
const login = async () => {
  await auth.login(username.value, password.value)
  emit('to', 'close')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <img :src="Logo" class="mb-10 mt-8 h-20" />
    <form class="mb-8 flex w-60 flex-col gap-4" @submit.prevent="login">
      <InputItem v-model="username" placeholder="Username" class="rounded-md" />
      <div class="flex items-center justify-between">
        <InputItem
          v-model="password"
          placeholder="Password"
          class="rounded-md"
          :type="passwordVisible ? 'text' : 'password'"
        />
        <component
          :is="passwordVisible ? RegularEye : EyeSlash"
          @click.stop="passwordVisible = !passwordVisible"
        />
      </div>
      <Button color="blue" type="submit" class="rounded-md">Log In</Button>
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
