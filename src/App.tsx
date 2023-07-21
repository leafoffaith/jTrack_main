import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Home from './components/Home/Home'
import Learn from './components/Learn/Learn'
import { QueryClient, QueryClientProvider } from 'react-query'

function App() {


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
          <Route path="/learn" element={<Learn />} />        
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
    </>
  )
}

export default App
