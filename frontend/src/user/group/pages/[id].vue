<script setup lang="ts">
import Tab from '@/common/components/Molecule/Tab.vue'
import Contest from '@/user/group/components/Contest.vue'
import Member from '@/user/group/components/Member.vue'
import Notice from '@/user/group/components/Notice.vue'
import Problem from '@/user/group/components/Problem.vue'
import Profile from '@/user/group/components/Profile.vue'
import Workbook from '@/user/group/components/Workbook.vue'
import axios from 'axios'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps<{
  id: string
}>()

interface Group {
  id: number
  groupName: string
  isGroupLeader: boolean
  description: string
  groupImage?: string
  isJoined: boolean
}
const group = ref<Group>({
  id: 1,
  groupName: '',
  isGroupLeader: false,
  description: '',
  groupImage: '',
  isJoined: true
})

onMounted(async () => {
  try {
    const { data } = await axios.get(`/api/group/${props.id}`)
    if (!data.isJoined) {
      router.go(-1)
    } else {
      group.value = data
    }
  } catch (err) {
    router.replace('/404')
  }
})
</script>

<template>
  <div class="mt-10 flex flex-col gap-4">
    <Profile
      :id="Number(id)"
      :is-group-leader="group.isGroupLeader"
      :group-name="group.groupName"
      :description="group.description"
      :group-image="group.groupImage ? group.groupImage : ''"
    />
    <Tab :items="['notice', 'contest', 'problem', 'workbook', 'member']">
      <template #notice><Notice :id="Number(id)" /></template>
      <template #contest><Contest :id="Number(id)" /></template>
      <template #problem><Problem :id="Number(id)" /></template>
      <template #workbook>
        <Workbook :id="Number(id)" />
      </template>
      <template #member>
        <Member :id="Number(id)" />
      </template>
    </Tab>
  </div>
</template>
