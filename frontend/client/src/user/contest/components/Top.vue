<script setup lang="ts">
defineProps<{
  id: number
}>()

const text =
  '<div>일시 : 1/4(월) - 1/10(일) 참여 방법 :상단의 SKKU Coding Platform 모의대회 클릭 후 참여\
  <br>참여 혜택 : 스타벅스 5000원 상품권 증정\
  <br>참여 조건 : 한 문제 이상 풀기\
  <br>문의 및 건의 :http://pf.kakao.com/_UKraK/chat\
  <br><br>(성균관대학교 코딩 플랫폼 개발 및 발전을 위한 건의 환영합니다)</div>'
</script>

<template>
  <div v-dompurify-html="text" class="prose lg:prose-xl mt-10"></div>
</template>
