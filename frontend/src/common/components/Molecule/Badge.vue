<script setup lang="ts">
defineProps<{
  endtime: string
  ended: boolean
}>()
</script>

<template>
  <div
    class="border-gray bg-gray-light relative box-border flex h-14 w-40 rounded-md border p-1"
  >
    <div
      v-if="ended"
      class="bg-green margin top-0 bottom-0 my-auto ml-3 h-6 w-6 rounded-full"
    ></div>
    <div
      v-else
      class="bg-red margin top-0 bottom-0 my-auto ml-3 h-6 w-6 rounded-full"
    ></div>
    <div
      v-if="ended"
      class="text-gray-dark top-0 bottom-0 my-auto ml-2 text-[22px] font-bold"
    >
      {{ endtime }}
    </div>
    <div
      v-else
      class="text-gray-dark top-0 bottom-0 my-auto ml-5 text-[22px] font-bold"
    >
      Ended
    </div>
  </div>
</template>
