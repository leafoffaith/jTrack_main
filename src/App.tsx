import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { supaClient } from './components/Client/supaClient';
import { Session } from '@supabase/supabase-js';

function App() {
  const [, setSession] = useState<Session | null>(null);

  //helper: persist minimal session to avoid storing raw access/refresh tokens
  // const _persistMinimalSession = (s: Session | null) => {
  //   if (!s) {
  //     localStorage.removeItem(LOCAL_SESSION_KEY);
  //     return;
  //   }
  //   const minimal = {
  //     userId: s.user?.id,
  //     expieres_at: s.expires_at ?? null,
  //   };
  //   localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(minimal))
  // }

  //clear timer
  // const _clearTimer = () => {
  //   if (expiryTimerRef.current != null) {
  //     window.clearTimeout(expiryTimerRef.current);
  //     expiryTimerRef.current = null;
  //   }
  // }

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