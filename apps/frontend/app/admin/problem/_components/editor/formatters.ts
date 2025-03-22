import type { Language } from '@generated/graphql'
import type * as clangFormat from '@wasm-fmt/clang-format'
import type * as pythonFormat from '@wasm-fmt/ruff_fmt'
import { clangConfig, pythonConfig } from './formatConfigs'

let clangFormatter: typeof clangFormat.format
let pythonFormatter: typeof pythonFormat.format

let clangInitialized = false
let pythonInitialized = false

// TODO: Java Formatter 추가
export async function initAndFormat(
  code: string,
  language: Language,
  filename: string
): Promise<string> {
  if ((language === 'C' || language === 'Cpp') && !clangInitialized) {
    const clang = await import('@wasm-fmt/clang-format')
    await clang.default()
    clangFormatter = clang.format
    clangInitialized = true
  }

  if (language === 'Python3' && !pythonInitialized) {
    const python = await import('@wasm-fmt/ruff_fmt')
    await python.default()
    pythonFormatter = python.format
    pythonInitialized = true
  }

  if (language === 'C' || language === 'Cpp') {
    return clangFormatter(code, filename, clangConfig)
  } else if (language === 'Python3') {
    return pythonFormatter(code, filename, pythonConfig)
  }

  return code
}
