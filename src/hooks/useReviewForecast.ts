import { useEffect, useState } from 'react';
import { supaClient } from '../components/Client/supaClient';
import { getNumericUserId } from '../components/Client/userIdHelper';
import dayjs from 'dayjs';

export interface DayForecast {
  date: string; // ISO date string (YYYY-MM-DD)
  count: number; // Number of reviews due
}

export interface ReviewForecast {
  days: DayForecast[];
  maxCount: number; // For scaling colors
}

/**
 * Fetches review forecast for the next 14 days
 * Aggregates due dates from studied_flashcards across all decks
 */
export function useReviewForecast(userId: string | null) {
  const [forecast, setForecast] = useState<ReviewForecast>({ days: [], maxCount: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setForecast({ days: [], maxCount: 0 });
      setIsLoading(false);
      return;
    }

    const fetchForecast = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const numericUserId = await getNumericUserId(userId);
        if (!numericUserId) {
          throw new Error('Could not get numeric user ID');
        }

        // Calculate date range: today to 13 days from now (14 days total)
        const today = dayjs().startOf('day');
        const endDate = today.add(13, 'day').endOf('day');

        // Fetch all studied flashcards with due dates in the future
        const { data, error: fetchError } = await supaClient
          .from('studied_flashcards')
          .select('due_date')
          .eq('user_id', numericUserId)
          .gte('due_date', today.toISOString())
          .lte('due_date', endDate.toISOString());

        if (fetchError) {
          throw fetchError;
        }

        // Aggregate counts by day
        const countsByDay: Record<string, number> = {};

        // Initialize all 14 days with 0 count
        for (let i = 0; i < 14; i++) {
          const date = today.add(i, 'day').format('YYYY-MM-DD');
          countsByDay[date] = 0;
        }

        // Count reviews per day
        (data || []).forEach((card) => {
          if (card.due_date) {
            const date = dayjs(card.due_date).format('YYYY-MM-DD');
            if (countsByDay[date] !== undefined) {
              countsByDay[date]++;
            }
          }
        });

        // Convert to array and find max count
        const days: DayForecast[] = Object.entries(countsByDay).map(([date, count]) => ({
          date,
          count,
        }));

        const maxCount = Math.max(...days.map(d => d.count), 0);

        setForecast({ days, maxCount });
      } catch (err) {
        console.error('Error fetching review forecast:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setForecast({ days: [], maxCount: 0 });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchForecast();
  }, [userId]);

  return { forecast, isLoading, error };
}
