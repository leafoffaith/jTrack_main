import { useEffect, useState } from 'react';
import { supaClient } from './supaClient';

/**
 * Custom hook to get the authenticated user ID from Supabase session
 * Returns the user's UUID string or null if not authenticated
 */
export const useAuth = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supaClient.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
        } else {
          setUserId(null);
        }
      } catch (error) {
        console.error('Error fetching user session:', error);
        setUserId(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();

    // Listen for auth state changes
    const { data: { subscription } } = supaClient.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
      } else {
        setUserId(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { userId, isLoading };
};

