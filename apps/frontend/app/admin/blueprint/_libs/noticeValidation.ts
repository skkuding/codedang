import { getNoticePlainText } from './noticeText'
import type {
  BlueprintNoticeDraft,
  BlueprintNoticeOptions
} from './noticeTypes'

export function validateBlueprintNoticeDraft(
  draft: BlueprintNoticeDraft,
  options: BlueprintNoticeOptions,
  original: BlueprintNoticeDraft | null
): Record<string, string> {
  const next: Record<string, string> = {}
  if (!draft.title.trim() || draft.title.length > 35) {
    next.title = 'Enter a title between 1 and 35 characters.'
  }
  const text = getNoticePlainText(draft.content)
  if (!text.trim() || text.length > 400) {
    next.content = 'Enter Main Text between 1 and 400 characters.'
  }
  if (
    new Set(draft.sectionGroupIds).size !== draft.sectionGroupIds.length ||
    draft.sectionGroupIds.some(
      (groupId) =>
        !options.sections.some((section) => section.groupId === groupId)
    ) ||
    (!original && draft.sectionGroupIds.length === 0) ||
    (original &&
      (draft.sectionGroupIds.length !== original.sectionGroupIds.length ||
        draft.sectionGroupIds.some(
          (groupId) => !original.sectionGroupIds.includes(groupId)
        )))
  ) {
    next.sections = original
      ? 'Linked sections cannot change. Reload Notice information.'
      : 'Select at least one available section.'
  }
  if (
    original &&
    draft.title === original.title &&
    draft.content === original.content
  ) {
    next.unchanged = 'No Notice changes to review.'
  }
  return next
}
