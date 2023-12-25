<script setup lang="ts">
/* eslint-disable @typescript-eslint/naming-convention */
import Button from '@/common/components/Atom/Button.vue'
import InputItem from '@/common/components/Atom/InputItem.vue'
import TextEditor from '@/common/components/Organism/TextEditor.vue'
import { useToast } from '@/common/composables/toast'
import type { Language, Level } from '@/user/problem/types'
import { toTypedSchema } from '@vee-validate/zod'
import { useMutation } from '@vue/apollo-composable'
import { gql } from 'graphql-tag'
import { useFieldArray, useForm, Field } from 'vee-validate'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import IconLeft from '~icons/fa6-solid/angle-left'
import IconTrash from '~icons/fa/trash-o'

const router = useRouter()
const schema = z.object({
  title: z.string().min(1),
  description: z.string(),
  inputDescription: z.string(),
  outputDescription: z.string(),
  hint: z.string().default(''),
  source: z.string().default(''),
  template: z
    .array(
      z.object({
        language: z.enum(['C', 'Cpp', 'Python3', 'Java']),
        code: z.array(
          z.object({
            id: z.number(),
            text: z.string(),
            locked: z.boolean()
          })
        )
      })
    )
    .default([]),
  languages: z
    .array(z.enum(['C', 'Cpp', 'Python3', 'Java']))
    .min(1, 'At least one language is required.')
    .default([]),
  timeLimit: z
    .string()
    .default('2000')
    .transform((v) => parseInt(v)),
  memoryLimit: z
    .string()
    .default('512')
    .transform((v) => parseInt(v)),
  difficulty: z
    .enum(['Level1', 'Level2', 'Level3', 'Level4', 'Level5'])
    .default('Level1'),
  inputExamples: z.array(z.string()).default(['']),
  outputExamples: z.array(z.string()).default(['']),
  testcases: z
    .array(
      z.object({
        input: z.string(),
        output: z.string(),
        scoreWeight: z.number().optional()
      })
    )
    .default([{ input: '', output: '' }]),
  tagIds: z.array(z.number()).default([])
})

const {
  defineInputBinds,
  defineComponentBinds,
  setFieldValue,
  values,
  errors,
  handleSubmit,
  resetForm
} = useForm({
  validationSchema: toTypedSchema(schema)
})

const title = defineComponentBinds('title')
const difficulty = defineInputBinds('difficulty')
const description = defineComponentBinds('description')
const inputDescription = defineInputBinds('inputDescription')
const outputDescription = defineInputBinds('outputDescription')
const timeLimit = defineComponentBinds('timeLimit')
const memoryLimit = defineComponentBinds('memoryLimit')
const hint = defineComponentBinds('hint')

const inputExamples = useFieldArray('inputExamples')
const outputExamples = useFieldArray('outputExamples')
const testcases = useFieldArray('testcases')

const toast = useToast()

const { mutate, onError, onDone } = useMutation(gql`
  mutation CreateProblem($input: CreateProblemInput!) {
    createProblem(input: $input) {
      id
    }
  }
`)

onError(() => {
  toast({
    message: 'Failed to create problem',
    type: 'error'
  })
})

onDone(() => {
  toast({
    message: 'Created problem successfully',
    type: 'success'
  })
  resetForm()
  router.go(-1)
})

const submit = handleSubmit(
  (input) => {
    mutate({ input })
  },
  (error) => {
    const key = Object.keys(error.errors)[0]
    const message = `Invalid ${key}: ` + Object.values(error.errors)[0]
    toast({ message, type: 'error' })
  }
)

const levelLabels: Record<Level, string> = {
  Level1: 'Level 1',
  Level2: 'Level 2',
  Level3: 'Level 3',
  Level4: 'Level 4',
  Level5: 'Level 5'
}

const languageLabels: Record<Language, string> = {
  C: 'C',
  Cpp: 'C++',
  Python3: 'Python3',
  Java: 'Java'
}

