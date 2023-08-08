import { useState, useEffect } from 'react'
import { useNavigate, BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'

import './App.css'
//to be replaced by Index 
import Home from './components/Home/Home'
import { AuthHandler } from './components/Home/AuthHandler'
import Login from './components/Login/Login'
import Profile from './components/Profile/Profile'
import Leaderboard from './components/Leaderboard/Leaderboard'
import { Kanji, Learn, Scheduler } from './components'
import { supaClient } from './components/Client/supaClient'


function App() {

  const [session, setSession] = useState(null)

  useEffect(() => {
    supaClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    }).then(() => {
      console.log(session);
      }).catch((error) => {
          console.log(error);
      })

    supaClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    })
  }, [])
    //limit useEffect in React <= secret to good react code
    const queryClient = new QueryClient({
      defaultOptions: {
      queries: {
      // how long do you want to cache something?
      // for 10mins you would need to 1000 * 60 * 10
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  },
});

  return (
    <>
      <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={session ? <Learn /> : <Login />} />
          <Route path="/learn/kanji" element={session ? <Kanji /> : <Login />} />
          <Route path="/learn/kanji/:title" element={session? <Scheduler /> : <Login />} />
          <Route path="/login" element={session ? <Home /> : <Login />} />
          <Route path="/profile" element={session ? <Profile session={session} /> : <Login />} />
          <Route path="/leaderboard" element={session ? <Leaderboard /> : <Login />} />
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
    </>
  )
}

export default App
