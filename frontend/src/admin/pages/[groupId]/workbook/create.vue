<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import InputItem from '@/common/components/Atom/InputItem.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import TextEditor from '@/common/components/Organism/TextEditor.vue'
import { NDatePicker } from 'naive-ui'
import { ref } from 'vue'

const title = ref('')
const dateRange = ref<[number, number]>([1183135260000, Date.now()])
</script>

<template>
  <div class="flex flex-col">
    <div class="text-right text-lg font-semibold">SKKUDING</div>
    <div class="bg-gray h-[1px]"></div>
    <div class="mt-16">
      <h1 class="text-gray-dark mr-6 inline text-2xl font-semibold">
        Create Workbook
      </h1>
    </div>
    <div class="bg-gray h-[1px]"></div>
    <div class="mt-16 flex">
      <h2 class="mr-10 text-lg">Group</h2>
      <h2 class="text-lg">Title</h2>
    </div>
    <div class="mt-6 flex">
      <div class="mr-10">NPC 중급반</div>
      <InputItem v-model="title" required placeholder="Title" />
    </div>
    <h2 class="mt-8 text-lg">Description</h2>
    <TextEditor class="h-[360px] w-full" />

    <div class="mt-16">
      <NDatePicker v-model:value="dateRange" type="datetimerange" clearable />
    </div>
    <div class="mt-16 flex">
      <Switch class="mr-8" label="Visible" />
      <Switch label="Problem Difficulty Visible" />
    </div>
    <div class="bg-gray mt-16 h-[1px]"></div>
    <div class="mt-8 flex justify-end">
      <div class="flex">
        <Button class="mr-8 px-4 py-1" color="gray-dark">Cancel</Button>
        <Button class="px-4 py-1">Next</Button>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
