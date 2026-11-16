'use client'

import { adminBaseUrl } from '@/libs/constants'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'
import type { Session } from 'next-auth'
import { useSession } from 'next-auth/react'
import { useRef, useState } from 'react'

interface Props {
  children: React.ReactNode
  session: Session | null
}

export function ClientApolloProvider({ children, session }: Props) {
  const { data: current, status } = useSession()
  const active = status === 'loading' ? (current ?? session) : current
  return (
    <AccountProviders
      key={`${active?.user.username ?? ''}:${active?.user.role ?? ''}`}
      session={active}
    >
      {children}
    </AccountProviders>
  )
}

function AccountProviders({ children, session }: Props) {
  const accessToken = useRef(session?.token.accessToken)
  accessToken.current = session?.token.accessToken
  const [queryClient] = useState(() => new QueryClient())
  const [client] = useState(() => {
    const httpLink = createUploadLink({
      uri: adminBaseUrl,
      headers: { 'Apollo-Require-Preflight': 'true' }
    })
    const authLink = setContext((_, { headers }) => ({
      headers: {
        ...headers,
        authorization: accessToken.current
      }
    }))
    return new ApolloClient({
      cache: new InMemoryCache(),
      link: authLink.concat(httpLink),
      defaultContext: { fetchOptions: { next: { revalidate: 0 } } }
    })
  })

  return (
    <ApolloProvider client={client}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ApolloProvider>
  )
}
