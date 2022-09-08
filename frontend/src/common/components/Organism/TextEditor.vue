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
import IconH1 from '~icons/bi/type-h2'
import IconH2 from '~icons/bi/type-h1'
import IconParagraph from '~icons/fa6-solid/paragraph'
import IconListUl from '~icons/fa6-solid/list-ul'
import IconList from '~icons/fa6-solid/list'
import IconCodeSquare from '~icons/bi/code-square'
import IconReturn from '~icons/ic/round-keyboard-return'
import IconRoundBlockQuote from '~icons/ic/round-format-quote'
import IconHr from '~icons/bi/hr'
import IconArrowCounterClockwise from '~icons/bi/arrow-counterclockwise'
import IconArrowClockwise from '~icons/bi/arrow-clockwise'

const editor = useEditor({
  content: '<p>I’m running Tiptap with Vue.js. 🎉</p>',
  extensions: [StarterKit],
  editorProps: {
    attributes: {
      class:
        'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl ring-gray p-5 outline-none ring-1 focus:outline-none focus:ring'
    }
  }
})
</script>

<template>
  <div class="ring-gray w-fit rounded ring-1">
    <ButtonGroup class="mr-4 inline-block">
      <Button
        :pressed="editor?.isActive('bold')"
        color="white"
        @click="editor?.chain().focus().toggleBold().run()"
      >
        <IconBold />
      </Button>
      <Button
        :pressed="editor?.isActive('italic')"
        color="white"
        @click="editor?.chain().focus().toggleItalic().run()"
      >
        <IconItalic />
      </Button>
      <Button
        :pressed="editor?.isActive('strike')"
        color="white"
        @click="editor?.chain().focus().toggleStrike().run()"
      >
        <IconStrikethrough />
      </Button>
      <Button
        :pressed="editor?.isActive('code')"
        color="white"
        @click="editor?.chain().focus().toggleCode().run()"
      >
        <IconCode />
      </Button>
      <Button
        color="white"
        @click="editor?.chain().focus().unsetAllMarks().run()"
      >
        <IconTextSlash />
      </Button>
    </ButtonGroup>
    <ButtonGroup class="mr-4 inline-block">
      <Button
        :pressed="editor?.isActive('heading', { level: 3 })"
        color="white"
        @click="editor?.chain().focus().toggleHeading({ level: 3 }).run()"
      >
        <IconH1 />
      </Button>
      <Button
        :pressed="editor?.isActive('heading', { level: 4 })"
        color="white"
        @click="editor?.chain().focus().toggleHeading({ level: 4 }).run()"
      >
        <IconH2 />
      </Button>
      <Button
        :pressed="editor?.isActive('paragraph')"
        color="white"
        @click="editor?.chain().focus().setParagraph().run()"
      >
        <IconParagraph />
      </Button>
      <Button
        :pressed="editor?.isActive('bulletList')"
        color="white"
        @click="editor?.chain().focus().toggleBulletList().run()"
      >
        <IconListUl />
      </Button>
      <Button
        :pressed="editor?.isActive('orderedList')"
        color="white"
        @click="editor?.chain().focus().toggleOrderedList().run()"
      >
        <IconList />
      </Button>
      <Button
        :pressed="editor?.isActive('codeBlock')"
        color="white"
        @click="editor?.chain().focus().toggleCodeBlock().run()"
      >
        <IconCodeSquare />
      </Button>
    </ButtonGroup>
    <ButtonGroup class="mr-4 inline-block">
      <Button
        color="white"
        @click="editor?.chain().focus().setHardBreak().run()"
      >
        <IconReturn />
      </Button>
      <Button
        :pressed="editor?.isActive('blockquote')"
        color="white"
        @click="editor?.chain().focus().toggleBlockquote().run()"
      >
        <IconRoundBlockQuote />
      </Button>
      <Button
        color="white"
        @click="editor?.chain().focus().setHorizontalRule().run()"
      >
        <IconHr />
      </Button>
    </ButtonGroup>
    <ButtonGroup class="mr-4 inline-block">
      <Button color="white" @click="editor?.chain().focus().undo().run()">
        <IconArrowCounterClockwise />
      </Button>
      <Button color="white" @click="editor?.chain().focus().redo().run()">
        <IconArrowClockwise />
      </Button>
    </ButtonGroup>
    <editor-content :editor="editor" />
  </div>
</template>
