import 'bootstrap/dist/css/bootstrap.css'

import '../styles/globals.css'
import '../styles/App.scss'

import type { AppProps } from 'next/app'

import store from '../utils/store'

import Meta from '../components/Meta'

import { Provider } from 'react-redux'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <div id="root">
      <Meta />
      <Provider store={store}>
        <Component {...pageProps} />
      </Provider>
    </div>
  )
}

export default MyApp
