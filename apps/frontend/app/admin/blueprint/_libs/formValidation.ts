import type {
  BlueprintCreateDraft,
  BlueprintCreateOptions
} from './createTypes'
import { validateBlueprintCreateDraft } from './createValidation'
import type { BlueprintProblemCatalogController } from './useBlueprintProblemCatalog'

export function validateBlueprintForm(
  value: BlueprintCreateDraft,
  options: BlueprintCreateOptions,
  isExercise: boolean,
  problemCatalog: BlueprintProblemCatalogController,
  originalDraft: BlueprintCreateDraft | null,
  canChangeProblems: boolean
): Record<string, string> {
  const nextErrors = validateBlueprintCreateDraft(
    value,
    options,
    isExercise,
    problemCatalog.problems
  )
  if (
    originalDraft &&
    !canChangeProblems &&
    (value.problems.length !== originalDraft.problems.length ||
      value.problems.some(
        (problem) =>
          originalDraft.problems.find(
            (original) => original.problemId === problem.problemId
          )?.score !== problem.score
      ))
  ) {
    nextErrors.problems =
      'Problem selection and scores cannot change without permission.'
  }
  if (originalDraft) {
    if (
      value.sections.length !== originalDraft.sections.length ||
      value.sections.some(
        (section) =>
          !originalDraft.sections.some(
            (original) => original.groupId === section.groupId
          )
      )
    ) {
      nextErrors.sections = 'Linked sections cannot change during editing.'
    } else if (originalDraft.sections.length === 0) {
      delete nextErrors.sections
    }
  }
  if (
    value.problems.length > 0 &&
    (problemCatalog.status !== 'ready' || problemCatalog.isLoadingMore)
  ) {
    nextErrors.problems =
      'Reload problem information before saving selected problems.'
  }
  return nextErrors
}
