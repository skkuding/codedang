<script setup lang="ts">
import Sidebar from './Sidebar.vue'
</script>

<template>
  <Story>
    <Variant title="Basic">
      <Sidebar
        :group="{
          id: -1,
          name: '',
          color: 'white'
        }"
      />
    </Variant>
    <Variant title="Group">
      <Sidebar
        :group="{
          id: 1,
          name: 'skkuding',
          color: 'blue'
        }"
      />
    </Variant>
  </Story>
</template>
