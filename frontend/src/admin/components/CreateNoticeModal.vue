<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import InputItem from '@/common/components/Atom/InputItem.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import TextEditor from '@/common/components/Organism/TextEditor.vue'
import { ref } from 'vue'

defineProps<{
  toggle: boolean
  setToggle: (a: boolean) => void
}>()
const title = ref('')
const problemId = ref('')
</script>

<template>
  <Modal
    :model-value="toggle"
    @update:model-value="
      () => {
        setToggle(toggle)
      }
    "
  >
    <div class="flex flex-col">
      <h1 class="text-gray-dark text-2xl font-semibold">
        Create Contest Notice
      </h1>
      <h2 class="text-gray-dark border-gray border-b py-5 font-semibold">
        SKKU 프로그래밍 대회 - SKKUDING
      </h2>
      <div class="grid grid-cols-2 gap-5">
        <div class="mt-6 flex-col">
          <label class="w-20 text-lg font-bold">Title</label>
          <InputItem
            v-model="title"
            required
            placeholder="Title"
            class="w-full"
          />
        </div>
        <div class="mt-6 flex-col">
          <label class="w-20 text-lg font-bold">Problem ID</label>
          <InputItem
            v-model="problemId"
            class="w-full"
            required
            placeholder="Problem ID"
          />
        </div>
      </div>
      <h2 class="mt-8 text-lg font-bold">Content</h2>
      <TextEditor size="lg" />
    </div>
    <div class="border-gray mt-10 flex justify-end gap-3 border-t py-5">
      <Button class="text-sm font-normal capitalize" color="gray-dark">
        cancel
      </Button>
      <Button class="text-sm font-normal capitalize">save</Button>
    </div>
  </Modal>
</template>
