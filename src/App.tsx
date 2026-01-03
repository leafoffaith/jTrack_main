import { useState, useEffect, ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { supaClient } from './components/Client/supaClient';
import { Session } from '@supabase/supabase-js';
import { CacheManager } from './lib/cacheManager';
import { getNumericUserId } from './components/Client/userIdHelper';

interface AppProps {
  children?: ReactNode;
}

function App({ children }: AppProps) {
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
        // console.log(session, "session");
        setSession(session);
      })
      .catch((error) => {
        console.log("Error in getSession:", error);
      });

    // Listen for auth state changes and clear cache on logout
    const { data: { subscription } } = supaClient.auth.onAuthStateChange(async (event, session) => {
      setSession(session);

      if (event === 'SIGNED_OUT' && session?.user?.id) {
        try {
          const numericUserId = await getNumericUserId(session.user.id);
          await CacheManager.clearUserCache(numericUserId);
        } catch (error) {
          console.error('Error clearing cache on logout:', error);
        }
      }
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Periodic cache cleanup
  useEffect(() => {
    // Clear expired cache every 5 minutes
    const interval = setInterval(() => {
      CacheManager.clearExpiredCache().catch(error => {
        console.error('Error clearing expired cache:', error);
      });
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
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
      {children}
    </QueryClientProvider>
  );
}

export default App;
