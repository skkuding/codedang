<script setup lang="ts">
import IonPersonOutline from '~icons/ion/person-outline'
import { ref, computed } from 'vue'
import Button from '../Atom/Button.vue'
interface buttonStyle {
  color: string
  rounded: boolean
  text: string
}
const props = defineProps<{
  content: string[]
  icon?: string
  text?: string
  button?: buttonStyle
}>()
let click = ref(false)
// const addTag = (tag) => {
//   tags.value.push(tag)
//   newTag.value = '' // reset newTag
// }

function isClicked() {
  click.value = !click.value
}
</script>

<template>
  <div v-if="props.icon">
    <IonPersonOutline
      name="dropdown-icon"
      class="text-2xl hover:cursor-pointer"
      @click="isClicked"
    />
  </div>
  <div
    v-else-if="props.text"
    class="text-2xl hover:cursor-pointer"
    @click="isClicked"
  ></div>
  <div v-else-if="props.button" class="text-2xl hover:cursor-pointer">
    <Button
      :color="props.button.color"
      :rounded="props.button.rounded"
      @click="isClicked"
    >
      {{ props.button.text }}
    </Button>
  </div>
  <div v-show="click">
    <transition
      name="dropdown-content"
      class="absolute mt-4 hidden rounded-lg bg-white py-1 px-2 shadow md:block"
    >
      <div class="right-0 w-48 rounded shadow-lg">
        <div v-for="c in props.content" :key="c">
          <div
            class="text-text-title hover:text-green my-1 flex w-full items-center justify-between rounded-lg px-3 py-1 text-base font-medium hover:no-underline"
          >
            {{ c }}
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
