<script setup lang="ts">
import ListItem from './ListItem.vue'
</script>

<template>
  <Story>
    <Variant title="White">
      <ul>
        <ListItem color="white">Hover mouse on me!</ListItem>
        <ListItem color="white">Hover mouse on me!</ListItem>
        <ListItem color="white">Hover mouse on me!</ListItem>
      </ul>
    </Variant>
    <Variant title="Slate">
      <ul>
        <ListItem color="slate">Hover mouse on me!</ListItem>
        <ListItem color="slate">Hover mouse on me!</ListItem>
        <ListItem color="slate">Hover mouse on me!</ListItem>
      </ul>
    </Variant>
  </Story>
</template>
