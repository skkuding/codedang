import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common'
import { UseDisableAdminGuard } from '@libs/auth'
import { MandeuldangRolesGuard } from './mandeuldang-roles.guard'
import {
  MANDEULDANG_ROLES_KEY,
  type MandeuldangRolesOptions
} from './mandeuldang-roles.metadata'

export const UseMandeuldangRoles = (options: MandeuldangRolesOptions) => {
  return applyDecorators(
    UseDisableAdminGuard(),
    SetMetadata(MANDEULDANG_ROLES_KEY, options),
    UseGuards(MandeuldangRolesGuard)
  )
}
