<script setup lang="ts">
import Modal from '@/common/components/Molecule/Modal.vue'
import Button from '@/common/components/Atom/Button.vue'
import InputItem from '../Atom/InputItem.vue'
defineEmits<{
  (e: 'open: logInModal', value: string): boolean
  (e: 'open: SignUpModal', value: string): boolean
  (e: 'open: PasswordFindModal', value: string): boolean
}>()
</script>

<template>
  <Modal>
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
      <Button color="green">Sign In</Button>
      <div class="bottom-0 mt-8 flex justify-around">
        <button
          class="border-b-1 text-gray-dark border-black"
          @click="$emit('open: SignUpModal', true)"
        >
          Register now
        </button>
        <button
          class="border-b-1 text-gray-dark border-black"
          @click="$emit('open: PasswordFindModal', true)"
        >
          Forgot Password?
        </button>
      </div>
    </template>
  </Modal>
</template>
