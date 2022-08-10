<script setup lang="ts">
import { ref } from 'vue'
import { computed } from 'vue'

type Size = 'small' | 'large'

const props = defineProps<{
  placeholder: string
  shadow: boolean
  size?: Size
  notice?: boolean
}>()

defineEmits(['update:data'])
const data = ref('')

const setShadow = computed(() => [
  props.shadow
    ? 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)] focus:drop-shadow-[0_2px_8px_rgba(141,198,63,0.5)]'
    : 'border-gray border focus:border-green focus:ring-green focus:ring-1',
  props.size === 'small' ? 'text-sm px-1 min-w-[80px]' : '',
  props.size === 'large' ? 'min-w-[160px]' : ''
])
const setRequired = computed(() => [
  data.value == '' ? 'block' : 'hidden',
  props.size === 'small' ? 'min-w-[80px]' : '',
  props.size === 'large' ? 'min-w-[160px]' : ''
])
</script>

<template>
  <input
    v-model="data"
    :placeholder="placeholder"
    :class="setShadow"
    class="w-full rounded-lg py-2.5 px-5 text-base font-bold focus:outline-none"
    @input="$emit('update:data', data)"
  />
  <div
    v-if="props.notice"
    :class="setRequired"
    class="text-red pt-1 text-xs font-bold"
  >
    {{ placeholder + ' is required' }}
  </div>
</template>
