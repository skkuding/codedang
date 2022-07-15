<script setup lang="ts">
import IonPersonOutline from '~icons/ion/person-outline'
import { ref } from 'vue'
defineProps<{
  isAuthenticated: boolean
  isAdminRole: boolean
}>()
let click = ref(false)

function isClicked() {
  click.value = !click.value
}
</script>

<template>
  <IonPersonOutline
    name="dropdown-icon"
    class="text-2xl hover:cursor-pointer"
    @click="isClicked"
  />
  <div v-show="click">
    <transition
      name="dropdown-content"
      class="absolute mt-4 hidden rounded-lg bg-white py-1 px-2 shadow md:block"
    >
      <div class="right-0 w-48 rounded shadow-lg">
        <div v-if="!isAuthenticated">
          <div>
            <div
              class="text-text-title hover:text-green my-1 flex w-full items-center justify-between rounded-lg px-3 py-1 text-base font-medium hover:no-underline"
            >
              Sign in
            </div>
            <div
              class="text-text-title hover:text-green my-1 flex w-full items-center justify-between rounded-lg px-3 py-1 text-base font-medium hover:no-underline"
            >
              Register
            </div>
          </div>
        </div>
        <div v-if="isAuthenticated">
          <div>
            <div
              v-if="isAdminRole"
              class="text-text-title hover:text-green my-1 flex w-full items-center justify-between rounded-lg px-3 py-1 text-base font-medium hover:no-underline"
            >
              Management
            </div>
            <a
              href="/"
              class="text-text-title hover:text-green my-1 flex w-full items-center justify-between rounded-lg px-3 py-1 text-base font-medium hover:no-underline"
            >
              My page
            </a>
            <div
              class="text-text-title hover:text-green my-1 flex w-full items-center justify-between rounded-lg px-3 py-1 text-base font-medium hover:no-underline"
            >
              Sign out
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>
