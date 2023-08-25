<script setup lang="ts">
import { ref } from 'vue'
import SubmissionDetail from '../../components/SubmissionDetail.vue'
import SubmissionList from '../../components/SubmissionList.vue'

// type Submission = {
//   id: string
//   createTime: string
//   language: string
//   result: string
//   user: {
//     username: string
//   }
// }
// const submissionData = ref<Submission>({
//   id: '',
//   createTime: '',
//   language: '',
//   result: '',
//   user: {
//     username: ''
//   }
// })
const submissionId = ref('')
const getId = (id: string) => {
  submissionId.value = id
}
</script>

<template>
  <div class="flex flex-row border-t border-slate-400">
    <SubmissionList @id="getId" />
    <SubmissionDetail :id="submissionId" />
  </div>
</template>
