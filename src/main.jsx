import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import { NhostProvider } from '@nhost/react'
import nhost from './nhost'
import './index.css'
import client  from './lib/apolloClient'
import { ApolloProvider } from '@apollo/client'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <NhostProvider nhost={nhost}>
      <BrowserRouter>
      <ApolloProvider client={client}>
        <App />
        </ApolloProvider>
      </BrowserRouter>
    </NhostProvider>
  </React.StrictMode>
)
