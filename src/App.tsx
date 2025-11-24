import { useState, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import './App.css';
import { supaClient } from './components/Client/supaClient';
import { Session } from '@supabase/supabase-js';

const LOCAL_SESSION_KEY = 'sb_minimal_session_v1';

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const expiryTimerRef = useRef<number | null>(null);
  const subRef = useRef<any>(null);

  //helper: persist minimal session to avoid storing raw access/refresh tokens
  const persistMinimalSession = (s: Session | null) => {
    if (!s) {
      localStorage.removeItem(LOCAL_SESSION_KEY);
      return;
    }
    const minimal = {
      userId: s.user?.id,
      expieres_at: s.expires_at ?? null,
    };
    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(minimal))
  }

  //clear timer
  const clearTimer = () => {
    if (expiryTimerRef.current != null) {
      window.clearTimeout(expiryTimerRef.current);
      expiryTimerRef.current = null;
    }
  }

  //schedule expiry handler


  useEffect(() => {
    console.log("useEffect is running");

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
    <QueryClientProvider client={queryClient}>
      {/* Your app content */}

    </QueryClientProvider>
  );
}

export default App;