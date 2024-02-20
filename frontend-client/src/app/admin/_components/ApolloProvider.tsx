'use client'

import { auth } from '@/lib/auth'
import { adminBaseUrl } from '@/lib/vars'
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  InMemoryCache,
  createHttpLink
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

interface Props {
  children: React.ReactNode
}

export default function ClientApolloProvider({ children }: Props) {
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
    link,
    defaultContext: {
      fetchOptions: {
        next: { revalidate: 0 }
      }
    }
  })

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
