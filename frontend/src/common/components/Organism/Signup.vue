<script setup lang="ts">
import Logo from '@/common/assets/codedang.svg'
import { useToast } from '@/common/composables/toast'
import { toTypedSchema } from '@vee-validate/zod'
import axios from 'axios'
import { AxiosError } from 'axios'
import { useForm } from 'vee-validate'
import { ref } from 'vue'
import { z } from 'zod'
import RegularEye from '~icons/fa6-regular/eye'
import EyeSlash from '~icons/fa6-regular/eye-slash'
import IconCheck from '~icons/fa6-solid/check'
import IconPaperPlane from '~icons/fa6-solid/paper-plane'
import Button from '../Atom/Button.vue'
import InputItem from '../Atom/InputItem.vue'

const emit = defineEmits<{
  (e: 'to', value: 'login' | 'signup' | 'password' | 'close'): void
}>()

const schema = z
  .object({
    username: z.string().min(3).max(10),
    email: z.string().email(),
    verificationCode: z.string().min(6).max(6),
    realName: z.string().min(1).max(20),
    password: z.string().min(8).max(32),
    passwordAgain: z.string().min(8).max(32)
  })
  .refine((data) => data.password === data.passwordAgain, {
    message: 'Passwords do not match',
    path: ['passwordAgain']
  })
  .refine((data) => /^[a-zA-Z0-9]+$/.test(data.username), {
    message: 'Username can only contain alphabets and numbers',
    path: ['username']
  })
  .refine((data) => /^[a-zA-Z\s]+$/.test(data.realName), {
    message: 'Real name can only contain alphabets',
    path: ['realName']
  })

const { defineComponentBinds, errors, validateField, handleSubmit } = useForm({
  validationSchema: toTypedSchema(schema)
})

const username = defineComponentBinds('username')
const email = defineComponentBinds('email')
const verificationCode = defineComponentBinds('verificationCode')
const realName = defineComponentBinds('realName')
const password = defineComponentBinds('password')
const passwordAgain = defineComponentBinds('passwordAgain')

const showPassword = ref(false)
const showPasswordAgain = ref(false)

const sentEmail = ref(false)
const emailVerified = ref(false)
const emailAuthToken = ref('')

const toast = useToast()

const signup = handleSubmit(async (input) => {
  try {
    await axios.post(
      '/api/user/sign-up',
      {
        username: input.username,
        email: input.email,
        realName: input.realName,
        password: input.password
      },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      { headers: { 'email-auth': emailAuthToken.value } }
    )
    toast({
      message: 'Sign up succeed!',
      type: 'success'
    })
    emit('to', 'close')
  } catch (error) {
    toast({
      message: 'Sign up failed!',
      type: 'error'
    })
  }
})

const sendCodeToEmail = async () => {
  const emailIsValid = await validateField('email')
  if (!emailIsValid) {
    toast({
      message: 'Email is not valid!',
      type: 'error'
    })
    return
  }

  try {
    await axios.post('/api/email-auth/send-email/register-new', {
      email: email.value.modelValue
    })
    sentEmail.value = true
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 422) {
      toast({
        message: 'You have already signed up!',
        type: 'error'
      })
      return
    }
    toast({
      message: 'Sending verification code failed!',
      type: 'error'
    })
  }
}

const verifyCode = async () => {
  const emailIsValid = await validateField('email')
  if (!emailIsValid) {
    toast({
      message: 'Email is not valid!',
      type: 'error'
    })
    return
  }

  const verificationCodeIsValid = await validateField('verificationCode')
  if (!verificationCodeIsValid) {
    toast({
      message: 'Verification code is not valid!',
      type: 'error'
    })
    return
  }

  try {
    const response = await axios.post('/api/email-auth/verify-pin', {
      pin: verificationCode.value,
      email: email.value
    })
    if (response.status === 200) {
      emailVerified.value = true
      emailAuthToken.value = response.headers['email-auth']
    } else {
      toast({
        message: 'Email verification failed!',
        type: 'error'
      })
    }
  } catch (error) {
    toast({
      message: 'Email verification failed!',
      type: 'error'
    })
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center">
    <img :src="Logo" class="mb-8 h-20" />
    <form class="flex w-60 flex-col gap-4" @submit.prevent="signup">
      <InputItem
        v-bind="username"
        placeholder="Username"
        :error="errors.username"
      />
      <div class="flex gap-2">
        <InputItem
          v-bind="email"
          type="email"
          placeholder="Email Address"
          :error="errors.email"
        />
        <Button color="blue" @click.prevent="sendCodeToEmail">
          <IconPaperPlane />
        </Button>
      </div>
      <p v-show="sentEmail" class="text-green text-xs font-bold">
        Email verification code has been sent!
      </p>
      <div class="flex gap-2">
        <InputItem
          v-bind="verificationCode"
          type="number"
          placeholder="Verification Code"
          :error="errors.verificationCode"
        />
        <Button color="blue" @click.prevent="verifyCode()">
          <IconCheck />
        </Button>
      </div>
      <p v-show="emailVerified" class="text-green text-xs font-bold">
        Email has been verified!
      </p>
      <InputItem
        :v-bind="realName"
        placeholder="Real Name"
        :error="errors.realName"
      />
      <div class="flex items-center justify-between">
        <InputItem
          :v-bind="password"
          placeholder="Password"
          :type="showPassword ? 'text' : 'password'"
          :error="errors.password"
        />
        <component
          :is="showPassword ? RegularEye : EyeSlash"
          @click.stop="showPassword = !showPassword"
        />
      </div>
      <div class="flex items-center justify-between">
        <InputItem
          v-bind="passwordAgain"
          placeholder="Password Check"
          :type="showPasswordAgain ? 'text' : 'password'"
          :error="errors.passwordAgain"
        />
        <component
          :is="showPasswordAgain ? RegularEye : EyeSlash"
          @click.stop="showPasswordAgain = !showPasswordAgain"
        />
      </div>
      <Button color="blue" type="submit">Register</Button>
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
