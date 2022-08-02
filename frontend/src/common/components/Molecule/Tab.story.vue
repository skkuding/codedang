<script setup lang="ts">
import Tab from './Tab.vue'

const items = ['notice', 'contest', 'workbook', 'member']
</script>

<template>
  <Story>
    <Variant title="Default">
      <Tab :items="items">
        <template #notice>This is Notice Page</template>
        <template #contest>This is Contest Page</template>
        <template #workbook>This is Workbook Page</template>
        <template #member>This is Member Page</template>
      </Tab>
    </Variant>
    <Variant title="Custom">
      <Tab :items="items" color="#FF1993">
        <template #notice>This is Notice Page</template>
        <template #contest>This is Contest Page</template>
        <template #workbook>This is Workbook Page</template>
        <template #member>This is Member Page</template>
      </Tab>
    </Variant>
  </Story>
</template>
