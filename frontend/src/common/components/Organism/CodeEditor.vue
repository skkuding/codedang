<script setup lang="ts">
/* eslint-disable @typescript-eslint/naming-convention */
import type { Language } from '@/user/problem/types'
import { closeBrackets } from '@codemirror/autocomplete'
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab
} from '@codemirror/commands'
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  indentOnInput,
  type LanguageSupport
} from '@codemirror/language'
import { StreamLanguage } from '@codemirror/language'
import { EditorState, type Transaction } from '@codemirror/state'
import { oneDark } from '@codemirror/theme-one-dark'
import {
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers,
  drawSelection
} from '@codemirror/view'
import { ref, shallowRef, watch, onMounted, toRefs } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    lang?: Language
    lock?: boolean
  }>(),
  { lang: 'Cpp' }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const editor = ref()
const view = shallowRef(new EditorView())

const font = EditorView.theme({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '.cm-scroller': {
    fontFamily: "'JetBrains Mono', monospace"
  }
})

const languageExtensions: Record<Language, () => Promise<LanguageSupport>> = {
  C: () => import('@codemirror/lang-cpp').then((x) => x.cpp()),
  Cpp: () => import('@codemirror/lang-cpp').then((x) => x.cpp()),
  Python3: () => import('@codemirror/lang-python').then((x) => x.python()),
  Java: () => import('@codemirror/lang-java').then((x) => x.java()),
  // Since Go is not supported by CodeMirror, we use the legacy mode.
  // Legacy mode does not have type definition, so we have to use @ts-ignore.
  Golang: () =>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    import('@codemirror/legacy-modes/mode/go').then((x) =>
      StreamLanguage.define(x.go)
    )
}

const { modelValue } = toRefs(props)

watch(
  modelValue,
  (value) => {
    if (view.value.state.doc.toString() === value) {
      return
    }
    view.value.dispatch({
      changes: { from: 0, to: view.value.state.doc.length, insert: value }
    })
  },
  { immediate: true }
)

onMounted(async () => {
  const extensions = [
    keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
    oneDark,
    font,
    // TODO: watch props.lang
    await languageExtensions[props.lang](),
    history(),
    lineNumbers(),
    highlightActiveLine(),
    drawSelection(),
    closeBrackets(),
    syntaxHighlighting(defaultHighlightStyle),
    indentOnInput(),
    EditorState.readOnly.of(props.lock)
  ]

  view.value = new EditorView({
    state: EditorState.create({
      doc: modelValue.value,
      extensions
    }),
    parent: editor.value,
    dispatch: (tr: Transaction) => {
      view.value.update([tr])
      if (tr.changes.empty) return
      const v = view.value.state.doc.toString()
      emit('update:modelValue', v)
    }
  })
})
</script>

<template>
  <div ref="editor" class="w-full" />
</template>
