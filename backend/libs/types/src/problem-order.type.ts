export type ProblemOrder =
  | 'id-asc'
  | 'id-desc'
  | 'title-asc'
  | 'title-desc'
  | 'level-asc'
  | 'level-desc'
  | 'acrate-asc'
  | 'acrate-desc'
  | 'submit-asc'
  | 'submit-desc'

export const ProblemOrderList: ProblemOrder[] = [
  'id-asc',
  'id-desc',
  'title-asc',
  'title-desc',
  'level-asc',
  'level-desc',
  'acrate-asc',
  'acrate-desc',
  'submit-asc',
  'submit-desc'
]
