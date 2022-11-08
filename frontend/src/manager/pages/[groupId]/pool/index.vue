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
import { useRouter } from 'vue-router'

const router = useRouter()

const fields = [
  { key: 'id' },
  { key: 'name' },
  { key: 'problems' },
  { key: 'createdtime' },
  { key: 'createdby' },
  { key: 'sharedgroup' },
  { key: 'options' }
]

const items = ref([
  {
    id: 1,
    name: '문제set1',
    problems: 20,
    createdtime: '2021-12-31 18:20:29',
    createdby: '하솔비',
    sharedgroup: ['skkuding', 'npc'],
    authority: { share: true, delete: true }
  },
  {
    id: 2,
    name: '문제set2',
    problems: 20,
    createdtime: '2021-12-31 18:20:29',
    createdby: '박민서',
    sharedgroup: ['skkuding', 'npc'],
    authority: { share: true, delete: false }
  },
  {
    id: 3,
    name: '문제set3',
    problems: 20,
    createdtime: '2021-12-31 18:20:29',
    createdby: '구성현',
    sharedgroup: ['skkuding', 'npc'],
    authority: { share: true, delete: false }
  },
  {
    id: 4,
    name: '문제set4',
    problems: 20,
    createdtime: '2021-12-31 18:20:29',
    createdby: '김학산',
    sharedgroup: ['skkuding', 'npc'],
    authority: { share: true, delete: true }
  }
])

// for create problem pool modal
const showCreateModal = ref(false)
const poolName = ref('')

const createPool = () => {
  if (poolName.value.length === 0) return
  // TODO: get pool id from post api
  const id = 1
  router.push('./pool/' + id)
}

// for share problem pool modal
const showSharingModal = ref<boolean>(false)
const showCheckSharing = ref<boolean>(false)
const inviteGroup = ref()
const sharedGroupField = [{ key: 'name' }, { key: 'delete' }]
const sharedGroup = ref([{ name: 'NPC 중급반' }])

const findGroup = (code: string) => {
  if (code.length === 0) {
    inviteGroup.value = undefined
    return
  }
  inviteGroup.value = {
    name: 'mini SKKUDING',
    description: 'small version of skkuding',
    creator: '홍길동',
    img: 'https://www.skku.edu/_res/skku/img/skku_s.png'
  }
}

const appendSharedGroup = () => {
  if (!sharedGroup.value.find((x) => x.name === inviteGroup.value.name))
    sharedGroup.value.push(inviteGroup.value)
  showCheckSharing.value = false
  inviteGroup.value = undefined
}
</script>

<template>
  <div class="mb-6 flex">
    <PageTitle text="Problem Pool List" />
    <Button class="ml-4" @click="showCreateModal = true">+ Create</Button>
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
        v-if="row.authority.delete"
        class="mr-1 aspect-square rounded-lg"
        outline
        color="gray-dark"
        @click="() => (items = items.filter((x) => x.id !== row.id))"
      >
        <IconTrashCan />
      </Button>
      <Button
        v-if="row.authority.share"
        :class="row.authority.delete ? 'ml-2' : 'ml-12'"
        class="aspect-square rounded-lg"
        outline
        color="gray-dark"
        @click="showSharingModal = true"
      >
        <IconPaperPlane />
      </Button>
    </template>
  </PaginationTable>

  <!-- Create Problem Pool Modal -->
  <Modal v-model="showCreateModal" class="h-[16rem] w-[45rem] p-10">
    <PageSubtitle class="text-center" text="Create Problem Pool" />
    <div class="my-6 flex flex-col gap-y-2 px-6">
      <div class="text-lg font-bold">Problem Pool Name</div>
      <InputItem
        v-model="poolName"
        shadow
        required
        placeholder="Problem Pool Name"
        class="block w-full"
        @keyup.enter="createPool"
      />
    </div>
    <Button class="absolute bottom-6 right-6" @click="createPool">
      Create
    </Button>
  </Modal>

  <!-- Share Problem Pool Modal -->
  <Modal v-model="showSharingModal" class="w-[45rem] p-10">
    <PageSubtitle class="text-center" text="Share Problem Pool" />
    <div class="text-green my-4 text-center text-base">그래프 문제 set</div>
    <div v-if="!showCheckSharing" class="my-6 flex flex-col gap-y-2 px-6">
      <div class="text-lg font-bold">Invitation code of shared group</div>
      <SearchBar
        id="search-group"
        placeholder="Invitation Code"
        class="place-self-end"
        @search="findGroup"
      />
      <CardItem
        v-if="inviteGroup !== undefined"
        :title="inviteGroup.name"
        :img="inviteGroup.img"
        :description="inviteGroup.description"
        :colored-text="inviteGroup.creator"
        @click="showCheckSharing = true"
      />
      <div v-else class="py-10 text-center">No Group Found</div>
      <div class="mt-6 text-lg font-bold">Shared Group</div>
      <PaginationTable
        :fields="sharedGroupField"
        :items="sharedGroup"
        :number-of-pages="1"
        text="No data"
        no-header
        no-search-bar
      >
        <template #delete="{ row }">
          <Button
            outline
            color="gray-dark"
            class="aspect-square rounded-lg"
            @click="
              () =>
                (sharedGroup = sharedGroup.filter((x) => x.name !== row.name))
            "
          >
            <IconTrashCan />
          </Button>
        </template>
      </PaginationTable>
      <Button
        class="absolute bottom-6 right-6"
        @click="showSharingModal = false"
      >
        Save
      </Button>
    </div>
    <div v-else class="my-6 flex flex-col items-center justify-center gap-y-4">
      <div class="my-6">
        Do you really want to share
        <span class="font-bold">{{ inviteGroup.name }}</span>
        ?
      </div>
      <div class="flex gap-x-10">
        <Button class="h-10 w-20" @click="appendSharedGroup">Yes</Button>
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
