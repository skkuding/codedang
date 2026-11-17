'use client'

import { adminBaseUrl } from '@/libs/constants'
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'
import type { Session } from 'next-auth'
import { useState } from 'react'

interface Props {
  children: React.ReactNode
  session: Session | null
}

export function ClientApolloProvider({ children, session }: Props) {
  const [queryClient] = useState(() => new QueryClient())
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

  return (
    <ApolloProvider client={client}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApolloProvider>
  )
}
