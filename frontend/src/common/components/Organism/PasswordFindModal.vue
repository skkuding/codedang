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
  <Modal v-if="props.visible" class="text-green h-[401px] w-[360px]">
    <template #modal-title>
      <div class="text-green text-2xl font-semibold">PassWord Recovery</div>
    </template>
    <template #modal-content>
      <ul class="m-9 space-y-4 p-2">
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
