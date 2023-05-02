<script setup lang="ts">
import CardItem from './CardItem.vue'
</script>

<template>
  <Story>
    <CardItem
      class="w-[640px]"
      title="Lorem Ipsum"
      img="https://www.skku.edu/_res/skku/img/skku_s.png"
      description="Lorem Ipsum is simply dummy text"
      additional-text="Status: Ongoing"
      colored-text="Created by skkuding"
      colored-text-short="By skkuding"
    />
    <h2 class="mb-2 mt-8 text-lg">Another Example</h2>
    <CardItem
      class="w-[640px] rounded-lg"
      title="Colored Gray"
      description="Lorem Ipsum is simply dummy text"
      additional-text="Status: Ongoing"
      colored-text="Created by skkuding"
      colored-text-short="By skkuding"
      border-color="gray"
    />
  </Story>
</template>
