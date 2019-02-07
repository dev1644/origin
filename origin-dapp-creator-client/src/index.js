require('dotenv').config()

import { Route, HashRouter } from 'react-router-dom'
import { Web3Provider } from 'react-web3'
import React from 'react'
import ReactDOM from 'react-dom'
import Styl from 'react-styl'
import * as Sentry from '@sentry/browser'

import './css/app.css'
import App from './pages/App'
import MetaMaskRequirement from './pages/MetaMaskRequirement'

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: 'https://bdd3bd39b52c4aeea53c401b7eb76a71@sentry.io/1377204'
  })
}

class AppWrapper extends React.Component {
  render() {
    return (
      <Web3Provider
        accountUnavailableScreen={MetaMaskRequirement}
        web3UnavailableScreen={MetaMaskRequirement}
      >
        <HashRouter>
          <Route component={App} />
        </HashRouter>
      </Web3Provider>
    )
  }
}

ReactDOM.render(<AppWrapper />, document.getElementById('app'))

Styl.addStylesheet()
