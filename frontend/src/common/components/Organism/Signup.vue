<script setup lang="ts">
import { ref } from 'vue'
import Button from '../Atom/Button.vue'
import InputItem from '../Atom/InputItem.vue'
import IconPaperPlane from '~icons/fa6-solid/paper-plane'
import IconCheck from '~icons/fa6-solid/check'
// import { useAuthStore } from '@/common/store/auth'
import { useToast } from '@/common/composables/toast'

const openToast = useToast()
// const emit =
defineEmits<{
  (e: 'to', value: 'login' | 'signup' | 'password' | 'close'): void
}>()

const username = ref('')
const email = ref('')
const verificationCode = ref('')
const studentId = ref('')
const realName = ref('')
const password = ref('')
const passwordAgain = ref('')

// const auth = useAuthStore()
const regex =
  /((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*\d))|((?=.*[a-z])(?=.*[^a-zA-Z0-9\s]))|((?=.*[A-Z])(?=.*\d))|((?=.*[A-Z])(?=.*[^a-zA-Z0-9\s]))|((?=.*\d)(?=.*[^a-zA-Z0-9\s]))/

const signup = async () => {
  if (username.value.length < 3 || username.value.length > 10) {
    // bad username
    openToast({
      message: 'Username must be 4 ~ 9 characters',
      type: 'error'
    })
  }
  if (!regex.test(password.value)) {
    console.log('bad password')
    openToast({
      message:
        'Password must be a combination of at least 2 of lower case, upper case, number or exclamation marks',
      type: 'error'
    })
    // bad password
  } else if (password.value.length < 8) {
    console.log('short password')
    openToast({
      message: 'Password must be at least 8 characters',
      type: 'error'
    })
    // bad password
  } else {
    console.log('yes')
  }
  // await auth.signup(username.value, password.value)
  // emit('to', 'close')
}
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="text-green mb-8 w-60 text-center text-xl font-bold">
      Welcome to
      <br />
      SKKU Coding Platform
    </h1>
    <form class="flex w-60 flex-col gap-3" @submit.prevent="signup">
      <InputItem v-model="username" placeholder="Username" class="rounded-md" />
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
    <!-- TODO: captcha -->
    <div class="text-gray-dark mt-6 flex flex-col items-center text-sm">
      Already have an account?
      <a
        class="text-gray-dark hover:text-gray-dark/80 active:text-gray-dark/60 w-fit cursor-pointer text-sm underline"
        @click="$emit('to', 'login')"
      >
        Log In
      </a>
    </div>
  </div>
</template>
