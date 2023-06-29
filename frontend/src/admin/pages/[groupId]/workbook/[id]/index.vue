<script setup lang="ts">
const props = defineProps<{
  groupId: string
}>()
</script>

<template>
  <div class="flex flex-col">
    <div class="text-right text-lg font-semibold">SKKUDING</div>
    <div class="bg-gray h-[1px]"></div>
    <div class="mt-10">
      <h1 class="text-gray-dark mr-6 inline text-2xl font-semibold">
        Workbook List
      </h1>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
