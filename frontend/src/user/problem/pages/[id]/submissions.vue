<script setup lang="ts">
import { ref, watch } from 'vue'
import SubmissionDetail from '../../components/SubmissionDetail.vue'
import SubmissionList from '../../components/SubmissionList.vue'

type Submission = {
  id: string
  createTime: string
  language: string
  result: string
  user: string
}
const submissionData = ref<Submission>({
  id: '',
  createTime: '',
  language: '',
  result: '',
  user: ''
})
const getSubmission = (item: Submission) => {
  console.log('list', item)
  submissionData.value = item
}
watch(submissionData, () => {
  console.log('watch', submissionData.value)
})
</script>

<template>
  <div class="flex flex-row border-t border-slate-400">
    <SubmissionList @item="getSubmission" />
    <SubmissionDetail :id="submissionData.id" :item="submissionData" />
  </div>
</template>
