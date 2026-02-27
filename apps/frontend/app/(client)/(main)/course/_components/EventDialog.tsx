import { Button } from '@/components/shadcn/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/shadcn/dialog'
import { Label } from '@/components/shadcn/label'
import { getTranslate } from '@/tolgee/server'

export async function EventDialog() {
  const t = await getTranslate()
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{t('edit_profile_button')}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('edit_profile_title')}</DialogTitle>
          <DialogDescription>{t('edit_profile_description')}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              {t('name_label')}
            </Label>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              {t('username_label')}
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">{t('save_changes_button')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
