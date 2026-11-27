import { ApolloError } from '@apollo/client'
import { Level } from '@generated/graphql'
import type { GetProblemsQuery } from '@generated/graphql'
import { GraphQLError } from 'graphql'
import { describe, expect, it } from 'vitest'
import { problemRow } from '../_test/problemCatalogFixtures'
import {
  blueprintProblemError,
  blueprintProblemVariables,
  mapBlueprintProblem
} from './problemCatalog'

function problem(
  overrides: Partial<GetProblemsQuery['getProblems'][number]> = {}
): GetProblemsQuery['getProblems'][number] {
  return problemRow(7, {
    title: 'Actual problem title',
    difficulty: Level.Level3,
    solution: [{ code: 'print(1)' }],
    ...overrides
  })
}

describe('Blueprint existing problem API mapping', () => {
  it('keeps the existing Course my/shared filters without adding a search or contest scope', () => {
    expect(blueprintProblemVariables('shared', 7)).toEqual({
      mode: 'shared',
      cursor: 7,
      take: 50,
      input: {
        difficulty: ['Level1', 'Level2', 'Level3', 'Level4', 'Level5'],
        languages: ['C', 'Cpp', 'Java', 'Python3']
      }
    })
  })

  it('maps ID, title, difficulty and nonempty solution code without serializing solution content', () => {
    expect(mapBlueprintProblem(problem())).toEqual({
      id: 7,
      title: 'Actual problem title',
      level: 'Level3',
      hasSolution: true
    })
  })

  it.each(['0', '-1', 'not-an-id', '9007199254740992'])(
    'rejects an invalid problem ID: %s',
    (id) => {
      expect(() => mapBlueprintProblem(problem({ id }))).toThrow('invalid ID')
    }
  )

  it.each([
    ['UNAUTHENTICATED', 'unauthenticated'],
    ['FORBIDDEN', 'forbidden'],
    ['INTERNAL_SERVER_ERROR', 'error']
  ] as const)('classifies GraphQL permission code %s', (code, status) => {
    expect(
      blueprintProblemError(
        new ApolloError({
          graphQLErrors: [
            new GraphQLError('Server response', { extensions: { code } })
          ]
        })
      )
    ).toBe(status)
  })
})
