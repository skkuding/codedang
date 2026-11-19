import type {
  BlueprintCreateOptions,
  BlueprintCreateProblem,
  BlueprintCreateSection,
  BlueprintSectionSchedule
} from '../_libs/createTypes'
import type { BlueprintProblemCatalogController } from '../_libs/useBlueprintProblemCatalog'

export function createTestProblemCatalog(
  overrides: Partial<BlueprintProblemCatalogController> = {}
): BlueprintProblemCatalogController {
  return {
    status: 'ready',
    problems: [],
    hasMore: false,
    isLoadingMore: false,
    loadMore: () => {},
    retry: () => {},
    ...overrides
  }
}

export function createTestSection(
  groupId: number,
  overrides: Partial<BlueprintCreateSection> = {}
): BlueprintCreateSection {
  return {
    groupId,
    sectionLabel: `Section ${groupId}`,
    title: 'Test course',
    semester: null,
    memberCount: null,
    ...overrides
  }
}

export function createTestOptions(
  overrides: Partial<BlueprintCreateOptions> = {}
): BlueprintCreateOptions {
  const courseTitle = overrides.courseTitle ?? 'Test course'
  return {
    courseTitle,
    weeks: [1, 2, 3],
    sections: [1, 2, 3].map((groupId) =>
      createTestSection(groupId, { title: courseTitle })
    ),
    ...overrides
  }
}

export function createTestProblems(): BlueprintCreateProblem[] {
  return [
    { id: 11, title: 'Alpha', level: 'Level1', hasSolution: true },
    { id: 12, title: 'Beta', level: 'Level2', hasSolution: false }
  ]
}

export function createTestSchedule(
  groupId = 1,
  overrides: Partial<BlueprintSectionSchedule> = {}
): BlueprintSectionSchedule {
  return {
    groupId,
    startTime: '2026-11-15T09:00',
    dueTime: '',
    endTime: '2026-11-20T23:59',
    ...overrides
  }
}
