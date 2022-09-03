<script setup lang="ts">
import PageSubtitle from '@/common/components/Atom/PageSubtitle.vue'
import PaginationTable from '@/common/components/Organism/PaginationTable.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import ProgressCard from '@/common/components/Molecule/ProgressCard.vue'
import BoxTitle from '@/common/components/Atom/BoxTitle.vue'
import Switch from '@/common/components/Molecule/Switch.vue'
import Button from '@/common/components/Atom/Button.vue'
import { computed } from 'vue'
import { ref } from 'vue'
import { onUpdated } from 'vue'

defineProps<{
  id: number
}>()
const fields = [
  { key: 'id', label: '#' },
  { key: 'title' },
  { key: 'level' },
  { key: 'submissions' },
  { key: 'rate', label: 'AC Rate' },
  { key: 'tag' }
]

const colorMapper = (level: number) => {
  switch (level) {
    case 1:
      return 'bg-level-1'
    case 2:
      return 'bg-level-2'
    case 3:
      return 'bg-level-3'
    case 4:
      return 'bg-level-4'
    case 5:
      return 'bg-level-5'
    case 6:
      return 'bg-level-6'
    case 7:
      return 'bg-level-7'
    default:
      return 'bg-gray'
  }
}

const problemList = [
  {
    id: 1,
    title: '가파른 경사',
    level: 1,
    submissions: 132,
    rate: '92.14%',
    tag: 'A'
  },
  {
    id: 1006,
    title: '습격자 호루라기',
    level: 2,
    submissions: 561,
    rate: '70%',
    tag: 'B'
  },
  {
    id: 10,
    title: '아싸 홍삼',
    level: 1,
    submissions: 100,
    rate: '90%',
    tag: 'E'
  },
  {
    id: 11,
    title: '에브리바디 홍상',
    level: 2,
    submissions: 100,
    rate: '83%',
    tag: 'C'
  },
  {
    id: 12,
    title: '나는 토깽이',
    level: 3,
    submissions: 100,
    rate: '72%',
    tag: 'D'
  },
  {
    id: 13,
    title: '나는 거부깅',
    level: 4,
    submissions: 100,
    rate: '65%',
    tag: 'F'
  },
  {
    id: 14,
    title: '토깽이 둘',
    level: 5,
    submissions: 100,
    rate: '52%',
    tag: 'G'
  },
  {
    id: 15,
    title: '토깽이 토깽이',
    level: 6,
    submissions: 100,
    rate: '1%',
    tag: 'H'
  },
  {
    id: 16,
    title: '아싸 토깽 에브리바디 토깽',
    level: 7,
    submissions: 100,
    rate: '1%',
    tag: 'I'
  },
  {
    id: 17,
    title: '토깽이 토깽이',
    level: 7,
    submissions: 100,
    rate: '1%',
    tag: 'J'
  }
]
const clickRow = (row: any) => {
  window.location.href = '/problem/' + row.id
}

const clickCard = (index: number) => {
  window.location.href = '/contest/' + (index + 1)
}

const connectSwitchData = (data: any) => {
  isSwitchOn.value = data
}

const isSwitchOn = ref(true)

const cardItems = [
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'gray',
    total: 6,
    complete: 1
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'green',
    total: 6,
    complete: 2
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'red',
    total: 6,
    complete: 3
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'blue',
    total: 6,
    complete: 4
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'blue',
    total: 6,
    complete: 5
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'gray',
    total: 6,
    complete: 1
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'green',
    total: 6,
    complete: 2
  },
  {
    title: 'SKKU 프로그래밍 대회 2021',
    header: '2022.05.07 updated',
    description: 'description',
    color: 'red',
    total: 6,
    complete: 3
  }
]

onUpdated(() => {
  visibleCardItems
})
const bigScreen = ref(4)
const smallScreen = ref(2)

const visibleCardItems = computed(() => {
  {
    if (window.innerWidth < 768) {
      return cardItems.slice(0, smallScreen.value)
    } else {
      return cardItems.slice(0, bigScreen.value)
    }
  }
})

const clickMore = () => {
  {
    if (window.innerWidth < 768) {
      smallScreen.value += 2
    } else {
      bigScreen.value += 4
    }
  }
}
</script>

<template>
  <BoxTitle>
    <template #title>Problem</template>
    <template #subtitle>
      Find problems with problem set and filters, and solve it!
    </template>
  </BoxTitle>
  <div class="overflow-x scroll mx-auto mb-28 w-11/12">
    <PageSubtitle text="All Problem" class="mt-10 mb-7" />
    <PaginationTable
      v-if="isSwitchOn"
      :fields="fields"
      :items="problemList"
      placeholder="keywords"
      :number-of-pages="1"
      @row-clicked="clickRow"
    >
      <template #option>
        <Switch
          label="Tags"
          :model-value="isSwitchOn"
          @update:model-value="connectSwitchData"
        />
      </template>
      <template #level="{ row }">
        <div class="flex items-center gap-2">
          <span class="h-5 w-5 rounded-full" :class="colorMapper(row.level)" />
          Level {{ row.level }}
        </div>
      </template>
    </PaginationTable>
    <PaginationTable
      v-else
      :fields="fields.slice(0, -1)"
      :items="problemList"
      placeholder="keywords"
      :number-of-pages="1"
      @row-clicked="clickRow"
    >
      <template #option>
        <Switch
          label="Tags"
          :model-value="isSwitchOn"
          @update:model-value="connectSwitchData"
        />
      </template>
      <template #level="{ row }">
        <div class="flex items-center gap-2">
          <span class="h-5 w-5 rounded-full" :class="colorMapper(row.level)" />
          Level {{ row.level }}
        </div>
      </template>
    </PaginationTable>

    <PageSubtitle text="Workbook" class="mt-10 mb-7" />

    <div class="flex justify-end">
      <SearchBar class="ml-4" placeholder="keywords" />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2">
      <ProgressCard
        v-for="(item, index) in visibleCardItems"
        :key="index"
        :title="item.title"
        :header="item.header"
        :description="item.description"
        :color="item.color"
        :total="item.total"
        :complete="item.complete"
        class="!w-[95%] cursor-pointer"
        @click="clickCard(index)"
      />
    </div>
    <Button class="text-gray-dark mt-8 w-full" color="white" @click="clickMore">
      More
    </Button>
  </div>
</template>
