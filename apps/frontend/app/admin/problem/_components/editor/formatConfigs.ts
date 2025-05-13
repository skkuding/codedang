import type { Language } from '@generated/graphql'

export type SupportedLanguage = Exclude<Language, 'Golang' | 'Python2'>

export const clangConfig = JSON.stringify({
  BasedOnStyle: 'Chromium',
  IndentWidth: 2
})

export const pythonConfig = {
  indent_width: 2
}

export const extensionMap: Record<Language, string> = {
  C: 'main.c',
  Cpp: 'main.cpp',
  Java: 'Main.java',
  PyPy3: 'main.py',
  Python3: 'main.py',
  Python2: 'main.py',
  Golang: 'main.go'
}
