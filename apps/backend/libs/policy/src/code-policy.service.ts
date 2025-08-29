import { Injectable } from '@nestjs/common'
import type { Language } from '@prisma/client'
import { UnprocessableDataException } from '@libs/exception'
import type { Snippet } from '@client/submission/class/create-submission.dto'
import { POLICY_RULES, type Lang } from './rules'
import { strip } from './stripper'

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

@Injectable()
export class CodePolicyService {
  validate(language: Language, snippets: Snippet[]): void {
    const lang = language as Lang
    const rule = POLICY_RULES[lang]
    if (!rule) return

    const text = snippets.map((s) => s.text ?? '').join('\n')
    const src = strip(language, text)
    let isViolated = false

    // import 검사
    if (lang === 'Python3' || lang === 'PyPy3') {
      for (const mod of rule.bannedImports ?? []) {
        const r = new RegExp(`\\b(?:import|from)\\s+${esc(mod)}\\b`)
        if (r.test(src)) isViolated = true
      }
    } else if (lang === 'Java') {
      for (const pkg of rule.bannedImports ?? []) {
        const r = new RegExp(`\\bimport\\s+${esc(pkg)}[\\.;]`)
        if (r.test(src)) isViolated = true
      }
    } else {
      for (const hdr of rule.bannedImports ?? []) {
        const r = new RegExp(`#\\s*include\\s*<${esc(hdr)}>`)
        if (r.test(src)) isViolated = true
      }
    }

    // 토큰 검사
    for (const token of rule.bannedTokens ?? []) {
      const r = new RegExp(`\\b${esc(token)}\\b`)
      if (r.test(src)) isViolated = true
    }

    if (isViolated) {
      throw new UnprocessableDataException(`Forbidden API usage detected`)
    }
  }
}
