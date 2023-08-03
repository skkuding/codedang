<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import InputItem from '@/common/components/Atom/InputItem.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import TextEditor from '@/common/components/Organism/TextEditor.vue'
import { NDatePicker } from 'naive-ui'
import { ref } from 'vue'

const title = ref('')
const range = ref(null)
const visible = ref(true)
const rankVisible = ref(true)
defineProps<{
  toggle: boolean
  setToggle: (a: boolean) => void
}>()
</script>

<template>
  <Modal
    class="bg-default w-full max-w-[70%]"
    :model-value="toggle"
    @update:model-value="
      () => {
        setToggle(toggle)
      }
    "
  >
    <div class="flex flex-col gap-8">
      <h1 class="text-gray-dark text-2xl font-semibold">Create Contest</h1>
      <div class="flex-col">
        <label class="w-20 text-lg font-bold">Title</label>
        <InputItem
          v-model="title"
          required
          placeholder="Title"
          class="w-full"
        />
      </div>
      <div>
        <h2 class="text-lg font-bold">Description</h2>
        <TextEditor size="lg" />
      </div>
      <div class="flex flex-col gap-3">
        <h2 class="text-lg font-bold">Period</h2>
        <n-date-picker
          v-model:value="range"
          update-value-on-close
          type="datetimerange"
        />
      </div>
      <div class="flex gap-5">
        <Switch v-model="visible" label="Visible" />
        <Switch v-model="rankVisible" label="Rank visible during contest" />
      </div>
    </div>
    <div class="border-gray mt-10 flex justify-end gap-3 border-t py-5">
      <Button class="text-sm font-normal capitalize" color="gray-dark">
        cancel
      </Button>
      <Button class="text-sm font-normal capitalize">save</Button>
    </div>
  </Modal>
</template>
