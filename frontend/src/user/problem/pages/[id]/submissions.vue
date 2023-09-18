<script setup lang="ts">
import { ref } from 'vue'
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
</script>

<template>
  <div class="flex min-h-full flex-row border-t border-slate-400">
    <SubmissionList @item="(item) => (submissionData = item)" />
    <SubmissionDetail :item="submissionData" />
  </div>
</template>
