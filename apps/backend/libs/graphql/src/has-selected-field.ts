import type { GraphQLResolveInfo } from 'graphql'
import { parseResolveInfo, type ResolveTree } from 'graphql-parse-resolve-info'

/**
 * Whether any named immediate child field is selected for this resolver.
 * Uses schema field names, including aliases, fragments and conditional directives.
 * For abstract return types, checks selections across all possible types.
 * Conservatively returns true if the selection cannot be parsed.
 */
export const hasSelectedField = (
  info: GraphQLResolveInfo,
  fieldNames: readonly string[]
): boolean => {
  if (fieldNames.length === 0) return false

  // With keepRoot disabled (the default), the parser returns a single tree.
  const parsed = parseResolveInfo(info) as ResolveTree | null | undefined
  if (!parsed) return true

  return Object.values(parsed.fieldsByTypeName).some((fields) =>
    Object.values(fields).some(({ name }) => fieldNames.includes(name))
  )
}
