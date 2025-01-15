import { BaseModal } from '@/components/BaseModal'
import {
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter
} from '@/components/shadcn/alert-dialog'

interface ModalProps {
  open: boolean
  handleOpen: () => void
  handleClose: () => void
  confirmAction: () => void
  title?: string
  description?: string
}

/**
 *
 * ConfirmModal component renders a modal dialog with confirm and cancel actions.
 *
 * @param open - Determines if the modal is open.
 * @param handleClose - Function to close the modal.
 * @param confirmAction - Function to execute when the user confirms.
 * @param title - Title of the modal.
 * @param description - Description of the modal.
 *
 * @remarks
 * * AlertDialogFooter section (Button section) is separated using ConfirmModal component for reusability.
 */
export function ConfirmModal({
  open,
  handleClose,
  confirmAction,
  title = '',
  description = ''
}: ModalProps) {
  return (
    <BaseModal
      handleClose={handleClose}
      title={title}
      open={open}
      description={description}
      darkMode={false}
    >
      <AlertDialogFooter>
        <AlertDialogAction
          className="border-none bg-slate-100 text-[#3333334D] hover:bg-slate-200"
          onClick={confirmAction}
        >
          Leave
        </AlertDialogAction>
        <AlertDialogCancel
          className="bg-primary hover:bg-primary-strong border-none text-white"
          onClick={handleClose}
        >
          Stay
        </AlertDialogCancel>
      </AlertDialogFooter>
    </BaseModal>
  )
}
