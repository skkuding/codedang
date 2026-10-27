import { expect } from 'chai'
import { buildSchema, graphqlSync, type GraphQLResolveInfo } from 'graphql'
import { hasSelectedField } from './has-selected-field'

const schema = buildSchema(`
  interface Item { id: ID }
  type Document implements Item { id: ID, content: String, child: Document }
  type Image implements Item { id: ID, url: String }
  union SearchResult = Document | Image
  type Query {
    documents: [Document!]!
    item: Item
    search: SearchResult
  }
`)

describe('hasSelectedField', () => {
  const cases: {
    name: string
    source: string
    fields?: string[]
    variables?: Record<string, unknown>
    expected: boolean
  }[] = [
    {
      name: 'ignores unrequested fields',
      source: '{ documents { id } }',
      expected: false
    },
    {
      name: 'finds a directly selected field',
      source: '{ documents { content } }',
      expected: true
    },
    {
      name: 'uses the schema name for aliases',
      source: '{ documents { text: content } }',
      expected: true
    },
    {
      name: 'does not mistake an alias for a schema name',
      source: '{ documents { content: id } }',
      expected: false
    },
    {
      name: 'finds nested named fragments',
      source:
        '{ documents { ...A } } fragment A on Document { ...B } fragment B on Document { content }',
      expected: true
    },
    {
      name: 'finds inline fragments',
      source: '{ documents { ... on Document { content } } }',
      expected: true
    },
    {
      name: 'honors skip variables',
      source:
        'query($skip: Boolean!) { documents { content @skip(if: $skip) } }',
      variables: { skip: true },
      expected: false
    },
    {
      name: 'honors include variables',
      source:
        'query($include: Boolean!) { documents { content @include(if: $include) } }',
      variables: { include: false },
      expected: false
    },
    {
      name: 'includes enabled conditional fields',
      source: '{ documents { content @include(if: true) @skip(if: false) } }',
      expected: true
    },
    {
      name: 'honors directives on named fragments',
      source:
        '{ documents { id ...A @skip(if: true) } } fragment A on Document { content }',
      expected: false
    },
    {
      name: 'honors directives on inline fragments',
      source:
        '{ documents { id ... on Document @include(if: false) { content } } }',
      expected: false
    },
    {
      name: 'checks later active fragment spreads',
      source:
        '{ documents { ...A @skip(if: true) ...A } } fragment A on Document { content }',
      expected: true
    },
    {
      name: 'merges repeated resolver fields',
      source: '{ documents { id } documents { content } }',
      expected: true
    },
    {
      name: 'checks only immediate children',
      source: '{ documents { child { content } } }',
      expected: false
    },
    {
      name: 'supports any field names',
      source: '{ documents { id } }',
      fields: ['url', 'id'],
      expected: true
    },
    {
      name: 'returns false for an empty list',
      source: '{ documents { content } }',
      fields: [],
      expected: false
    },
    {
      name: 'supports interface return types',
      source: '{ item { ... on Document { content } } }',
      expected: true
    },
    {
      name: 'supports union return types',
      source: '{ search { ... on Document { content } } }',
      expected: true
    }
  ]

  for (const {
    name,
    source,
    fields = ['content'],
    variables,
    expected
  } of cases) {
    it(name, () => {
      const observed: boolean[] = []
      const resolve = (
        _args: unknown,
        _context: unknown,
        info: GraphQLResolveInfo
      ) => {
        observed.push(hasSelectedField(info, fields))
        return info.fieldName === 'documents' ? [] : null
      }
      const result = graphqlSync({
        schema,
        source,
        variableValues: variables,
        rootValue: { documents: resolve, item: resolve, search: resolve }
      })

      expect(result.errors).to.equal(undefined)
      expect(observed).to.deep.equal([expected])
    })
  }
})
