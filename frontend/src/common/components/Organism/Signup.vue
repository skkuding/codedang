<script setup lang="ts">
import { useToast } from '@/common/composables/toast'
import { useAuthStore } from '@/common/store/auth'
import axios from 'axios'
import { ref } from 'vue'
import IconCheck from '~icons/fa6-solid/check'
import IconPaperPlane from '~icons/fa6-solid/paper-plane'
import Button from '../Atom/Button.vue'
import InputItem from '../Atom/InputItem.vue'

const openToast = useToast()
const emit = defineEmits<{
  (e: 'to', value: 'login' | 'signup' | 'password' | 'close'): void
}>()

const username = ref('')
const email = ref('')
const verificationCode = ref('')
const realName = ref('')
const password = ref('')
const passwordAgain = ref('')
const verificationEmail = ref(false)
const emailAuth = ref('')
const warningUser = ref('')
const warningPass = ref('')
const warningPassRe = ref('')
const warningEmail = ref('')
const warningName = ref('')
const warningCode = ref('')

const auth = useAuthStore()
const regex =
  /((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*\d))|((?=.*[a-z])(?=.*[^a-zA-Z0-9\s]))|((?=.*[A-Z])(?=.*\d))|((?=.*[A-Z])(?=.*[^a-zA-Z0-9\s]))|((?=.*\d)(?=.*[^a-zA-Z0-9\s]))/
const realnameRegex = /^[a-zA-Z\\s]+$/
const signup = async () => {
  if (username.value.length < 3 || username.value.length > 10) {
    // openToast({
    //   message: 'Username must be 4 ~ 9 characters',
    //   type: 'error'
    // })
    warningUser.value = 'Username must be 4 ~ 9 characters'
  } else if (!regex.test(password.value)) {
    // openToast({
    //   message:
    //     'Password must be a combination of at least 2 of lower case, upper case, number or exclamation marks',
    //   type: 'error'
    // })
    warningPass.value =
      'Password must be a combination of at least 2 of lower case, upper case, number or exclamation marks'
  } else if (password.value.length < 8) {
    // openToast({
    //   message: 'Password must be at least 8 characters',
    //   type: 'error'
    // })
    warningPass.value = 'Password must be at least 8 characters'
  } else if (password.value !== passwordAgain.value) {
    // openToast({
    //   message: 'Password does not match!',
    //   type: 'error'
    // })
    warningPassRe.value = 'Password does not match!'
  } else if (!verificationEmail.value) {
    // openToast({
    //   message: 'Please verify email address',
    //   type: 'error'
    // })
    warningEmail.value = 'Please verify email address'
  } else if (!realnameRegex.test(realName.value)) {
    // openToast({
    //   message: 'Real name should be English!',
    //   type: 'error'
    // })
    warningName.value = 'Real name should be English!'
  } else {
    warningUser.value = ''
    warningPass.value = ''
    warningPassRe.value = ''
    warningEmail.value = ''
    warningName.value = ''
    await auth.signup(
      username.value,
      password.value,
      email.value,
      realName.value,
      emailAuth.value
    )
    emit('to', 'close')
  }
}
const verifyEmail = async () => {
  const emailVerify = email.value
  try {
    await axios.post('/api/email-auth/send-email/register-new', {
      email: emailVerify
    })
    // openToast({ message: 'Email verification code sent', type: 'success' })
    warningEmail.value = 'Email verification code sent'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    if (e.response.status === 422) {
      // openToast({ message: 'You have already signed up!', type: 'error' })
      warningEmail.value = 'You have already signed up!'
    }
    // openToast({ message: 'Check your email again!', type: 'error' })
    warningEmail.value = 'Check your email again!'
    throw new Error('Email verification code sending failed')
  }
}
const verifyCode = async () => {
  const emailVerify = email.value
  const pin = verificationCode.value
  try {
    const res = await axios.post('/api/email-auth/verify-pin', {
      pin,
      email: emailVerify
    })
    // openToast({ message: 'Email verification succeed!', type: 'success' })
    warningCode.value = 'Email verification succeed!'
    emailAuth.value = res.headers['email-auth']
    verificationEmail.value = true
  } catch (e) {
    // openToast({ message: 'Email verification failed!', type: 'error' })
    warningCode.value = 'Email verification failed!'
    throw new Error('Email verification failed')
  }
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
      <InputItem
        v-model="username"
        placeholder="Username"
        class="rounded-md"
        :required="true"
        is-valid="warningUser"
      />
      <div class="flex gap-2">
        <InputItem
          v-model="email"
          type="email"
          placeholder="Email Address"
          class="min-w-0 rounded-md"
          :required="true"
          is-valid="warningEmail"
        />
        <Button
          class="aspect-square h-[34px] rounded-md"
          @click.prevent="verifyEmail()"
        >
          <IconPaperPlane />
        </Button>
      </div>
      <div class="flex gap-2">
        <InputItem
          v-model="verificationCode"
          type="number"
          placeholder="Verification Code"
          class="min-w-0 rounded-md"
          :required="true"
          is-valid="warningCode"
        />
        <Button
          class="aspect-square h-[34px] rounded-md"
          @click.prevent="verifyCode()"
        >
          <IconCheck />
        </Button>
      </div>
      <InputItem
        v-model="realName"
        placeholder="Real Name"
        class="rounded-md"
        :required="true"
        is-valid="warningName"
      />
      <InputItem
        v-model="password"
        type="password"
        placeholder="Password"
        class="rounded-md"
        :required="true"
        is-valid="warningPass"
      />
      <InputItem
        v-model="passwordAgain"
        type="password"
        placeholder="Password Check"
        class="rounded-md"
        :required="true"
        is-valid="warningPassRe"
      />
      <Button type="submit" class="rounded-md" @click.prevent="signup()">
        Register
      </Button>
    </form>
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
