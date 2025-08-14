const PYTHON_COMMENT = /#.*?(?=\\n|$)/g // Python에서의 한 줄 주석(#) 제거
const PYTHON_DOCSTRING = /("""[\s\S]*?""")|('''[\s\S]*?''')/g // Python에서의 docstring(""" """, ''' ''') 제거
const PYTHON_STRING = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g // Python에서의 문자열(" ", ' ') 제거

const C_COMMENT = /\/\/.*?(?=\\n|$)/g // C 계열에서의 한 줄 주석(//) 제거
const C_BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g // C 계열에서의 Block 주석(/* */) 제거
const C_STRING = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g // C 계열에서의 문자열(" ", ' ') 제거

export const strip = (language: string, src: string): string => {
  switch (language) {
    case 'Python3':
    case 'PyPy3':
      return src
        .replace(PYTHON_COMMENT, '')
        .replace(PYTHON_DOCSTRING, '')
        .replace(PYTHON_STRING, '')
    case 'Java':
    case 'C':
    case 'Cpp':
      return src
        .replace(C_COMMENT, '')
        .replace(C_BLOCK_COMMENT, '')
        .replace(C_STRING, '')
    default:
      return src
  }
}
