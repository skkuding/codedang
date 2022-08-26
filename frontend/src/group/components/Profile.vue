<script setup lang="ts">
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import Button from '@/common/components/Atom/Button.vue'
import Setting from '~icons/ph/gear'
defineProps<{
  groupName: string
  description: string
  groupImage: string
}>()
</script>

<template>
  <div class="flex items-end">
    <img
      class="h-20 w-20 rounded-lg object-contain shadow-[0_4px_4px_0px_rgba(0,0,0,0.25)]"
      src="@/common/assets/logo.png"
      alt="Group img"
    />
    <!-- <img :src="`data:image/png;base64,${groupImage}`" /> API 호출 시 이미지를 base-64로 가져와서 추후 해당 코드로 적용 예정. 현재 임의로 로고 집어넣음-->
    <div class="pl-4">
      <div class="flex items-end">
        <PageTitle :text="groupName" />
        <Button color="gray-dark" class="ml-2 px-1">
          <Setting class="h-6 w-6" />
        </Button>
      </div>
      <div class="text-black">{{ description }}</div>
    </div>
  </div>
</template>
