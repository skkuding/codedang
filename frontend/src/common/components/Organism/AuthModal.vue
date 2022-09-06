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

const content = ref<'login' | 'signup' | 'password'>('login')

/* define exact height value of modal for animation
   since `transition` cannot trigger `fit-content` */
const height = {
  login: 'h-[30rem]',
  signup: 'h-[36rem]',
  password: 'h-[10rem]'
}

const username = ref('')
const password = ref('')

const usernameNew = ref('')
const email = ref('')
const studentId = ref('')
const realName = ref('')
const passwordNew = ref('')
const passwordNewAgain = ref('')
</script>

<template>
  <Modal
    class="flex w-80 justify-center transition-all"
    :class="height[content]"
    :model-value="modelValue"
    @update:model-value="(value) => $emit('update:modelValue', value)"
  >
    <transition
      enter-active-class="transition-opacity"
      leave-active-class="transition-opacity"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
      mode="out-in"
    >
      <!-- Login Page -->
      <div
        v-if="content === 'login'"
        class="flex flex-col items-center justify-center"
      >
        <img src="@/common/assets/logo.svg" width="100" />
        <h1 class="text-green my-6 w-40 text-center text-xl font-bold">
          SKKU
          <br />
          Coding Platform
        </h1>
        <form class="mb-8 flex w-60 flex-col gap-4" @submit.prevent>
          <InputItem
            v-model="username"
            placeholder="Username"
            class="rounded-md"
          />
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
            @click="content = 'signup'"
          >
            Register now
          </Button>
          <Button
            class="bottom underline"
            color="white"
            @click="content = 'password'"
          >
            Forgot password?
          </Button>
        </div>
      </div>

      <!-- Sign Up Page -->
      <div
        v-else-if="content === 'signup'"
        class="flex flex-col items-center justify-center"
      >
        <h1 class="text-green mb-8 w-60 text-center text-xl font-bold">
          Welcome to
          <br />
          SKKU Coding Platform
        </h1>
        <form class="flex w-60 flex-col gap-3" @submit.prevent>
          <InputItem
            v-model="usernameNew"
            placeholder="Username"
            class="rounded-md"
          />
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
            v-model="passwordNew"
            type="password"
            placeholder="Password"
            class="rounded-md"
          />
          <InputItem
            v-model="passwordNewAgain"
            type="password"
            placeholder="Password Again"
            class="rounded-md"
          />
          <Button type="submit" class="rounded-md">Register</Button>
        </form>
        <!-- TODO: form validation -->
        <!-- TODO: email verification -->
        <!-- TODO: captcha -->
        <div class="text-gray-dark mt-6 flex flex-col text-sm">
          Already have an account?
          <!-- TODO: non-outlined button style -->
          <Button
            class="bottom underline"
            color="white"
            @click="content = 'login'"
          >
            Sign In
          </Button>
        </div>
      </div>

      <!-- Password Reset Page -->
      <div v-else>
        <Button
          class="bottom underline"
          color="white"
          @click="content = 'login'"
        >
          Sign In
        </Button>
      </div>
    </transition>
  </Modal>
</template>
