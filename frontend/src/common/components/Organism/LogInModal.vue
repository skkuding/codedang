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
  console.log(isPasswordFindModalVisible.value)
}

const LogInModalOpen = () => {
  isLogInModalVisible.value = true
  console.log(isLogInModalVisible.value)
}
</script>

<template>
  <Modal v-if="props.visible" class="text-green h-[537px] w-[360px]">
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
      <ul class="m-9 space-y-4 p-2">
        <InputItem shadow placeholder="User ID" />
        <InputItem shadow placeholder="Password" />
      </ul>
      <!-- TODO: sign in 눌렀을 경우 아이콘으로 바뀌기-->
      <Button color="green" @click="$emit('auth', true)">Sign In</Button>
      <div class="bottom-0 mt-8 flex justify-around">
        <button
          class="border-b-1 text-gray-dark border-black"
          @click="$emit('signup', true)"
        >
          Register now
        </button>
        <button
          class="border-b-1 text-gray-dark border-black"
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
