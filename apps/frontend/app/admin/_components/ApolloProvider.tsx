'use client'

import { adminBaseUrl } from '@/libs/constants'
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'
import type { Session } from 'next-auth'

interface Props {
  children: React.ReactNode
  session: Session | null
}

export function ClientApolloProvider({ children, session }: Props) {
  const httpLink = createUploadLink({
    uri: adminBaseUrl,
    headers: {
      'Apollo-Require-Preflight': 'true'
    }
  })
  const authLink = setContext((_, { headers }) => {
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
    link,
    defaultContext: {
      fetchOptions: {
        next: { revalidate: 0 }
      }
    }
  })

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
