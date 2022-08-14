import { ContestProblem, Problem, ProblemDifficulty } from '@prisma/client'

export const Problems: Problem[] = [
  {
    id: 1,
    created_by_id: 1,
    is_public: true,
    title: 'public problem',
    description: '',
    input_description: '',
    output_description: '',
    hint: '',
    languages: '',
    time_limit: 0,
    memory_limit: 0,
    difficulty: ProblemDifficulty.Level1,
    source: '',
    shared: false,
    submission_num: 1,
    accepted_num: 1,
    score: 0,
    create_time: undefined,
    update_time: undefined
  },
  {
    id: 2,
    created_by_id: 1,
    is_public: false,
    title: 'problem',
    description: '',
    input_description: '',
    output_description: '',
    hint: '',
    languages: '',
    time_limit: 0,
    memory_limit: 0,
    difficulty: ProblemDifficulty.Level2,
    source: '',
    shared: false,
    submission_num: 1,
    accepted_num: 1,
    score: 0,
    create_time: undefined,
    update_time: undefined
  }
]

export const ContestProblems = [
  {
    id: 1,
    display_id: 'A',
    contest_id: 1,
    problem_id: 1,
    score: 0,
    create_time: undefined,
    update_time: undefined
  },
  {
    id: 2,
    display_id: 'B',
    contest_id: 1,
    problem_id: 2,
    score: 0,
    create_time: undefined,
    update_time: undefined
  }
]

export const WorkbookProblems = [
  {
    id: 1,
    display_id: 'A',
    workbook_id: 1,
    problem_id: 1,
    score: 0,
    create_time: undefined,
    update_time: undefined
  },
  {
    id: 2,
    display_id: 'B',
    workbook_id: 1,
    problem_id: 2,
    score: 0,
    create_time: undefined,
    update_time: undefined
  }
]
