<script setup lang="ts">
// import { useToast } from '@/common/composables/toast'
import { useAuthStore } from '@/common/store/auth'
import axios from 'axios'
import { ref, watch } from 'vue'
import IconCheck from '~icons/fa6-solid/check'
import IconPaperPlane from '~icons/fa6-solid/paper-plane'
import Button from '../Atom/Button.vue'
import InputItem from '../Atom/InputItem.vue'

// const openToast = useToast()
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

watch(username, () => {
  if (username.value !== '') {
    warningUser.value = ''
  }
})
watch(email, () => {
  if (email.value !== '') {
    warningEmail.value = ''
  }
})
watch(realName, () => {
  if (realName.value !== '') {
    warningName.value = ''
  }
})
watch(password, () => {
  if (password.value !== '') {
    warningPass.value = ''
  }
})
watch([password, passwordAgain], () => {
  if (passwordAgain.value !== '') {
    warningPassRe.value = ''
  }
})
watch(verificationCode, () => {
  if (verificationCode.value !== '') {
    warningCode.value = ''
  }
})
const signup = async () => {
  if (validate(username.value, 'username')) {
    if (validate(email.value, 'email')) {
      if (validate(verificationCode.value, 'code')) {
        if (validate(realName.value, 'real')) {
          if (validate(password.value, 'pass')) {
            if (validate(passwordAgain.value, 'passRe')) {
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
        }
      }
    }
  }
}
const verifyEmail = async () => {
  const emailVerify = email.value
  if (validate(emailVerify, 'email')) {
    try {
      await axios.post('/api/email-auth/send-email/register-new', {
        email: emailVerify
      })
      console.log('do you await')
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
}
const verifyCode = async () => {
  const emailVerify = email.value
  const pin = verificationCode.value
  if (
    validate(verificationCode.value, 'code') &&
    validate(emailVerify, 'email')
  ) {
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
}

const validate = (key: string, type: string) => {
  if (type === 'username') {
    if (key === '') {
      warningUser.value = 'Please type in the username'
      return false
    } else if (username.value.length < 3 || username.value.length > 10) {
      warningUser.value = 'Username must be 4 ~ 9 characters'
      return false
    } else {
      warningUser.value = ''
      return true
    }
  } else if (type === 'pass') {
    if (key === '') {
      warningPass.value = 'Please type in the password'
      return false
    } else if (key.length < 8) {
      warningPass.value = 'Password must be at least 8 characters'
      return false
    } else if (!regex.test(key)) {
      warningPass.value =
        'At least 2 of lower case, upper case, number or exclamation marks required'
      return false
    } else {
      warningPass.value = ''
      return true
    }
  } else if (type === 'email') {
    if (key === '') {
      warningEmail.value = 'Please type in your email address'
      return false
    } else {
      warningEmail.value = ''
      return true
    }
  } else if (type === 'real') {
    if (key === '') {
      warningName.value = 'Please type in your real name.'
      return false
    } else if (!realnameRegex.test(key)) {
      warningName.value = 'Real name should be English!'
      return false
    } else {
      warningName.value = ''
      return true
    }
  } else if (type === 'passRe') {
    if (key === '') {
      warningPassRe.value = 'Please type in your password again.'
      return false
    } else if (key !== password.value) {
      warningPassRe.value = 'Password does not match!'
      return false
    } else {
      warningPassRe.value = ''
      return true
    }
  } else if (type === 'code') {
    if (key === '') {
      warningCode.value = 'Please verify email address.'
      return false
    } else {
      warningCode.value = ''
      return true
    }
  } else {
    return true
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <h1 class="text-green my-8 w-60 text-center text-xl font-bold">
      Welcome to
      <br />
      SKKU Coding Platform
    </h1>
    <form class="mb-2 flex w-60 flex-col" @submit.prevent="signup">
      <InputItem
        v-model="username"
        placeholder="Username"
        class="mb-1 rounded-md"
      />
      <p class="text-red mb-4 text-xs font-bold">
        {{ warningUser }}
      </p>
      <div class="flex gap-2">
        <InputItem
          v-model="email"
          type="email"
          placeholder="Email Address"
          class="mb-1 min-w-0 rounded-md"
        />
        <Button
          class="aspect-square h-[34px] rounded-md"
          @click.prevent="verifyEmail()"
        >
          <IconPaperPlane />
        </Button>
      </div>
      <p
        v-show="warningEmail === 'Email verification code sent'"
        class="text-green mb-4 text-xs font-bold"
      >
        Email verification code has been sent!
      </p>
      <p
        v-show="warningEmail !== 'Email verification code sent'"
        class="text-red mb-4 text-xs font-bold"
      >
        {{ warningEmail }}
      </p>
      <div class="flex gap-2">
        <InputItem
          v-model="verificationCode"
          type="number"
          placeholder="Verification Code"
          class="mb-1 min-w-0 rounded-md"
        />
        <Button
          class="aspect-square h-[34px] rounded-md"
          @click.prevent="verifyCode()"
        >
          <IconCheck />
        </Button>
      </div>
      <div>
        <p
          v-show="warningCode === 'Email verification succeed!'"
          class="text-green mb-4 text-xs font-bold"
        >
          Email has been verified!
        </p>
        <p
          v-show="warningCode !== 'Email verification succeed!'"
          class="text-red mb-4 text-xs font-bold"
        >
          {{ warningCode }}
        </p>
      </div>
      <InputItem
        v-model="realName"
        placeholder="Real Name"
        class="mb-1 rounded-md"
      />
      <p class="text-red mb-4 text-xs font-bold">
        {{ warningName }}
      </p>
      <InputItem
        v-model="password"
        type="password"
        placeholder="Password"
        class="mb-1 rounded-md"
      />
      <p class="text-red mb-4 text-xs font-bold">
        {{ warningPass }}
      </p>
      <InputItem
        v-model="passwordAgain"
        type="password"
        placeholder="Password Check"
        class="mb-1 rounded-md"
      />
      <p class="text-red mb-4 text-xs font-bold">
        {{ warningPassRe }}
      </p>
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
