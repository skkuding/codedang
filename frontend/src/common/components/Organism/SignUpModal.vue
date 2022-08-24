<script setup lang="ts">
import { ref } from 'vue'
import Modal from '../Molecule/Modal.vue'
import InputItem from '../Atom/InputItem.vue'
import Button from '../Atom/Button.vue'
import MajesticonsSend from '~icons/majesticons/send'
import Fa6SolidCheck from '~icons/fa6-solid/check'

defineEmits<{
  (e: 'signup', value: string): boolean
  (e: 'login', value: string): boolean
  (e: 'password', value: string): boolean
}>()
const props = defineProps<{ visible?: boolean }>()
</script>

<template>
  <!-- TODO: tailwindcss 크기 표현으로 큰 px(h-96 w-96이상) 표현하기-->
  <Modal v-if="props.visible" class="h-[687px] w-96">
    <template #modal-title>
      <div class="text-green text-2xl font-semibold">
        <div>Welcome to</div>
        <div>SKKU Coding Platform</div>
      </div>
    </template>
    <template #modal-content>
      <ul class="m-5 space-y-4 p-2">
        <InputItem shadow placeholder="User ID" class="h-9 w-72" />
        <InputItem shadow placeholder="Student ID" class="h-9 w-72" />
        <InputItem shadow placeholder="Real Name" class="h-9 w-72" />
        <InputItem shadow placeholder="PassWord" class="h-9 w-72" />
        <InputItem shadow placeholder="PassWord Again" class="h-9 w-72" />
        <div class="flex justify-between space-x-1">
          <InputItem
            :notice="false"
            shadow
            placeholder="Email Address"
            class="h-9 w-60"
          />
          <Button color="green" class="mt-1">
            <MajesticonsSend class="h-7 w-5" />
          </Button>
        </div>
        <!-- FIXME: space-x-1적용 안했는데 먹히는 현상 해결필요 -->
        <div class="flex justify-between">
          <InputItem shadow placeholder="Vertification code" class="h-9 w-60" />
          <Button color="green" class="mt-1">
            <Fa6SolidCheck class="h-7 w-5" />
          </Button>
        </div>

        <InputItem shadow placeholder="Captcha" class="h-9 w-72" />
      </ul>
      <Button color="green" class="mb-2">Register</Button>
      <p class="text-gray-dark">Already have account?</p>
      <!-- TODO: 아래 border 적용안됨 -->
      <button
        class="border-b-gray-dark text-gray-dark border-black"
        @click="$emit('login', true)"
      >
        Sign in
      </button>
    </template>
  </Modal>
</template>
