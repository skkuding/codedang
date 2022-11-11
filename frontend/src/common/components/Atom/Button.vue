<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  color?: 'green' | 'blue' | 'red' | 'gray' | 'gray-dark'
  outline?: boolean
  pressed?: boolean
}>()

const colorMapper = {
  green: 'text-green hover:bg-green/20 active:bg-green/40',
  blue: 'text-blue hover:bg-blue/20 active:bg-blue/40',
  gray: 'text-gray hover:bg-gray/20 active:bg-gray/40',
  red: 'text-red hover:bg-red/20 active:bg-red/40',
  // eslint-disable-next-line
  'gray-dark': 'text-gray-dark hover:bg-gray-dark/20 active:bg-gray-dark/40'
}

const pressedColorMapper = {
  green: 'text-green bg-green/40',
  blue: 'text-blue bg-blue/40',
  gray: 'text-gray bg-gray/40',
  red: 'text-red bg-red/40',
  // eslint-disable-next-line
  'gray-dark': 'text-gray-dark bg-gray-dark/40'
}

const backgroundColorMapper = {
  green: 'text-white bg-green hover:bg-green/80 active:bg-green/60',
  blue: 'text-white bg-blue hover:bg-blue/80 active:bg-blue/60',
  gray: 'text-default bg-gray hover:bg-gray/80 active:bg-gray/60',
  red: 'text-white bg-red hover:bg-red/80 active:bg-red/60',
  // eslint-disable-next-line
  'gray-dark':
    'text-white bg-gray-dark hover:bg-gray-dark/80 active:bg-gray-dark/60'
}

const pressedBackgroundColorMapper = {
  green: 'text-white bg-green/60',
  blue: 'text-white bg-blue/60',
  gray: 'text-default bg-gray/60',
  red: 'text-white bg-red/60',
  // eslint-disable-next-line
  'gray-dark': 'text-white bg-gray-dark/60'
}

const classNames = computed(() =>
  props.outline
    ? (props.pressed
        ? pressedColorMapper[props.color || 'green']
        : colorMapper[props.color || 'green'] + ' bg-transparent') +
      ' border border-current'
    : props.pressed
    ? pressedBackgroundColorMapper[props.color || 'green']
    : backgroundColorMapper[props.color || 'green']
)
</script>

<template>
  <button class="rounded px-2 py-1 font-semibold" :class="classNames">
    <slot />
  </button>
</template>
