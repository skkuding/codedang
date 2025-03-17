import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/shadcn/select'
import type { NodeViewProps } from '@tiptap/core'
import { NodeViewContent, NodeViewWrapper } from '@tiptap/react'
import React from 'react'

interface CodeBlockAttributes {
  language: string
}

type CodeBlockComponentProps = NodeViewProps & {
  node: {
    attrs: CodeBlockAttributes
  }
  updateAttributes: (attrs: Partial<CodeBlockAttributes>) => void
  extension: {
    options: {
      lowlight: {
        listLanguages: () => string[]
      }
    }
  }
}

export function CodeBlockComponent({
  node: {
    attrs: { language: defaultLanguage }
  },
  updateAttributes
}: CodeBlockComponentProps) {
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
            <SelectValue placeholder="언어 선택" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            <SelectItem value="auto">auto</SelectItem>
            <SelectItem value="c">C</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
            <SelectItem value="java">Java</SelectItem>
            <SelectItem value="python">Python</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <pre>
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  )
}
