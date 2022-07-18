<script setup lang="ts">
import ProgressCard from './ProgressCard.vue'
</script>

<template>
  <Story>
    <ProgressCard
      title="프로그래밍대회"
      header="updated 3.30"
      description="프로그래밍대회 기출문제 입니다."
      :total="10"
      :complete="6"
    />
    <h2 class="mt-8 mb-2 text-lg">Another Example</h2>
    <ProgressCard
      title="프로그래밍대회"
      header="updated 3.30"
      description="프로그래밍대회 기출문제 입니다."
      :total="100"
      :complete="80"
      progress-text="problems"
      color="#FFC3DA"
    />
  </Story>
</template>
