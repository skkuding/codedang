<script setup lang="ts">
import Tab from './Tab.vue'

const items = ['notice', 'contest', 'workbook', 'member']
</script>

<template>
  <Story>
    <Tab :items="items">
      <template #notice>This is Notice Page</template>
      <template #contest>This is Contest Page</template>
      <template #workbook>This is Workbook Page</template>
      <template #member>This is Member Page</template>
    </Tab>
    <h2 class="mt-8 mb-2 text-lg">* custom example</h2>
    <Tab :items="items" color="#FF1993">
      <template #notice>This is Notice Page</template>
      <template #contest>This is Contest Page</template>
      <template #workbook>This is Workbook Page</template>
      <template #member>This is Member Page</template>
    </Tab>
  </Story>
</template>
