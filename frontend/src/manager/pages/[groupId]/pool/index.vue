<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import Button from '@/common/components/Atom/Button.vue'
import InputItem from '@/common/components/Atom/InputItem.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import CardItem from '@/common/components/Molecule/CardItem.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import IconTrashCan from '~icons/fa6-solid/trash-can'
import IconPaperPlane from '~icons/fa6-solid/paper-plane'
import { ref } from 'vue'

const fields = [
  { key: 'id' },
  { key: 'name' },
  { key: 'problems' },
  { key: 'createdtime' },
  { key: 'createdby' },
  { key: 'sharedgroup' },
  { key: 'options' }
]

const items: { [key: string]: any }[] = [
  {
    id: 1,
    name: '문제set1',
    problems: 20,
    createdtime: '2021-12-31 18:20:29',
    createdby: '하솔비',
    sharedgroup: ['skkuding', 'npc']
  },
  {
    id: 2,
    name: '문제set2',
    problems: 20,
    createdtime: '2021-12-31 18:20:29',
    createdby: '박민서',
    sharedgroup: ['skkuding', 'npc']
  },
  {
    id: 3,
    name: '문제set3',
    problems: 20,
    createdtime: '2021-12-31 18:20:29',
    createdby: '구성현',
    sharedgroup: ['skkuding', 'npc']
  },
  {
    id: 4,
    name: '문제set4',
    problems: 20,
    createdtime: '2021-12-31 18:20:29',
    createdby: '김학산',
    sharedgroup: ['skkuding', 'npc']
  }
]

const addOptions = () => {
  items.forEach((item) => {
    if (item.createdby === '하솔비')
      item['options'] = [IconTrashCan, IconPaperPlane]
    else item['options'] = [IconPaperPlane]
  })
}
addOptions()

// for create problem pool modal
const showCreate = ref(false)
const createName = ref('')

// for share problem pool modal
const showSharing = ref<boolean>(false)
const sharedGroupField = [{ key: 'name' }, { key: 'delete' }]
const sharedGroup = [{ name: 'NPC 중급반' }]

const showCheckSharing = ref<boolean>(false)
</script>

<template>
  <div class="mb-6 flex">
    <PageTitle text="Problem Pool List" />
    <Button class="ml-4" @click="showCreate = true">+ Create</Button>
  </div>

  <PaginationTable
    no-search-bar
    :fields="fields"
    :items="items"
    :number-of-pages="1"
    text="No data"
  >
    <template #sharedgroup="{ row }">
      <div class="flex">
        <div
          v-for="(group, index) in row.sharedgroup"
          :key="index"
          class="border-gray mr-2 rounded border p-2"
        >
          {{ group }}
        </div>
      </div>
    </template>

    <template #options="{ row }">
      <Button
        v-if="row.createdby === '하솔비'"
        class="mr-1 aspect-square rounded-lg"
        outline
        color="gray-dark"
      >
        <IconTrashCan />
      </Button>
      <Button
        :class="row.createdby === '하솔비' ? 'ml-1' : 'ml-4'"
        class="aspect-square rounded-lg"
        outline
        color="gray-dark"
        @click="showSharing = true"
      >
        <IconPaperPlane />
      </Button>
    </template>
  </PaginationTable>

  <!-- Create Problem Pool Modal -->
  <Modal v-model="showCreate" class="h-[16rem] w-[45rem] p-10">
    <PageSubtitle class="text-center" text="Create Problem Pool" />
    <div class="my-6 flex flex-col gap-y-2 px-6">
      <div class="text-lg font-bold">Problem Pool Name</div>
      <InputItem
        v-model="createName"
        shadow
        placeholder="Problem Pool Name"
        class="block w-full"
      />
    </div>
    <Button
      class="absolute bottom-6 right-6"
      @click="() => $router.push('./pool/1')"
    >
      Create
    </Button>
  </Modal>

  <!-- Share Problem Pool Modal -->
  <Modal v-model="showSharing" class="w-[45rem] p-10">
    <PageSubtitle class="text-center" text="Share Problem Pool" />
    <div class="text-green my-4 text-center text-base">그래프 문제 set</div>
    <div v-if="!showCheckSharing" class="my-6 flex flex-col gap-y-2 px-6">
      <div class="text-lg font-bold">Invitation code of shared group</div>
      <SearchBar placeholder="Invitation Code" class="place-self-end" />
      <CardItem
        title="NPC 초급반"
        img="https://www.skku.edu/_res/skku/img/skku_s.png"
        description="NPC 초급반 그룹"
        colored-text="구성현, 송홍빈"
        colored-text-short="구성현, 송홍빈"
        @click="showCheckSharing = true"
      />
      <div class="mt-6 text-lg font-bold">Shared Group</div>
      <PaginationTable
        :fields="sharedGroupField"
        :items="sharedGroup"
        :number-of-pages="1"
        text="No data"
        no-header
        no-search-bar
      >
        <template #delete>
          <Button outline color="gray-dark" class="aspect-square rounded-lg">
            <IconTrashCan />
          </Button>
        </template>
      </PaginationTable>
      <Button class="absolute bottom-6 right-6" @click="showSharing = false">
        Save
      </Button>
    </div>
    <div v-else class="my-6 flex flex-col items-center justify-center gap-y-4">
      <div class="my-6">
        Do you really want to share
        <span class="font-bold">'NPC 중급반'</span>
        ?
      </div>
      <div class="flex gap-x-10">
        <Button class="h-10 w-20">Yes</Button>
        <Button class="h-10 w-20" @click="showCheckSharing = false">No</Button>
      </div>
    </div>
  </Modal>
</template>

<route lang="yaml">
meta:
  layout: admin
  group: skkuding
</route>
