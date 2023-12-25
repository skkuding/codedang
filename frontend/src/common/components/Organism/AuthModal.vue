<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import Modal from '../Molecule/Modal.vue'

type ModalStatus = 'close' | 'login' | 'signup' | 'password'

defineProps<{
  modelValue: ModalStatus
}>()

defineEmits<{
  (e: 'update:modelValue', value: ModalStatus): void
}>()

/* define exact height value of modal for animation
   since `transition` cannot trigger `fit-content` */
const height = {
  login: 'h-[27rem]',
  signup: 'h-[42rem]',
  password: 'h-[24rem]',
  close: 'h-[18rem]' // set non-zero height for closing animation
}

const Login = defineAsyncComponent(() => import('./Login.vue'))
const Signup = defineAsyncComponent(() => import('./Signup.vue'))
const PasswordReset = defineAsyncComponent(() => import('./PasswordReset.vue'))
</script>

<template>
  <Modal
    class="flex w-80 justify-center transition-all"
    :class="height[modelValue]"
    :model-value="modelValue !== 'close'"
    @update:model-value="$emit('update:modelValue', 'close')"
  >
    <transition
      enter-active-class="transition-opacity"
      leave-active-class="transition-opacity"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
      mode="out-in"
    >
      <KeepAlive>
        <Login
          v-if="modelValue === 'login'"
          @to="(value) => $emit('update:modelValue', value)"
        />
        <Signup
          v-else-if="modelValue === 'signup'"
          @to="(value) => $emit('update:modelValue', value)"
        />
        <PasswordReset
          v-else-if="modelValue === 'password'"
          @to="(value) => $emit('update:modelValue', value)"
        />
      </KeepAlive>
    </transition>
  </Modal>
</template>
