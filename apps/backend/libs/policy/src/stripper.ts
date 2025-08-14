/* eslint-disable no-useless-escape */
export const strip = (language: string, src: string): string => {
  switch (language) {
    case 'Python3':
    case 'PyPy3':
      return src
        .replace(/#.*?(?=\\n|$)/g, '')
        .replace(/(\"\"\"[\s\S]*?\"\"\")|(\'\'\'[\s\S]*?\'\'\')/g, '')
        .replace(/(\"(?:\\.|[^"\\])*\"|\'(?:\\.|[^'\\])*\')/g, '')
    case 'Java':
    case 'C':
    case 'Cpp':
      return src
        .replace(/\/\/.*?(?=\\n|$)/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(\"(?:\\.|[^"\\])*\"|\'(?:\\.|[^'\\])*\')/g, '')
    default:
      return src
  }
}
