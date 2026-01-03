import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { Home, Learn, Login } from './components'
import HiraganaScheduler from './components/SuperMemo/HiraganaScheduler.tsx'
import KatakanaScheduler from './components/SuperMemo/KatakanaScheduler.tsx'
import KanjiScheduler from './components/SuperMemo/KanjiScheduler.tsx'
import SentenceScheduler from './components/SuperMemo/SentenceScheduler.tsx'
import Profile from './components/Profile/Profile.tsx'
import KanaChart from './components/KanaChart/KanaChart.tsx'
import { createBrowserRouter, RouterProvider, } from 'react-router-dom'
import './styles/globals.css'

const router = createBrowserRouter([
  {
    id: 'home',
    path: '/',
    element: <Home />,
    errorElement: <div>Not Found</div>,
    children: [
      {
        path: '/learn/*',
        element: <Learn />,
        errorElement: <div>Not Found</div>,
      },
      {
        path: '/learn/hiragana',
        element: <HiraganaScheduler />,
        errorElement: <div>Not Found</div>,
      },
      {
        path: '/learn/hiragana/chart',
        element: <KanaChart type="hiragana" />,
        errorElement: <div>Not Found</div>,
      },
      {
        path: '/learn/katakana',
        element: <KatakanaScheduler />,
        errorElement: <div>Not Found</div>,
      },
      {
        path: '/learn/katakana/chart',
        element: <KanaChart type="katakana" />,
        errorElement: <div>Not Found</div>,
      },
      {
        path: '/learn/kanji',
        element: <KanjiScheduler />,
        errorElement: <div>Not Found</div>,
      },
      {
        path: '/learn/sentence',
        element: <SentenceScheduler />,
        errorElement: <div>Not Found</div>,
      },
      {
        path: '/profile',
        element: <Profile />,
        errorElement: <div>Not Found</div>,
      },
    ]
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <div>Not Found</div>,
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <RouterProvider router={router} />
  </React.StrictMode>,
)
