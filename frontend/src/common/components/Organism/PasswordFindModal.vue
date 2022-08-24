<script setup lang="ts">
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
  <Modal v-if="props.visible" class="h-96 w-96">
    <template #modal-title>
      <div class="text-green text-2xl font-semibold">PassWord Recovery</div>
    </template>
    <template #modal-content>
      <ul class="m-5 space-y-4 p-2">
        <!-- FIXME: space-x-1 적용안됨, SignupModal은 적용됨 -->
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

        <div class="flex justify-between space-x-1">
          <InputItem shadow placeholder="Vertification code" class="h-9 w-60" />
          <Button color="green" class="mt-1">
            <Fa6SolidCheck class="h-7 w-5" />
          </Button>
        </div>

        <InputItem shadow placeholder="Captcha" class="w-34 h-9" />
      </ul>

      <Button color="green" class="mb-2">Send Password Reset Email</Button>
      <div>
        <button
          class="border-b-1 text-gray-dark border-black"
          @click="$emit('login', true)"
        >
          Back to Sign in
        </button>
      </div>
    </template>
  </Modal>
</template>
