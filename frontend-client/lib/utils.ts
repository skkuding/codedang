import type { DocumentNode } from '@apollo/client'
import { ApolloClient, InMemoryCache, ApolloLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { createHttpLink } from '@apollo/client/link/http'
import { type ClassValue, clsx } from 'clsx'
import ky, { TimeoutError } from 'ky'
import { toast } from 'sonner'
import { twMerge } from 'tailwind-merge'
import { auth } from './auth'
import { adminBaseUrl, baseUrl } from './vars'

export const cn = (...inputs: ClassValue[]) => {
  return twMerge(clsx(inputs))
}

export const fetcher = ky.create({
  prefixUrl: baseUrl,
  throwHttpErrors: false,
  retry: 0,
  timeout: 5000,
  hooks: {
    beforeError: [
      (error) => {
        if (error instanceof TimeoutError) {
          toast.error('Request timed out. Please try again later.')
        }
        return error
      }
    ]
  },
  next: {
    revalidate: 10 // 10 seconds
  }
})

export const fetcherWithAuth = fetcher.extend({
  hooks: {
    beforeRequest: [
      async (request) => {
        // Add access token to request header if user is logged in.
        const session = await auth()
        if (session)
          request.headers.set('Authorization', session.token.accessToken)
      }
    ],
    afterResponse: [
      // Retry option is not working, so we use this workaround.
      async (request, options, response) => {
        if (response.status === 401) {
          const session = await auth()
          if (session) {
            request.headers.set('Authorization', session.token.accessToken)
            fetcher(request, {
              ...options,
              hooks: {} // Remove hooks to prevent infinite loop.
            })
          }
        }
      }
    ]
  }
})

const httpLink = createHttpLink({
  uri: adminBaseUrl
})
const authLink = setContext(async (_, { headers }) => {
  const session = await auth()
  return {
    headers: {
      ...headers,
      authorization: session?.token.accessToken
    }
  }
})
const link = ApolloLink.from([authLink.concat(httpLink)])

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link
})

/**
 * @description
 * Fetch data from GraphQL server.
 *
 * @param query - GraphQL query using gql from @apollo/client
 * @param variables - GraphQL query variables
 *
 * @example
 * const problems = await fetcherGql(GET_PROBLEM, {
 *  groupId: 1,
 *  contestId: 1
 * }).then((data) => data.getContestProblems as ContestProblem[])
 */

export const fetcherGql = async (
  query: DocumentNode,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables?: Record<string, any>
) => {
  const { data } = await client.query({
    query,
    variables,
    context: {
      fetchOptions: {
        next: { revalidate: 0 }
      }
    }
  })
  return data
}
