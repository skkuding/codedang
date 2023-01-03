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
    <div class="flex flex-row items-center mt-14">
      <PageTitle class="mr-4" text="SKKUDING" />
      <IconEdit
        class="cursor-pointer" width="30" height="30" color="#7c7a7b"
        @click="
          () => {
            $router.push('/')
          }
        "
      />
    </div>
    <div class="w-7/12 h-0 mt-2 border-solid border-t-[11px] border-green" />
    <div class="w-full h-0 border-solid border-t border-gray-dark" />
    <div class="flex flex-row justify-between items-center h-[30rem] mt-6">
      <div class="flex flex-col justify-between w-[46.5%] h-[28rem]">
        <div>
          <PageSubtitle text="Description" />
          <div class="mt-2">SKKU 개발동아리입니다.</div>
        </div>
        <div>
          <PageSubtitle text="Public / Private" />
          <div class="flex flex-row gap-6 mt-2">
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
      <div class="w-0 h-full border-solid border-x border-gray-dark" />
      <div class="flex flex-col justify-between w-[46.5%] h-[28rem]">
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
          <div class="flex flex-row gap-6 mt-2">
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
    <div class="flex flex-row justify-end w-full mt-10">
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