const toggleLanguage = (language: Language) => {
  if (values.languages?.includes(language)) {
    setFieldValue(
      'languages',
      values.languages.filter((l) => l !== language)
    )
  } else {
    setFieldValue(
      'languages',
      values.languages ? [...values.languages, language] : [language]
    )
  }
}

const addExample = () => {
  inputExamples.push('')
  outputExamples.push('')
}

const removeExample = (index: number) => {
  inputExamples.remove(index)
  outputExamples.remove(index)
}
</script>

<template>
  <div
    class="text-gray-dark/40 flex w-fit cursor-pointer items-center gap-1 rounded hover:opacity-60"
    @click="$router.go(-1)"
  >
    <IconLeft />
    Back
  </div>
  <form
    class="flex w-[80%] flex-col justify-center gap-8"
    @submit.prevent="submit"
  >
    <h1 class="text-gray-dark mt-2 text-2xl font-semibold">Create Problem</h1>
    <div class="col-span-3">
      <label class="text-lg font-bold">
        Title
        <span class="text-red">*</span>
      </label>
      <InputItem
        v-bind="title"
        class="mt-3 w-full"
        placeholder="Title"
        :error="errors.title"
      />
    </div>
    <div class="flex justify-between gap-5">
      <div class="flex flex-1 flex-col gap-3">
        <label class="text-lg font-bold">
          Difficulty
          <span class="text-red">*</span>
        </label>
        <select
          id="difficulty"
          v-bind="difficulty"
          name="difficulty"
          class="border-gray focus:border-green focus:ring-green w-full rounded border px-3 py-1 outline-none focus:ring-1"
        >
          <option
            v-for="(label, value) in levelLabels"
            :key="value"
            :value="value"
          >
            {{ label }}
          </option>
        </select>
      </div>
      <div class="flex flex-1 flex-col gap-3">
        <label class="text-lg font-bold">
          Language
          <span class="text-red">*</span>
        </label>
        <div class="flex gap-3">
          <button
            v-for="(label, value) in languageLabels"
            :key="value"
            type="button"
            class="rounded px-3 py-1 font-medium"
            :class="
              values.languages?.includes(value)
                ? 'bg-blue hover:bg-blue/90 text-white'
                : 'bg-gray/25 hover:bg-gray/40 text-text/50'
            "
            @click="toggleLanguage(value)"
          >
            {{ label }}
          </button>
        </div>
        <p class="text-red text-xs">{{ errors.languages }}</p>
      </div>
    </div>
    <div>
      <h2 class="mb-3 text-lg font-bold">
        Description
        <span class="text-red">*</span>
      </h2>
      <TextEditor v-bind="description" size="lg" />
    </div>
    <div class="grid grid-cols-2 gap-5">
      <div>
        <label class="mb-3 text-lg font-bold">
          Input Description
          <span class="text-red">*</span>
        </label>
        <textarea
          v-bind="inputDescription"
          class="border-gray focus:border-green focus:ring-green mt-3 h-[120px] w-full resize-none rounded-lg outline-none focus:ring-1"
        />
      </div>
      <div>
        <label class="text-lg font-bold">
          Output Description
          <span class="text-red">*</span>
        </label>
        <textarea
          v-bind="outputDescription"
          class="border-gray focus:border-green focus:ring-green mt-3 h-[120px] w-full resize-none rounded-lg outline-none focus:ring-1"
        />
      </div>
    </div>
    <div class="grid grid-cols-2 gap-5">
      <div>
        <label class="mb-3 text-lg font-bold">
          Time Limit (ms)
          <span class="text-red">*</span>
        </label>
        <InputItem
          v-bind="timeLimit"
          placeholder="Time Limit (ms)"
          class="mt-3 w-full"
          type="number"
        />
      </div>
      <div>
        <label class="mb-3 text-lg font-bold">
          Memory Limit (MB)
          <span class="text-red">*</span>
        </label>
        <InputItem
          v-bind="memoryLimit"
          placeholder="Memory Limit (MB)"
          class="mt-3 w-full"
          type="number"
        />
      </div>
    </div>
    <div>
      <h2 class="mb-3 text-lg font-bold">Hint</h2>
      <TextEditor v-bind="hint" size="lg" />
    </div>
    <div
      v-for="(_, index) in inputExamples.fields.value"
      :key="index"
      class="flex flex-col gap-5"
    >
      <div class="flex justify-between">
        <h2 class="text-lg font-bold">
          Sample {{ index + 1 }}
          <span class="text-red">*</span>
        </h2>
        <Button
          v-if="inputExamples.fields.value.length > 1"
          type="button"
          class="flexitems-center justify-center gap-2"
          @click="removeExample(index)"
        >
          <IconTrash />
          Delete
        </Button>
      </div>
      <div class="rounded-lg bg-slate-50 bg-opacity-50 p-5">
        <div class="grid grid-cols-2 gap-5">
          <div>
            <label class="text-gray-dark mb-3 text-lg font-bold">
              Input Sample
            </label>
            <Field
              as="textarea"
              name="`inputExamples[${index}]`"
              class="border-gray focus:border-green focus:ring-green mt-3 h-[180px] w-full resize-none rounded-lg font-mono outline-none focus:ring-1"
            />
          </div>
          <div>
            <label class="text-gray-dark text-lg font-bold">
              Output Sample
            </label>
            <Field
              as="textarea"
              name="`outputExamples[${index}]`"
              class="border-gray focus:border-green focus:ring-green mt-3 h-[180px] w-full resize-none rounded-lg font-mono outline-none focus:ring-1"
            />
          </div>
        </div>
      </div>
    </div>
    <Button
      type="button"
      class="border-gray text-gray-dark flex h-[45px] items-center justify-center border"
      color="white"
      @click="addExample"
    >
      Add Sample
    </Button>
    <div
      v-for="(_, index) in testcases.fields.value"
      :key="index"
      class="flex flex-col gap-5"
    >
      <div class="flex justify-between">
        <h2 class="text-lg font-bold">
          Testcase {{ index + 1 }}
          <span class="text-red">*</span>
        </h2>
        <Button
          v-if="testcases.fields.value.length > 1"
          type="button"
          class="flex h-[32px] items-center justify-center gap-2"
          @click="testcases.remove(index)"
        >
          <IconTrash />
          Delete
        </Button>
      </div>
      <div class="rounded-lg bg-slate-50 bg-opacity-50 p-5">
        <div class="grid grid-cols-2 gap-5">
          <div>
            <label class="text-gray-dark mb-3 text-lg font-bold">
              Input Testcase
            </label>
            <Field
              as="textarea"
              name="`testcases[${index}].input`"
              class="border-gray focus:border-green focus:ring-green mt-3 h-[180px] w-full resize-none rounded-lg font-mono outline-none focus:ring-1"
            />
          </div>
          <div>
            <label class="text-gray-dark text-lg font-bold">
              Output Testcase
            </label>
            <Field
              as="textarea"
              name="`testcases[${index}].output`"
              class="border-gray focus:border-green focus:ring-green mt-3 h-[180px] w-full resize-none rounded-lg font-mono outline-none focus:ring-1"
            />
          </div>
        </div>
      </div>
    </div>
    <Button
      type="button"
      class="border-gray text-gray-dark flex h-[45px] items-center justify-center border"
      color="white"
      @click="testcases.push({ input: '', output: '' })"
    >
      Add Testcase
    </Button>
    <div class="flex justify-end gap-3 py-5">
      <Button type="button" color="gray-dark">Cancel</Button>
      <Button type="submit">Create</Button>
    </div>
  </form>
</template>

<route lang="yaml">
meta:
  layout: admin
</route>
