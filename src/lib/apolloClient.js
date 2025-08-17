import { ApolloClient, InMemoryCache, split, HttpLink } from "@apollo/client";
import { WebSocketLink } from "@apollo/client/link/ws";
import { getMainDefinition } from "@apollo/client/utilities";

// HTTP connection for queries & mutations
const httpLink = new HttpLink({
  uri: "https://xmtvtuafswmlbcsjifyu.hasura.ap-south-1.nhost.run/v1/graphql", // your Hasura endpoint
  headers: {
    "x-hasura-admin-secret": "i_s;Y''Af8H8dV9$NBEQAS5n_;luYY3_", // if you set one
  },
});

// WebSocket connection for subscriptions
const wsLink = new WebSocketLink({
  uri: "wss://xmtvtuafswmlbcsjifyu.hasura.ap-south-1.nhost.run/v1/graphql", // note ws:// not http://
  options: {
    reconnect: true,
    connectionParams: {
      headers: {
        "x-hasura-admin-secret": "i_s;Y''Af8H8dV9$NBEQAS5n_;luYY3_", // same headers here
      },
    },
  },
});

// Use split to send subscription operations to wsLink, others to httpLink
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;
