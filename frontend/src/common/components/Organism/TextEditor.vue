<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import ButtonGroup from '@/common/components/Molecule/ButtonGroup.vue'
import Button from '@/common/components/Atom/Button.vue'
import IconBold from '~icons/fa6-solid/bold'
import IconItalic from '~icons/fa6-solid/italic'
import IconStrikethrough from '~icons/fa6-solid/strikethrough'
import IconCode from '~icons/fa6-solid/code'
import IconTextSlash from '~icons/fa6-solid/text-slash'
// import IconH1 from '~icons/fa6-solid/H1'
// import IconH2 from '~icons/fa6-solid/H2'
import IconParagraph from '~icons/fa6-solid/paragraph'
import IconListUl from '~icons/fa6-solid/list-ul'
import IconList from '~icons/fa6-solid/list'
import IconLaptopCode from '~icons/fa6-solid/laptop-code'
import IconReturn from '~icons/ic/round-keyboard-return'
import IconRoundBlockQuote from '~icons/ic/round-format-quote'
const editor = useEditor({
  content: '<p>I’m running Tiptap with Vue.js. 🎉</p>',
  extensions: [StarterKit]
})
</script>

<template>
  <ButtonGroup class="mr-2">
    <Button
      class="EditorButton"
      :class="{ 'is-active': editor?.isActive('bold') }"
      @click="editor?.chain().focus().toggleBold().run()"
    >
      <IconBold />
    </Button>
    <Button
      class="EditorButton"
      :class="{ 'is-active': editor?.isActive('italic') }"
      @click="editor?.chain().focus().toggleItalic().run()"
    >
      <IconItalic />
    </Button>
    <Button
      :class="{ 'is-active': editor?.isActive('strike') }"
      class="EditorButton"
      @click="editor?.chain().focus().toggleStrike().run()"
    >
      <IconStrikethrough />
    </Button>
    <Button
      class="EditorButton"
      :class="{ 'is-active': editor?.isActive('code') }"
      @click="editor?.chain().focus().toggleCode().run()"
    >
      <IconCode />
    </Button>
    <Button @click="editor?.chain().focus().unsetAllMarks().run()">
      <IconTextSlash />
    </Button>
  </ButtonGroup>
  <ButtonGroup class="mx-2">
    <Button
      class="EditorButton"
      :class="{ 'is-active': editor?.isActive('heading', { level: 3 }) }"
      @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
    >
      <IconH1 />
    </Button>
    <Button
      class="EditorButton"
      :class="{ 'is-active': editor?.isActive('heading', { level: 4 }) }"
      @click="editor?.chain().focus().toggleHeading({ level: 4 }).run()"
    >
      <IconH2 />
    </Button>
    <Button
      class="EditorButton"
      :class="{ 'is-active': editor?.isActive('paragraph') }"
      @click="editor?.chain().focus().setParagraph().run()"
    >
      <IconParagraph />
    </Button>
    <Button
      class="EditorButton"
      :class="{ 'is-active': editor?.isActive('bulletList') }"
      @click="editor?.chain().focus().toggleBulletList().run()"
    >
      <IconListUl />
    </Button>
    <Button
      class="EditorButton"
      :class="{ 'is-active': editor?.isActive('orderedList') }"
      @click="editor?.chain().focus().toggleOrderedList().run()"
    >
      <IconList />
    </Button>
    <Button
      class="EditorButton"
      :class="{ 'is-active': editor?.isActive('codeBlock') }"
      @click="editor?.chain().focus().toggleCodeBlock().run()"
    >
      <IconLaptopCode />
    </Button>
  </ButtonGroup>
  <div class="divider"></div>
  <ButtonGroup class="mx-2">
    <Button @click="editor?.chain().focus().setHardBreak().run()">
      <IconReturn />
    </Button>
    <Button
      class="EditorButton"
      :class="{ 'is-active': editor?.isActive('blockquote') }"
      @click="editor?.chain().focus().toggleBlockquote().run()"
    >
      <IconRoundBlockQuote />
    </Button>
    <Button @click="editor?.chain().focus().setHorizontalRule().run()">
      <icon icon="distribute-vertical"></icon>
    </Button>
  </ButtonGroup>
  <div class="divider"></div>
  <ButtonGroup class="mx-2">
    <Button
      size="sm"
      title="Undo"
      type="Button"
      variant="outline-secondary"
      @click="editor?.chain().focus().undo().run()"
    >
      <icon icon="arrow-counterclockwise"></icon>
    </Button>
    <Button
      size="sm"
      title="Redo"
      type="Button"
      variant="outline-secondary"
      @click="editor?.chain().focus().redo().run()"
    >
      <icon icon="arrow-clockwise"></icon>
    </Button>
  </ButtonGroup>
  <div class="divider"></div>
  <editor-content :editor="editor" />
</template>
