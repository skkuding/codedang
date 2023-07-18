<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import IconGear from '~icons/fa6-solid/gear'

const props = defineProps<{
  id: number
  isGroupLeader: boolean
  groupName: string
  description: string
  groupImage: string
}>()
</script>

<template>
  <div class="flex items-center gap-4">
    <img
      class="h-20 w-20 rounded-lg object-contain shadow-[0_4px_4px_0px_rgba(0,0,0,0.25)]"
      src="@/common/assets/logo.png"
      alt="Group img"
    />
    <!-- <img :src="`data:image/png;base64,${groupImage}`" /> API 호출 시 이미지를 base-64로 가져와서 추후 해당 코드로 적용 예정. 현재 임의로 로고 집어넣음-->
    <div class="flex flex-col gap-1">
      <div class="flex items-baseline gap-2">
        <PageTitle :text="groupName" />
        <Button v-if="props.isGroupLeader" color="gray-dark" class="px-1">
          <IconGear
            class="h-3 w-3"
            @click="$router.push(`/admin/${props.id}`)"
          />
        </Button>
      </div>
      <div class="text-black">{{ description }}</div>
    </div>
  </div>
</template>
