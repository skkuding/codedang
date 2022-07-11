<script setup lang="ts">
import MyComponent from '../components/MyComponent.vue'
import Button from '@/common/components/Atom/Button.vue'
import SearchBar from '@/common/components/Atom/SearchBar.vue'
import Search from '~icons/carbon/search'

function log(data: any) {
  console.log(data)
}
</script>

<template>
  <div>This is Main page</div>
  <MyComponent msg="Main!" />
  <Button color="gray-dark" rounded>
    <Search class="inline" />
    Button
  </Button>
  <Button color="white">
    Yo
    <Search />
  </Button>
  <SearchBar
    content="keywords"
    @search="
      (data) => {
        log(data)
      }
    "
  ></SearchBar>
</template>
