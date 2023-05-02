import { ref } from 'vue'

interface DialogOption {
  title: string
  content: string

  /* 동의 버튼에 보여질 문구 */
  yes?: string

  /* 거절 버튼에 보여질 문구 */
  no?: string
}

interface DialogInfo extends DialogOption {
  type: 'confirm' | 'success' | 'error'
}

export const dialogInfo = ref<DialogInfo>()

export const open = ref(false)

export const useDialog = () => {
  return {
    confirm(option: DialogOption) {
      dialogInfo.value = { ...option, type: 'confirm' }
      open.value = true
    },
    success(option: DialogOption) {
      dialogInfo.value = { ...option, type: 'success' }
      open.value = true
    },
    error(option: DialogOption) {
      dialogInfo.value = { ...option, type: 'error' }
      open.value = true
    }
  }
}
