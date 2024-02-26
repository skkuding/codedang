/* eslint-disable @typescript-eslint/naming-convention */
import type { Prisma } from '@prisma/client'

export enum SubmissionOrder {
  idASC = 'id-asc',
  idDESC = 'id-desc',
  resultASC = 'result-asc',
  resultDESC = 'result-desc',
  timeASC = 'time-asc',
  timeDESC = 'time-desc',
  memoryASC = 'memory-asc',
  memoryDESC = 'memory-desc',
  createTimeASC = 'create-time-asc',
  createTimeDESC = 'create-time-desc'
}

export const SubmissionOrderMap: Record<
  SubmissionOrder,
  Prisma.SubmissionOrderByWithRelationAndSearchRelevanceInput[]
> = {
  'id-asc': [{ id: 'asc' }],
  'id-desc': [{ id: 'desc' }],
  'create-time-asc': [{ createTime: 'asc' }, { id: 'asc' }],
  'create-time-desc': [{ createTime: 'desc' }, { id: 'asc' }],
  'result-asc': [{ result: 'asc' }, { id: 'asc' }],
  'result-desc': [{ result: 'desc' }, { id: 'asc' }],
  'memory-asc': [{ maxMemoryUsage: 'asc' }, { id: 'asc' }],
  'memory-desc': [{ maxMemoryUsage: 'desc' }, { id: 'asc' }],
  'time-asc': [{ maxCpuTime: 'asc' }, { id: 'asc' }],
  'time-desc': [{ maxCpuTime: 'desc' }, { id: 'asc' }]
}
