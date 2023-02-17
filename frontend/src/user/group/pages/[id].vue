<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import Profile from '@/user/group/components/Profile.vue'
import Tab from '@/common/components/Molecule/Tab.vue'
import Contest from '@/user/group/components/Contest.vue'
import Member from '@/user/group/components/Member.vue'
import Notice from '@/user/group/components/Notice.vue'
import Workbook from '@/user/group/components/Workbook.vue'
import IconChevronLeft from '~icons/fa6-solid/chevron-left'

defineProps<{
  id: string
}>()

// dummy data
const group = {
  id: 1,
  groupName: 'skkuding',
  description: 'skkuding description',
  groupImage: '@/common/assets/logo.png',
  createdBy: 1
}
</script>

<template>
  <div class="mt-5 flex flex-col gap-4">
    <Button
      color="white"
      class="flex items-center gap-1 self-start text-sm font-normal"
      @click="$router.go(-1)"
    >
      <IconChevronLeft class="h-3 w-3" />
      뒤로가기
    </Button>
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
