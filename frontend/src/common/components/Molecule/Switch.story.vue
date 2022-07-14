<script setup lang="ts">
import Switch from '@/common/components/Molecule/Switch.vue'
import { ref } from 'vue'

var dat1 = ref(false)
var dat2 = ref(false)
</script>

<template>
  <Story>
    <Switch label="Label" @switchdata="(i) => (dat1 = i)" />
    <p>Emmited value : {{ dat1 }}</p>
    <h2 class="mt-8 mb-2 text-lg">Another Example</h2>
    <Switch label="Private" @switchdata="(i) => (dat2 = i)" />
    <p>Emmited value : {{ dat2 }}</p>
  </Story>
</template>
