<script setup lang="ts">
import groupImage from '@/common/assets/logo.png'
import Button from '@/common/components/Atom/Button.vue'
import { useQuery } from '@vue/apollo-composable'
import { useDateFormat } from '@vueuse/core'
import gql from 'graphql-tag'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import IconLock from '~icons/bi/lock'
import IconUnlock from '~icons/bi/unlock'
import IconPenToSquare from '~icons/fa6-solid/pen-to-square'
import IconTrashCan from '~icons/fa6-solid/trash-can'

const props = defineProps<{
  groupId: string
}>()

interface Response {
  getGroup: {
    id: string
    groupName: string
    description: string
    memberNum: number
    createTime: string
    updateTime: string
    config: {
      showOnList: boolean
      allowJoinWithURL: boolean
      allowJoinFromSearch: boolean
      requireApprovalBeforeJoin: boolean
    }
  }
}
const router = useRouter()
const group = ref<Response['getGroup']>()
const { onResult, onError } = useQuery<Response>(gql`
  query Group {
    getGroup(groupId: ${props.groupId}) {
      id
      groupName
      description
      config
      createTime
      updateTime
      memberNum
    }
  }
`)
onResult(({ data }) => {
  if (data) {
    group.value = data.getGroup
  }
})
onError(() => {
  router.push('/')
})
const invitationCode = ref('ABCDEF')
const groupMangers = ref(['홍길동', '하설빙', '방미서'])
</script>

<template>
  <!-- TODO: mobile responsive -->
  <main>
    <h1
      class="text-text-title border-green flex w-2/3 items-center border-b-8 pb-4 text-3xl font-extrabold"
    >
      {{ group?.groupName }}
      <IconPenToSquare
        class="ml-6 cursor-pointer text-xl hover:opacity-60 active:opacity-40"
      />
    </h1>
    <hr class="text-gray mt-[-1px] w-full" />
    <article class="flex w-full py-12">
      <div class="border-r-gray flex-1 justify-between border-r">
        <h2 class="text-text-subtitle text-xl font-bold">Description</h2>
        <p>{{ group?.description }}</p>
        <h2 class="text-text-subtitle mt-12 text-xl font-bold">
          Public / Private
        </h2>
        <div class="flex flex-row items-center gap-2">
          <IconUnlock />
          Public
          <IconLock class="ml-4" />
          Private
        </div>
        <h2 class="text-text-subtitle mt-12 text-xl font-bold">
          Total Members
        </h2>
        <p>{{ group?.memberNum }}</p>
        <h2 class="text-text-subtitle mt-12 text-xl font-bold">
          Group Create Time
        </h2>
        <p>
          {{ useDateFormat(group?.createTime, 'YYYY.MM.DD HH:mm:ss').value }}
        </p>
      </div>
      <div class="ml-8 flex-1">
        <h2 class="text-text-subtitle text-xl font-bold">
          Group Image & Color
        </h2>
        <img
          :src="groupImage"
          class="aspect-square h-24 rounded-lg object-contain p-2 shadow-[0_4px_4px_0_rgba(0,0,0,0.25)]"
        />
        <h2 class="text-text-subtitle mt-12 text-xl font-bold">
          Invitation Code
        </h2>
        <p>{{ invitationCode }}</p>
        <h2 class="text-text-subtitle mt-12 text-xl font-bold">
          Group Managers
        </h2>
        <ul>
          <li v-for="name in groupMangers" :key="name">{{ name }}</li>
        </ul>
        <h2 class="text-text-subtitle mt-12 text-xl font-bold">
          Group Update Time
        </h2>
        <p>
          {{ useDateFormat(group?.updateTime, 'YYYY.MM.DD HH:mm:ss').value }}
        </p>
      </div>
    </article>
    <!-- TODO: dialog verifying group deletion -->
    <Button class="ml-auto flex items-center">
      <IconTrashCan class="mr-2" />
      Delete
    </Button>
  </main>
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
