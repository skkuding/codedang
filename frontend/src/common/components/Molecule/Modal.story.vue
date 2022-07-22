<script setup lang="ts">
import ModalVue from './Modal.vue'
</script>

<template>
  <Story>
    <ModalVue
      title="skkuding coding platform"
      title-color="green"
      class="h-[767px] w-[360px]"
    >
      <template #modal-image>
        <img src="@/common/assets/logo.svg" class="w-20" alt="" />
      </template>
      <template #modal-content>this is modal</template>
    </ModalVue>

    <ModalVue
      title="skkuding coding platform"
      title-color="gray"
      class="h-[767px] w-[360px]"
    />
  </Story>
</template>
