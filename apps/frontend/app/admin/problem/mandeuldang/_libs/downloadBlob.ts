export function downloadBlob(blob: Blob, fileName: string) {
  const objectUrl = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = objectUrl
  a.download = fileName
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)

  URL.revokeObjectURL(objectUrl)
}
