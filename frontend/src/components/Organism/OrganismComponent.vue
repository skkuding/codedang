<script setup lang="ts">
defineProps<{
  msg: string
}>()
</script>

<template>
  <div>Organism Component props : {{ msg }}</div>
</template>

<script lang="ts">
export default {
  name: 'OrganismComponent',
  data() {
    return {}
  },
  computed: {},
  methods: {}
}
</script>

<!--
<style scoped>
style code를 작성해주세요.
</style>
-->
