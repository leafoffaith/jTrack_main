import { useState, useEffect, createContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import './App.css';
import Leaderboard from './components/Leaderboard/Leaderboard';
import {
  About,
  Login,
  Profile,
  Home,
  Kanji,
  KanjiScheduler,
  Learn,
  SentenceScheduler,
  Sentences
} from './components';
import { supaClient } from './components/Client/supaClient';
import HiraganaScheduler from './components/SuperMemo/HiraganaScheduler';
import KatakanaScheduler from './components/SuperMemo/KatakanaScheduler';
import { Achievements } from './components/Achievements/Achievements';

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    console.log("useEffect is running"); // Check if useEffect is called

    console.log("supaClient:", supaClient);

    supaClient.auth.getSession()
      .then(({ data: { session } }) => {
        console.log("getSession is running");
        console.log(session, "session");
        setSession(session);
      })
      .catch((error) => {
        console.log("Error in getSession:", error);
      });

    supaClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Cleanup listener
    // return () => {
    //   supaClient.auth.onAuthStateChange((_, session) => {
    //     setSession(session);
    //   }).unsubscribe();
    // };
  }, []);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 10,
        cacheTime: 1000 * 60 * 10,
      },
    },
  });

  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {/* {console.log(session)} */}
        <Routes>
          {/* <Route path="/login" element={<Login />} /> */}
          {/* <Route path="/logout" element={<Login />} /> */}
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/learn/kanji" element={<Kanji />} />
          <Route path="/learn/kanji/:title" element={<KanjiScheduler />} />
          <Route path="/learn/sentences" element={<Sentences />} />
          <Route path="/learn/sentences/:title" element={<SentenceScheduler />} />
          <Route path="/learn/hiragana" element={<HiraganaScheduler />} />
          <Route path="/learn/katakana" element={<KatakanaScheduler />} />
          <Route path="/profile" element={<Profile session={session} />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/about" element={<About />} />
          <Route path="/awards" element={<Achievements />} />
        </Routes>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;