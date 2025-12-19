/**
 * @description component for selecting a deck
 * @author Shaurya Dey 220025500 s.dey2@ncl.ac.uk 
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supaClient } from '../Client/supaClient';
import { useAuth } from '../Client/useAuth';
import { getNumericUserId } from '../Client/userIdHelper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowRight, BookOpen } from 'lucide-react';
import dayjs from 'dayjs';

interface Deck {
  deck_id: number;
  title: string;
}

interface DeckSelectProps {
  deckList: Deck[];
}

interface DeckMetadata {
  dueCards: number;
  newCards: number;
  icon: string;
  description: string;
}

const deckInfo: Record<string, DeckMetadata> = {
  'hiragana': {
    icon: 'あ',
    description: 'Basic Japanese syllabary, perfect for beginners.',
    dueCards: 0,
    newCards: 0
  },
  'katakana': {
    icon: 'カ',
    description: 'Used for foreign words and emphasis.',
    dueCards: 0,
    newCards: 0
  },
  'kanji': {
    icon: '漢',
    description: 'Chinese characters used in Japanese writing.',
    dueCards: 0,
    newCards: 0
  }
};

const DeckSelect: React.FC<DeckSelectProps> = ({ deckList }): JSX.Element => {
  const { userId, isLoading: authLoading } = useAuth();
  const [deckMetadata, setDeckMetadata] = useState<Record<string, DeckMetadata>>(deckInfo);

  useEffect(() => {
    if (!userId || authLoading) return;

    const fetchDeckMetadata = async () => {
      const numericUserId = await getNumericUserId(userId);
      const today = dayjs().toISOString();

      for (const deck of deckList) {
        const deckType = deck.title.split(' ')[0].toLowerCase();
        
        // Fetch due cards count
        const { data: dueCards } = await supaClient
          .from('studied_flashcards')
          .select('id')
          .eq('user_id', numericUserId)
          .eq('original_deck', deckType)
          .lte('due_date', today);

        // Fetch studied cards for this user/deck
        const { data: studiedCards } = await supaClient
          .from('studied_flashcards')
          .select('front')
          .eq('user_id', numericUserId)
          .eq('original_deck', deckType);

        // Fetch total cards in this deck
        let totalCards = 0;
        if (deckType === 'hiragana' || deckType === 'katakana') {
          const { data: allCards } = await supaClient
            .from(deckType)
            .select('id');
          totalCards = allCards?.length || 0;
        } else if (deckType === 'kanji') {
          // For kanji, we need to count from the N3/N4/N5 lists
          // For now, use a rough estimate or query from a kanji table
          totalCards = 100; // Placeholder - adjust based on your actual data
        }

        const studiedCount = studiedCards?.length || 0;
        const newCardsCount = Math.max(0, totalCards - studiedCount);

        setDeckMetadata((prev) => ({
          ...prev,
          [deckType]: {
            ...prev[deckType],
            dueCards: dueCards?.length || 0,
            newCards: newCardsCount
          }
        }));
      }
    };

    fetchDeckMetadata().catch((err) => {
      console.error('Error fetching deck metadata:', err);
    });
  }, [userId, authLoading, deckList]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold">Choose Your Deck</h1>
        <p className="text-lg text-muted-foreground">Select a deck to start your study session</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {deckList.map((deck: Deck) => {
          const deckType = deck.title.split(' ')[0].toLowerCase();
          const metadata = deckMetadata[deckType] || deckInfo[deckType];

          return (
            <Link key={deck.deck_id} to={`/learn/${deckType}`}>
              <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer group">
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <span className="text-3xl">{metadata.icon}</span>
                    </div>
                    {metadata.dueCards > 0 && (
                      <div className="px-2 py-1 rounded-md bg-accent text-accent-foreground text-xs font-semibold">
                        {metadata.dueCards} due
                      </div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{deck.title}</CardTitle>
                    <CardDescription className="mt-2">{metadata.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{metadata.newCards} new cards</span>
                    <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                  <Button className="w-full" size="lg">
                    Study Now
                  </Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Placeholder for future decks */}
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">More decks coming soon!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DeckSelect;