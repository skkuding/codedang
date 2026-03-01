export interface BaekjoonSample {
  id: number
  input: string
  output: string
}

export interface BaekjoonPayload {
  problemId: string
  title: string
  description: string
  inputDesc: string
  outputDesc: string
  samples: BaekjoonSample[]
  timeLimit: string
  memoryLimit: string
  source: string
}

export function parseTimeLimitToMs(raw: string): number {
  if (!raw || typeof raw !== 'string') {
    return 2000
  }
  const trimmed = raw.trim()
  const numMatch = trimmed.match(/[\d.]+/)
  const num = numMatch ? parseFloat(numMatch[0]) : 2
  if (trimmed.includes('초') || trimmed.toLowerCase().includes('s')) {
    return Math.round(num * 1000)
  }
  return Math.round(num)
}

export function parseMemoryLimitToMb(raw: string): number {
  if (!raw || typeof raw !== 'string') {
    return 512
  }
  const numMatch = raw.trim().match(/[\d.]+/)
  return numMatch ? parseInt(numMatch[0], 10) : 512
}

export function convertMathHtml(html: string): string {
  if (!html?.trim()) {
    return html ?? ''
  }
  if (typeof document === 'undefined') {
    return html
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const containers = doc.querySelectorAll('mjx-container')

  containers.forEach((container) => {
    const span = container.querySelector(
      '.no-mathjax.mjx-copytext, [class*="mjx-copytext"]'
    )
    if (!span) {
      return
    }

    let latex = (span.textContent ?? '').trim()
    if (latex.startsWith('$') && latex.endsWith('$')) {
      latex = latex.slice(1, -1).trim()
    }

    const mathEl = doc.createElement('math-component')
    mathEl.setAttribute('content', latex)
    container.replaceWith(mathEl)
  })

  return doc.body.innerHTML
}

export function baekjoonPayloadToFormValues(payload: BaekjoonPayload): Partial<{
  title: string
  description: string
  inputDescription: string
  outputDescription: string
  testcases: Array<{
    input: string
    output: string
    isHidden: boolean
    scoreWeight?: undefined
    scoreWeightNumerator: number
    scoreWeightDenominator: number
  }>
  timeLimit: number
  memoryLimit: number
  source: string
}> {
  const count = Math.max(1, payload.samples?.length ?? 0)
  const testcases =
    payload.samples?.length > 0
      ? payload.samples.map((s) => ({
          input: s.input ?? '',
          output: s.output ?? '',
          isHidden: false,
          scoreWeightNumerator: 1,
          scoreWeightDenominator: count
        }))
      : [
          {
            input: '',
            output: '',
            isHidden: false,
            scoreWeightNumerator: 1,
            scoreWeightDenominator: 1
          }
        ]

  return {
    title: payload.title ?? '',
    description: convertMathHtml(payload.description ?? ''),
    inputDescription: convertMathHtml(payload.inputDesc ?? ''),
    outputDescription: convertMathHtml(payload.outputDesc ?? ''),
    testcases,
    timeLimit: parseTimeLimitToMs(payload.timeLimit),
    memoryLimit: parseMemoryLimitToMb(payload.memoryLimit),
    source: payload.source ?? ''
  }
}

export const BAEKJOON_EXTENSION_MESSAGE_TYPE = 'FROM_BOJ_EXTENSION' as const
