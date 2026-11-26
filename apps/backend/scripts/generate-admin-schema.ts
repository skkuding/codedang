import type { Type } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory
} from '@nestjs/graphql'
import { readFileSync, readdirSync, writeFileSync } from 'fs'
import { lexicographicSortSchema, parse, print, printSchema } from 'graphql'
import { resolve } from 'path'
import { IntScoreScalar } from '../apps/admin/src/problem/scalar/int-score.scalar'

const main = async () => {
  const app = await NestFactory.create(GraphQLSchemaBuilderModule, {
    logger: false
  })
  try {
    const files = readdirSync('apps/admin/src', { recursive: true }) as string[]
    const modules = await Promise.all(
      files
        .filter((file) => file.endsWith('.resolver.ts'))
        .map((file) => import(resolve('apps/admin/src', file)))
    )
    const resolvers = modules.flatMap((module) =>
      Object.entries(module)
        .filter(
          ([name, value]) =>
            name.endsWith('Resolver') && typeof value === 'function'
        )
        .map(([, value]) => value as Type<unknown>)
    )
    const schema = await app
      .get(GraphQLSchemaFactory)
      .create(resolvers, [IntScoreScalar])
    // Preserve unchanged definitions so generating Assignment APIs does not
    // reformat existing APIs or remove the standard generated-file header.
    const previous = readFileSync('schema.gql', 'utf8')
    const definitions = new Map(
      parse(previous).definitions.map((definition) => [
        print(definition),
        definition
      ])
    )
    const generated = parse(printSchema(lexicographicSortSchema(schema)))
    const header =
      '# ------------------------------------------------------\n' +
      '# THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)\n' +
      '# ------------------------------------------------------\n\n'
    writeFileSync(
      'schema.gql',
      header +
        generated.definitions
          .map((definition) => {
            const existing = definitions.get(print(definition))
            return existing?.loc
              ? previous.slice(existing.loc.start, existing.loc.end)
              : print(definition)
          })
          .join('\n\n') +
        '\n'
    )
  } finally {
    await app.close()
  }
}
void main()
