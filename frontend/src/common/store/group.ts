import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGroupStore = defineStore('group', () => {
  const id = ref(-1)
  const name = ref('')
  const color = ref<'blue' | 'gray' | 'white'>('white')

  function setGroup(groupId: number) {
    id.value = groupId
    name.value = 'skkuding'
    color.value = 'blue'
  }

  return { id, name, color, setGroup }
})
