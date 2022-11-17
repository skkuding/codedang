<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import PageTitle from '@/common/components/Atom/PageTitle.vue'
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import Button from '@/common/components/Atom/Button.vue'
import InputItem from '@/common/components/Atom/InputItem.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import SharePoolModal from '@/manager/components/SharePoolModal.vue'
import IconTrashCan from '~icons/fa6-solid/trash-can'
import IconPaperPlane from '~icons/fa6-solid/paper-plane'
import { ref, watch } from 'vue'
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
    sharedgroup: [{ name: 'skkuding' }, { name: 'dingco' }],
    authority: { share: true, delete: true }
  },
  {
    id: 2,
    name: '문제set2',
    problems: 20,
    createdtime: '2021-12-31 18:20:29',
    createdby: '박민서',
    sharedgroup: [{ name: 'skkuding' }, { name: 'npc' }],
    authority: { share: true, delete: false }
  },
  {
    id: 3,
    name: '문제set3',
    problems: 20,
    createdtime: '2021-12-31 18:20:29',
    createdby: '구성현',
    sharedgroup: [{ name: 'npc' }],
    authority: { share: true, delete: false }
  },
  {
    id: 4,
    name: '문제set4',
    problems: 20,
    createdtime: '2021-12-31 18:20:29',
    createdby: '김학산',
    sharedgroup: [],
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
const rowId = ref()
const sharedGroup = ref()

const sharePool = (id: number) => {
  rowId.value = id
  sharedGroup.value = items.value.find((x) => x.id === id)?.sharedgroup
  showSharingModal.value = true
}

watch(sharedGroup, (newSharedGroup) => {
  items.value = items.value.map((x) => {
    if (x.id === rowId.value) x.sharedgroup = newSharedGroup
    return x
  })
})
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
          class="border-gray mr-2 h-fit rounded border p-1"
        >
          {{ group.name }}
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
        @click="sharePool(row.id)"
      >
        <IconPaperPlane />
      </Button>
    </template>
  </PaginationTable>

  <!-- Create Problem Pool Modal -->
  <Modal v-model="showCreateModal" class="!h-[16rem] !w-[720px] p-10">
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
  <SharePoolModal
    v-if="showSharingModal"
    v-model:show-modal="showSharingModal"
    v-model:shared-group="sharedGroup"
    @update:shared-group="(value) => (sharedGroup = value)"
  />
</template>

<route lang="yaml">
meta:
  layout: admin
  group: skkuding
</route>
