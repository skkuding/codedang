import { Problem } from '@prisma/client'

export const PUBLIC_PROBLEM_ID = 1
export const BASE_PROBLEM_ID = 2

export const USER_ID = 1
export const GROUP_ID = 2

export const Problems: Problem[] = [
  {
    id: PUBLIC_PROBLEM_ID,
    created_by_id: USER_ID,
    is_public: true,
    title: 'public problem',
    description: '',
    input_description: '',
    output_description: '',
    hint: '',
    languages: '',
    time_limit: 0,
    memory_limit: 0,
    difficulty: '',
    source: '',
    shared: false,
    submission_num: 1,
    accepted_num: 1,
    score: 0,
    // 고정값으로 바꾸기
    create_time: undefined,
    update_time: undefined
  },
  {
    id: BASE_PROBLEM_ID,
    created_by_id: USER_ID,
    is_public: false,
    title: 'problem',
    description: '',
    input_description: '',
    output_description: '',
    hint: '',
    languages: '',
    time_limit: 0,
    memory_limit: 0,
    difficulty: '',
    source: '',
    shared: false,
    submission_num: 1,
    accepted_num: 1,
    score: 0,
    create_time: undefined,
    update_time: undefined
  }
]
