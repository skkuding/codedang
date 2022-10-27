<script setup lang="ts">
import RadioButton from '@/common/components/Molecule/RadioButton.vue'
import SearchBar from '@/common/components/Molecule/SearchBar.vue'
import CardItem from '@/common/components/Molecule/CardItem.vue'
import { ref } from 'vue'

defineProps<{
  id: number
}>()

const texts = ['Latest', 'Ongoing']
const selected = ref()
const setSelected = (index: number) => {
  selected.value = index
}
</script>

<template>
  <div>
    <div class="mb-16 flex justify-end">
      <RadioButton class="mr-8" :texts="texts" @selected="setSelected" />
      <SearchBar placeholder="keywords" />
    </div>
    <div class="flex flex-col items-center gap-4">
      <!--<CardItem
        v-for=""
        class="w-full"
        title="Lorem Ipsum"
        img="https://www.skku.edu/_res/skku/img/skku_s.png"
        description="Lorem Ipsum is simply dummy text"
        additional-text="Status: Ongoing"
        colored-text="Created by skkuding"
        colored-text-short="By skkuding"
      />
      <CardItem
        class="w-full"
        title="Lorem Ipsum"
        img="https://www.skku.edu/_res/skku/img/skku_s.png"
        description="Lorem Ipsum is simply dummy text"
        additional-text="Status: Ongoing"
        colored-text="Created by skkuding"
        colored-text-short="By skkuding"
      />
      !-->
    </div>
  </div>
</template>
