import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import './App.css';
import { supaClient } from './components/Client/supaClient';
import { Session } from '@supabase/supabase-js';

function App() {
  const [session, setSession] = useState<Session | null>(null);

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