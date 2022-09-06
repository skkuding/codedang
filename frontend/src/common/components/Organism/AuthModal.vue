<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue'
import Modal from '../Molecule/Modal.vue'

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
  password: 'h-[24rem]'
}

const Login = defineAsyncComponent(() => import('./Login.vue'))
const Signup = defineAsyncComponent(() => import('./Signup.vue'))
const PasswordReset = defineAsyncComponent(() => import('./PasswordReset.vue'))
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
      <Login v-if="content === 'login'" @to="(value) => (content = value)" />
      <Signup
        v-else-if="content === 'signup'"
        @to="(value) => (content = value)"
      />
      <PasswordReset
        v-else-if="content === 'password'"
        @to="(value) => (content = value)"
      />
    </transition>
  </Modal>
</template>
