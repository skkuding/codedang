const PYTHON_DOCSTRING = /("""[\s\S]*?""")|('''[\s\S]*?''')/g // Python에서의 docstring(""" """, ''' ''') 제거
const C_BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g // C 계열에서의 Block 주석(/* */) 제거
const STRING = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g // Python에서의 문자열(" ", ' ') 제거

export const strip = (language: string, src: string): string => {
  switch (language) {
    case 'Python3':
    case 'PyPy3':
      return src
        .split('\\n')
        .map((line) => line.split('#')[0]) // # 이후 제거
        .join('\\n')
        .replace(PYTHON_DOCSTRING, '')
        .replace(STRING, '')
    case 'Java':
    case 'C':
    case 'Cpp':
      return src
        .split('\\n')
        .map((line) => line.split('//')[0]) // // 이후 제거
        .join('\\n')
        .replace(C_BLOCK_COMMENT, '')
        .replace(STRING, '')
    default:
      return src
  }
}
