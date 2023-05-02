<script setup lang="ts">
import ProgressCard from './ProgressCard.vue'
</script>

<template>
  <Story>
    <Variant title="Default">
      <ProgressCard
        title="프로그래밍대회"
        header="updated 3.30"
        description="프로그래밍대회 기출문제 입니다."
        :total="10"
        :complete="6"
      />
    </Variant>
    <Variant title="Custom">
      <ProgressCard
        title="프로그래밍대회"
        header="updated 3.30"
        description="프로그래밍대회 기출문제 입니다."
        :total="100"
        :complete="80"
        progress-text="problems"
        color="#FFC3DA"
      />
    </Variant>
  </Story>
</template>
