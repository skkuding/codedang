<script setup lang="ts">
import ModalVue from './Modal.vue'
import ButtonVue from '../Atom/Button.vue'
import { ref } from 'vue'
const isModalVisible = ref(false)
function close() {
  isModalVisible.value = false
  console.log(isModalVisible)
}
</script>

<template>
  <Story>
    <span>Click the button, and it shows modal!</span>
    <br />
    <ButtonVue @click="isModalVisible = true">showmodal</ButtonVue>
    <Transition name="modal">
      <ModalVue
        v-if="isModalVisible"
        title="skkuding coding platform"
        title-color="green"
        class="h-[767px] w-[360px]"
        @close="close"
      >
        <template #modal-image>
          <img src="@/common/assets/logo.svg" class="w-20" alt="" />
        </template>
        <template #modal-content>this is modal</template>
      </ModalVue>
    </Transition>
  </Story>
</template>
<style scoped>
.modal-enter-from {
  opacity: 0;
}
.modal-enter-active {
  transition: all 1s;
}

.modal-enter-to {
  opacity: 1;
}

.modal-leave-from {
  opacity: 1;
}

.modal-leave-active {
  transition: all 1s;
}

.modal-leave-to {
  opacity: 0;
}
</style>
