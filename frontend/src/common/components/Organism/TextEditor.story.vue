<script setup lang="ts">
import TextEditor from './TextEditor.vue'
</script>

<template>
  <Story>
    <Variant name="Default">
      <TextEditor />
    </Variant>
    <Variant name="Large">
      <TextEditor class="lg" />
    </Variant>
  </Story>
</template>
