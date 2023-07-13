<script setup lang="ts">
import Tab from '@/common/components/Molecule/Tab.vue'
import Contest from '@/user/group/components/Contest.vue'
import Member from '@/user/group/components/Member.vue'
import Notice from '@/user/group/components/Notice.vue'
import Profile from '@/user/group/components/Profile.vue'
import Workbook from '@/user/group/components/Workbook.vue'
import axios from 'axios'
import { onMounted } from 'vue'

const props = defineProps<{
  id: string
}>()

// dummy data
// interface Group {
//   id: number
//   groupName: string
//   description: string
//   groupImage?: string
//   createdBy: number
// }
// const group = ref<Group>()
const group = {
  id: 1,
  groupName: 'skkuding',
  description: 'skkuding description',
  groupImage: '@/common/assets/logo.png',
  createdBy: 1
}

onMounted(async () => {
  try {
    const { data } = await axios.get(`/api//group/${props.id}`)
    console.log('response data is ', data)
    // group.value = data
  } catch (err) {
    // router.replace('/404')
    console.log(err)
  }
})
</script>

<template>
  <div class="mt-10 flex flex-col gap-4">
    <Profile
      :group-name="group.groupName"
      :description="group.description"
      :group-image="group.groupImage"
    />
    <Tab :items="['notice', 'contest', 'workbook', 'member']">
      <template #notice><Notice :id="Number(id)" /></template>
      <template #contest><Contest :id="Number(id)" /></template>
      <template #workbook>
        <Workbook :id="Number(id)" />
      </template>
      <template #member>
        <Member :id="Number(id)" :created-by="group.createdBy" />
      </template>
    </Tab>
  </div>
</template>
