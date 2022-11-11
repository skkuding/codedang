<script setup lang="ts">
import { open, dialogInfo } from '@/common/composables/dialog'
import Button from '../Atom/Button.vue'

const emit = defineEmits<{
  (e: 'yes' | 'no'): void
}>()

const handler = (action: 'yes' | 'no') => {
  open.value = false
  emit(action)
}
</script>

<template>
  <Transition
    enter-active-class="transition-opacity"
    leave-active-class="transition-opacity"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
    mode="out-in"
  >
    <div
      v-if="open"
      class="fixed inset-0 z-40 flex h-full w-full items-center justify-center bg-black/25 backdrop-blur"
    >
      <section class="h-fit w-96 overflow-hidden rounded-lg bg-white p-6">
        <h1
          class="flex items-center gap-2 text-xl font-bold"
          :class="{
            'text-green': dialogInfo?.type === 'success',
            'text-red': dialogInfo?.type === 'error'
          }"
        >
          {{ dialogInfo?.title }}
        </h1>
        <div class="my-4">{{ dialogInfo?.content }}</div>
        <div class="mt-8 flex justify-end gap-2">
          <template v-if="dialogInfo?.type === 'confirm'">
            <Button color="gray-dark" @click="handler('yes')">
              {{ dialogInfo?.yes || 'OK' }}
            </Button>
            <Button color="gray-dark" @click="handler('no')">
              {{ dialogInfo?.no || 'Cancel' }}
            </Button>
          </template>
          <template v-else-if="dialogInfo?.type === 'success'">
            <Button @click="handler('yes')">
              {{ dialogInfo?.yes || 'OK' }}
            </Button>
          </template>
          <template v-else-if="dialogInfo?.type === 'error'">
            <Button color="red" @click="handler('yes')">
              {{ dialogInfo?.yes || 'OK' }}
            </Button>
          </template>
        </div>
      </section>
    </div>
  </Transition>
</template>
