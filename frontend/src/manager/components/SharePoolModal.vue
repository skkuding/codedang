<script setup lang="ts">
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import CardItem from '@/common/components/Molecule/CardItem.vue'
import Modal from '@/common/components/Molecule/Modal.vue'
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import Button from '@/common/components/Atom/Button.vue'
import IconTrashCan from '~icons/fa6-solid/trash-can'
import { ref } from 'vue'

type GroupInfos = { name: string }[]

const props = defineProps<{
  showModal: boolean
  sharedGroup: GroupInfos
}>()

const emit = defineEmits<{
  (e: 'update:showModal', value: boolean): void
  (e: 'update:sharedGroup', value: GroupInfos): void
}>()

const showCheckSharing = ref<boolean>(false)
const inviteGroup = ref()
const sharedGroupField = [{ key: 'name' }, { key: 'delete' }]
const items = ref(props.sharedGroup)

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
  if (!items.value.find((x) => x.name === inviteGroup.value.name)) {
    items.value.push(inviteGroup.value)
    emit('update:sharedGroup', items.value)
  }
  showCheckSharing.value = false
  inviteGroup.value = undefined
}

const deleteSharedGroup = (name: string) => {
  items.value = items.value.filter((x) => x.name !== name)
  console.log('in modal')
  console.log(items.value)
  emit('update:sharedGroup', items.value)
}
</script>

<template>
  <Modal
    :model-value="showModal"
    class="w-[720px] p-10"
    @update:model-value="$emit('update:showModal', false)"
  >
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
        :items="items"
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
            @click="deleteSharedGroup(row.name)"
          >
            <IconTrashCan />
          </Button>
        </template>
      </PaginationTable>
      <Button
        class="absolute bottom-6 right-6"
        @click="() => $emit('update:showModal', false)"
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
