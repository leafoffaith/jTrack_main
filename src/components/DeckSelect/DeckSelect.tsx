/**
 * @description component for selecting a deck
 * @author Shaurya Dey 220025500 s.dey2@ncl.ac.uk 
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ArrowRight, BookOpen, Grid3x3 } from 'lucide-react';
import { useAuth } from '../Client/useAuth';
import { getDeckCardCounts } from '../Fetching/useCardCounts';
import { COLOR_PINK, COLOR_BLUE } from '../../constants/colors';
import KanaChartModal from '../KanaChart/KanaChartModal';

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
  const navigate = useNavigate();
  const { userId, isLoading: authLoading } = useAuth();
  const [deckMetadata, setDeckMetadata] = useState<Record<string, DeckMetadata>>(deckInfo);
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [chartType, setChartType] = useState<'hiragana' | 'katakana'>('hiragana');

  useEffect(() => {
    if (!userId || authLoading) return;

    const fetchDeckMetadata = async () => {
      for (const deck of deckList) {
        const deckType = deck.title.split(' ')[0].toLowerCase();

        // Use consolidated function to get deck card counts
        const counts = await getDeckCardCounts(userId, deckType);

        setDeckMetadata((prev) => ({
          ...prev,
          [deckType]: {
            ...prev[deckType],
            dueCards: counts.dueCards,
            newCards: counts.newCards
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
          const hasChart = deckType === 'hiragana' || deckType === 'katakana';

          const handleViewChart = () => {
            setChartType(deckType as 'hiragana' | 'katakana');
            setChartModalOpen(true);
          };

          return (
            <Card key={deck.deck_id} className="h-full transition-all shadow-wanikani hover:shadow-wanikani-hover hover:scale-[1.02] group flex flex-col">
              <CardHeader className="space-y-4 flex-1">
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
              <CardContent className="space-y-4 flex flex-col">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{metadata.newCards} new cards</span>
                  <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                </div>
                {hasChart && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewChart}
                    className="w-full gap-2"
                  >
                    <Grid3x3 className="h-4 w-4" />
                    View Chart
                  </Button>
                )}
                <div className="flex gap-2 mt-auto">
                  <Button
                    onClick={() => navigate(`/learn/${deckType}?mode=new`)}
                    disabled={metadata.newCards === 0}
                    className="flex-1 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                    style={{
                      backgroundColor: metadata.newCards > 0 ? COLOR_PINK : 'rgb(156, 163, 175)',
                    }}
                  >
                    Study New
                  </Button>
                  <Button
                    onClick={() => navigate(`/learn/${deckType}?mode=due`)}
                    disabled={metadata.dueCards === 0}
                    className="flex-1 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    size="lg"
                    style={{
                      backgroundColor: metadata.dueCards > 0 ? COLOR_BLUE : 'rgb(156, 163, 175)',
                    }}
                  >
                    Study Due
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Placeholder for future decks */}
      <Card key="placeholder" className="border-dashed">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">More decks coming soon!</p>
          </div>
        </CardContent>
      </Card>

      {/* Kana Chart Modal */}
      <KanaChartModal
        type={chartType}
        open={chartModalOpen}
        onOpenChange={setChartModalOpen}
      />
    </div>
  );
};

export default DeckSelect;