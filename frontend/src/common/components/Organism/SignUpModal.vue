<script setup lang="ts">
import { ref } from 'vue'
import Modal from '../Molecule/Modal.vue'
import InputItem from '../Atom/InputItem.vue'
import Button from '../Atom/Button.vue'
import MajesticonsSend from '~icons/majesticons/send'
import Fa6SolidCheck from '~icons/fa6-solid/check'

defineEmits<{
  (e: 'open: SignUpModal', value: string): boolean
}>()
</script>

<template>
  <Modal>
    <template #modal-title>
      <div class="text-green text-2xl font-semibold">
        <div>Welcome to</div>
        <div>SKKU Coding Platform</div>
      </div>
    </template>
    <template #modal-content>
      <ul class="m-9 space-y-4 p-2">
        <InputItem shadow placeholder="User ID" class="h-[36px] w-[260px]" />
        <InputItem shadow placeholder="Student ID" class="h-[36px] w-[260px]" />
        <InputItem shadow placeholder="Real Name" class="h-[36px] w-[260px]" />
        <InputItem shadow placeholder="PassWord" class="h-[36px] w-[260px]" />
        <InputItem
          shadow
          placeholder="PassWord Again"
          class="h-[36px] w-[260px]"
        />
        <div class="flex justify-between">
          <InputItem
            :notice="false"
            shadow
            placeholder="Email Address"
            class="h-[36px] w-[240px]"
          />
          <Button color="green" c>
            <MajesticonsSend />
          </Button>
        </div>

        <div class="flex justify-between">
          <InputItem
            shadow
            placeholder="Vertification code"
            class="h-[36px] w-[240px]"
          />
          <Button color="green">
            <Fa6SolidCheck />
          </Button>
        </div>

        <InputItem shadow placeholder="Captcha" class="h-[36px] w-[130px]" />
      </ul>
      <Button color="green" class="mb-2">register</Button>
      <p class="text-gray-dark">Already have account?</p>
      <!-- TODO: 아래 border -->
      <button
        class="border-b-1 text-gray-dark border-black"
        @click="$emit('open: SignUpModal', true)"
      >
        Sign in
      </button>
    </template>
  </Modal>
</template>
