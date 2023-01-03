<script setup lang="ts">
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import IconEdit from '~icons/mdi/square-edit-outline'
import IconLock from '~icons/bi/lock'
import IconUnlock from '~icons/bi/unlock'
import Button from '@/common/components/Atom/Button.vue'
import IconTrash from '~icons/bi/trash'
defineProps<{
  groupId: number
}>()
</script>

<template>
  <div>
    <div class="mt-14 flex flex-row items-center">
      <PageTitle class="mr-4" text="SKKUDING" />
      <IconEdit
        class="cursor-pointer"
        width="30"
        height="30"
        color="#7c7a7b"
        @click="
          () => {
            $router.push('/')
          }
        "
      />
    </div>
    <div class="border-green mt-2 h-0 w-7/12 border-t-[11px] border-solid" />
    <div class="border-gray-dark h-0 w-full border-t border-solid" />
    <div class="mt-6 flex h-[30rem] flex-row items-center justify-between">
      <div class="flex h-[28rem] w-[46.5%] flex-col justify-between">
        <div>
          <PageSubtitle text="Description" />
          <div class="mt-2">SKKU 개발동아리입니다.</div>
        </div>
        <div>
          <PageSubtitle text="Public / Private" />
          <div class="mt-2 flex flex-row gap-6">
            <div class="flex flex-row gap-2">
              <IconUnlock />
              <span>Public</span>
            </div>
            <div class="flex flex-row gap-2">
              <IconLock />
              <span>Private</span>
            </div>
          </div>
        </div>
        <div>
          <PageSubtitle text="Total Members" />
          <div class="mt-2">16</div>
        </div>
        <div>
          <PageSubtitle text="Group Create Time" />
          <div class="mt-2">2022.06.24 10:15:45</div>
        </div>
      </div>
      <div class="border-gray-dark h-full w-0 border-x border-solid" />
      <div class="flex h-[28rem] w-[46.5%] flex-col justify-between">
        <div>
          <PageSubtitle text="Group Image & Color" />
          <div class="mt-2">SKKU 개발동아리입니다.</div>
        </div>
        <div>
          <PageSubtitle text="Invitation Code" />
          <div class="mt-2">ABCDEF</div>
        </div>
        <div>
          <PageSubtitle text="Group Managers" />
          <div class="mt-2 flex flex-row gap-6">
            <span>홍길동</span>
            <span>하설빙</span>
            <span>방미서</span>
          </div>
        </div>
        <div>
          <PageSubtitle text="Group Update Time" />
          <div class="mt-2">2022.06.24 10:15:45</div>
        </div>
      </div>
    </div>
    <div class="mt-10 flex w-full flex-row justify-end">
      <Button
        class="flex flex-row items-center gap-1"
        color="green"
        @click="
          () => {
            $router.push('/')
          }
        "
      >
        <IconTrash color="white" inline="true" />
        Delete
      </Button>
    </div>
  </div>
</template>
