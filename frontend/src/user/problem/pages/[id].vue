<script setup lang="ts">
import SubmissionList from '../components/SubmissionList.vue'
import SubmissionDetail from '../components/SubmissionDetail.vue'
import { ref } from 'vue'
defineProps<{
  id: number
}>()

const submissionSelected = ref<number>()
const selectSubmission = (submissionId: number) => {
  submissionSelected.value = submissionId
}
const code = ref('')
</script>

<template>
  <div class="flex">
    <SubmissionList
      class="w-1/2"
      @select-submission="selectSubmission"
    ></SubmissionList>
    <SubmissionDetail v-model="code" class="w-1/2"></SubmissionDetail>
  </div>
</template>

<route lang="yaml">
meta:
  layout: empty
</route>
