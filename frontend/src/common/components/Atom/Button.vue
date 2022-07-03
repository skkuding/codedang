<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  text?: string
  buttoncolor?: string
  isrounded?: boolean
}>()

const borderRadius = computed(() => {
  return props.isrounded ? ' rounded-full' : ' rounded'
})

const backgroundColor = computed(() => {
  if (props.buttoncolor === 'blue') {
    return 'bg-blue hover:bg-blue-dark text-white'
  } else if (props.buttoncolor === 'gray') {
    return 'bg-gray hover:bg-gray-dark text-white'
  } else if (props.buttoncolor === 'white') {
    return 'bg-white hover:bg-gray-light border-black border text-black'
  } else {
    return 'bg-green hover:bg-green-dark text-white'
  }
})
</script>

<template>
  <div>
    <button class="px-2.5 py-1" :class="backgroundColor + borderRadius">
      <slot name="icon"></slot>
      {{ text }}
    </button>
  </div>
</template>

<script lang="ts">
export default {
  name: 'ButtonAtom',
  data() {
    return {}
  },
  methods: {}
}
</script>
