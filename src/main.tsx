import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Home, Learn } from './components'
import { createBrowserRouter, RouterProvier, } from 'react-router-dom'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: 'learn',
    element: <Learn />
  }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* <App /> */}
    <RouterProvier router={router} />
  </React.StrictMode>,
)
