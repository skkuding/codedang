<script setup lang="ts">
import Profile from '../../../home/components/Profile.vue'
import Tab from '@/common/components/Molecule/Tab.vue'
import contest from '../../components/contest.vue'
import member from '../../components/member.vue'
import notice from '../../components/notice.vue'
import workbook from '../../components/workbook.vue'
defineProps<{
  id: number
}>()

const group = {
  id: 1,
  groupName: 'skkuding',
  description: 'skkuding description',
  groupImage: '@/common/assets/logo.png',
  createdBy: 1
}
</script>

<template>
  <div class="px-20 pt-20 md:px-40">
    <Profile
      class="pb-7"
      :group-name="group.groupName"
      :description="group.description"
      :group-image="group.groupImage"
    ></Profile>
    <Tab :items="['notice', 'contest', 'workbook', 'member']">
      <template #notice><notice :id="id" class="pt-16" /></template>
      <template #contest><contest :id="id" class="pt-16" /></template>
      <template #workbook><workbook :id="id" class="pt-16" /></template>
      <template #member>
        <member :id="id" :created-by="group.createdBy" class="pt-16" />
      </template>
    </Tab>
  </div>
</template>
