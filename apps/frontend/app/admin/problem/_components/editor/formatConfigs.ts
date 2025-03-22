import type { Language } from '@generated/graphql'

export const clangConfig = JSON.stringify({
  BasedOnStyle: 'Chromium',
  IndentWidth: 2
})

export const pythonConfig = {
  indent_width: 2
}

export const extensionMap: Record<
  Exclude<Language, 'Golang' | 'Python2'>,
  string
> = {
  C: 'main.c',
  Cpp: 'main.cpp',
  Java: 'Main.java',
  Python3: 'main.py'
}
