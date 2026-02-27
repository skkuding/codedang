import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import { getTranslate } from '@/tolgee/server'
import type { NodeViewProps } from '@tiptap/core'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React from 'react'

export async function CodeBlockComponent(props: NodeViewProps) {
  const t = await getTranslate()
  const defaultLanguage = props.node.attrs.language as string
  const updateAttributes = props.updateAttributes as (attrs: {
    language: string
  }) => void

  const languages = ['c', 'cpp', 'java', 'python']

  return (
    <NodeViewWrapper className="relative">
      <div className="absolute right-2 top-2 bg-white text-sm">
        <Select
          defaultValue={
            languages.includes(defaultLanguage) ? defaultLanguage : 'auto'
          }
          onValueChange={(value) => updateAttributes({ language: value })}
        >
          <SelectTrigger className="h-6 w-24">
            <SelectValue placeholder={t('select_language_placeholder')} />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="auto">{t('auto')}</SelectItem>
            <SelectItem value="c">{t('language_c')}</SelectItem>
            <SelectItem value="cpp">{t('language_cpp')}</SelectItem>
            <SelectItem value="java">{t('language_java')}</SelectItem>
            <SelectItem value="python">{t('language_python')}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}
