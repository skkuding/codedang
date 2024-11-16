'use client'

import { auth } from '@/libs/auth'
import { adminBaseUrl } from '@/libs/constants'
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import createUploadLink from 'apollo-upload-client/createUploadLink.mjs'

interface Props {
  children: React.ReactNode
}

export default function ClientApolloProvider({ children }: Props) {
  const httpLink = createUploadLink({
    uri: adminBaseUrl,
    headers: {
      'Apollo-Require-Preflight': 'true'
    }
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
    link,
    defaultContext: {
      fetchOptions: {
        next: { revalidate: 0 }
      }
    }
  })

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
