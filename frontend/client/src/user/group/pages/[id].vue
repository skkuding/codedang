<script setup lang="ts">
import Tab from '@/client/src/common/components/Molecule/Tab.vue'
import Profile from '@/client/src/user/group/components/Profile.vue'
import Contest from '@/client/src/user/group/components/Contest.vue'
import Member from '@/client/src/user/group/components/Member.vue'
import Notice from '@/client/src/user/group/components/Notice.vue'
import Workbook from '@/client/src/user/group/components/Workbook.vue'

defineProps<{
  id: string
}>()

// dummy data
const group = {
  id: 1,
  groupName: 'skkuding',
  description: 'skkuding description',
  groupImage: '@/client/src/common/assets/logo.png',
  createdBy: 1
}
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
