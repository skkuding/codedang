<script setup lang="ts">
import Modal from '@/common/components/Molecule/Modal.vue'
import Button from '@/common/components/Atom/Button.vue'
import InputItem from '../Atom/InputItem.vue'
import { ref } from 'vue'
import PasswordFindModal from './PasswordFindModal.vue'
defineEmits<{
  (e: 'signup', value: string): boolean
  (e: 'login', value: string): boolean
  (e: 'password', value: string): boolean
  (e: 'auth', value: string): boolean
}>()
const isPasswordFindModalVisible = ref(false)
const isLogInModalVisible = ref(false)
const props = defineProps<{ visible?: boolean }>()

const PasswordFindModalClose = () => {
  isPasswordFindModalVisible.value = false
}

const LogInModalOpen = () => {
  isLogInModalVisible.value = true
}
</script>

<template>
  <Modal v-if="props.visible" class="h-[536px] w-96">
    <template #modal-title>
      <div class="text-green text-2xl font-semibold">
        <div>SKKU</div>
        <div>Coding Platform</div>
      </div>
    </template>
    <template #modal-image>
      <img src="@/common/assets/logo.svg" class="w-20" alt="" />
    </template>
    <template #modal-content>
      <ul class="m-5 space-y-4 p-2">
        <InputItem shadow placeholder="User ID" class="w-64" />
        <InputItem shadow placeholder="Password" class="w-64" />
      </ul>

      <Button color="green" class="mx-auto" @click="$emit('auth', true)">
        Sign In
      </Button>
      <div class="bottom-0 mt-8 flex justify-around">
        <button
          class="border-b-1 text-gray-dark border-black underline underline-offset-1"
          @click="$emit('signup', true)"
        >
          Register now
        </button>
        <button
          class="border-b-1 text-gray-dark border-black underline underline-offset-1"
          @click="$emit('password', true)"
        >
          Forgot Password?
        </button>
        <PasswordFindModal
          :visible="isPasswordFindModalVisible"
          @close="PasswordFindModalClose"
          @login="LogInModalOpen"
        ></PasswordFindModal>
      </div>
    </template>
  </Modal>
</template>
