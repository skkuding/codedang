import { UnprocessableDataException } from '@libs/exception'

/**
 * A linked copy of a blueprint notice cannot edit its shared content (title, content) directly.
 * To edit it in the section, unlink it first with unlinkBlueprintNotice.
 */
export const assertCourseNoticeUnlinked = (notice: {
  blueprintNoticeId?: number | null
}) => {
  if (notice.blueprintNoticeId != null) {
    throw new UnprocessableDataException(
      'Confirm unlinkBlueprintNotice before editing this linked notice'
    )
  }
}
