// nhostApolloClient.js
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import nhost from './nhost'

// HTTP link to Nhost GraphQL endpoint
const httpLink = createHttpLink({
  uri: nhost.graphql.getUrl()
})

// Auth link to inject JWT dynamically
const authLink = setContext(() => {
  const token = nhost.auth.getAccessToken()
  return {
    headers: {
      authorization: token ? `Bearer ${token}` : ''
    }
  }
})

// Apollo Client
const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
})

export default apolloClient
