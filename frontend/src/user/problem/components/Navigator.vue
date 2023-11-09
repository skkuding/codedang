<script setup lang="ts">
import Button from '@/common/components/Atom/Button.vue'
import ListItem from '@/common/components/Atom/ListItem.vue'
import Spinner from '@/common/components/Atom/Spinner.vue'
import Dialog from '@/common/components/Molecule/Dialog.vue'
import Dropdown from '@/common/components/Molecule/Dropdown.vue'
import { useDialog } from '@/common/composables/dialog'
import { useToast } from '@/common/composables/toast'
import { useIntervalFn } from '@vueuse/core'
import axios from 'axios'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
// import IconRun from '~icons/bi/play'
import IconDown from '~icons/fa6-solid/angle-down'
import IconRefresh from '~icons/fa6-solid/arrow-rotate-right'
import IconCaretDown from '~icons/fa6-solid/caret-down'
import { useProblemStore } from '../store/problem'
import type { Language } from '../types'

interface User {
  username: string
}

interface SubmissionResult {
  id: string
  user: User
  createTime: string
  language: string
  result: string
}

const props = defineProps<{
  id: string
}>()

const store = useProblemStore()

const languageLabels: Record<Language, string> = {
  C: 'C',
  Cpp: 'C++',
  Python3: 'Python',
  Java: 'Java'
}

const languageOptions = computed(() =>
  store.problem.languages.map((x) => ({
    label: languageLabels[x],
    value: x
  }))
)

const navigations = [
  { label: 'Editor', to: { name: 'problem-id' } },
  // { label: 'Standings', to: { name: 'problem-id-standings' } },
  { label: 'Submissions', to: { name: 'problem-id-submissions' } }
]

const route = useRoute()

const activeClass = (name: string) =>
  route.name === name
    ? 'border-white cursor-default'
    : 'border-transparent active:bg-white/40 cursor-pointer' // use transparent border for color transition effect

const dialog = useDialog()
const toast = useToast()

const reset = () => {
  dialog.confirm({
    title: 'Reset',
    content: 'Are you sure to reset your code?'
  })
}

const loading = ref(false)

const submit = async () => {
  loading.value = true
  let submissionId: string

  // Submit code to server
  try {
    const { data } = await axios.post(`/api/problem/${props.id}/submission`, {
      language: store.language,
      // TODO: template lock
      code: [
        {
          id: 1,
          text: store.code,
          locked: false
        }
      ]
    })
    submissionId = data.id
  } catch (error) {
    loading.value = false
    toast({
      message: 'Failed to submit: ' + error,
      type: 'error'
    })
    return
  }
  toast({
    message: 'Submitted!',
    type: 'success'
  })

  // Wait for the result
  const { pause } = useIntervalFn(async () => {
    const { data } = await axios.get<SubmissionResult[]>(
      `/api/problem/${props.id}/submission`
    )
    const result = data.find(({ id }) => id === submissionId)
    if (result && result.result !== 'Judging') {
      loading.value = false
      toast({
        message: 'Result: ' + result.result,
        type: result.result === 'Accepted' ? 'success' : 'error'
      })
      pause()
    }
  }, 500)

  setTimeout(() => {
    loading.value = false
    toast({
      message: 'Timeout',
      type: 'error'
    })
    pause()
  }, 30000)
}
</script>

<template>
  <nav
    class="flex h-14 w-full items-center justify-between gap-x-20 bg-slate-700 px-6"
  >
    <Dialog @yes="store.reset" />
    <!-- TODO: handle yes/no event in composable -->
    <div class="flex h-full shrink-0 items-center justify-start gap-x-4">
      <Dropdown v-if="store.type !== 'problem'" class="mr-3">
        <template #button>
          <div
            class="flex h-9 w-fit select-none items-center gap-x-2 rounded px-2 text-white transition hover:bg-white/20 active:bg-white/40"
          >
            <IconCaretDown class="h-4 w-4" />
            <span>{{ store.problem.title }}</span>
          </div>
        </template>
        <template #items>
          <ListItem>습격자 초라기</ListItem>
          <ListItem>채권관계</ListItem>
        </template>
      </Dropdown>
      <RouterLink
        v-for="{ label, to } in navigations"
        :key="label"
        :to="to"
        class="hidden h-full select-none items-center border-t-2 px-3 text-lg font-semibold text-white transition hover:bg-white/20 min-[530px]:flex"
        :class="activeClass(to.name)"
      >
        {{ label }}
      </RouterLink>
    </div>

    <Transition
      enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="$route.name === 'problem-id'"
        class="hidden justify-end gap-x-4 min-[950px]:flex"
      >
        <Button color="gray-dark" @click="reset">
          <IconRefresh />
        </Button>
        <!-- <Button color="green" class="h-9">
          <div class="item-center flex">
            <IconRun class="h-6 w-6" />
            <span class="px-1">Run</span>
          </div>
        </Button> -->
        <Button
          color="blue"
          class="w-20"
          :disabled="loading"
          :pressed="loading"
          @click="submit"
        >
          <span v-if="loading" class="loader h-5 w-5">
            <Spinner color="white" size="sm" />
          </span>
          <span v-else>Submit</span>
        </Button>
        <Dropdown color="slate">
          <template #button>
            <div
              class="flex h-9 w-fit items-center gap-x-2 rounded-md bg-slate-500 px-3 text-white hover:bg-slate-500/80 active:bg-slate-500/60"
            >
              <span v-if="store.language" class="font-semibold">
                {{ languageLabels[store.language] }}
              </span>
              <IconDown class="h-4 w-4" />
            </div>
          </template>
          <template #items>
            <ListItem
              v-for="{ label, value } in languageOptions"
              :key="value"
              color="slate"
              @click="store.language = value"
            >
              {{ label }}
            </ListItem>
          </template>
        </Dropdown>
      </div>
    </Transition>
  </nav>
</template>
