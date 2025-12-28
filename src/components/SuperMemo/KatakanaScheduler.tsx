import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { supermemo, SuperMemoGrade } from 'supermemo';
import { Flashcard, KatakanaCard } from '../Flashcard/Flashcard';
import { FlashcardItem } from '../Flashcard/FlashcardItem';
import { fetchAvailableKatakana, fetchDueKatakana, fetchNewKatakana } from '../Fetching/useKatakanaFetch';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { supaClient } from '../Client/supaClient';
import { useAuth } from '../Client/useAuth';
import { getNumericUserId } from '../Client/userIdHelper';
import { COLOR_PINK, COLOR_BLUE } from '../../constants/colors';
import { initializeSession, markNewCardShown } from '../Client/sessionHelper';

interface UpdatedFlashcard extends FlashcardItem {
  due_date: string;
}

interface StudiedFlashcardData {
  user_id: number;
  front: string;
  back: string;
  interval: number;
  repetition: number;
  efactor: number;
  due_date: string;
  original_deck: string;
  last_studied: string; // Timestamp when card was studied
}

const KatakanaScheduler = (): JSX.Element => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode'); // 'new', 'due', or null (default)
  const [katakanaData, setKatakanaData] = useState<FlashcardItem[]>([]);
  const [practicedFlashcards, setPracticedFlashcards] = useState<UpdatedFlashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [studyMessage, setStudyMessage] = useState<string | undefined>(undefined);
  const { userId, isLoading } = useAuth();

  useEffect(() => {
    // Initialize session tracking
    initializeSession();
    
    if (!userId || isLoading) return;

    const fetchFlashcards = async (): Promise<void> => {
      try {
        console.log("Fetching flashcards for mode:", mode);
        let result;
        
        if (mode === 'new') {
          result = await fetchNewKatakana(userId);
        } else if (mode === 'due') {
          result = await fetchDueKatakana(userId);
        } else {
          // Default behavior: due cards first, then new cards
          result = await fetchAvailableKatakana(userId);
        }
        
        console.log("Available katakana flashcards:", result.cards);
        setKatakanaData(result.cards);
        setStudyMessage(result.message);
        setCurrentCardIndex(0); // Reset to first card
      } catch (err) {
        console.error("Error fetching flashcards:", err);
      }
    };

    void fetchFlashcards();
  }, [userId, isLoading, mode]);

  const practice = async (grade: SuperMemoGrade) => {
    if (!userId) {
      console.error('User not authenticated');
      return;
    }

    const currentFlashcard = katakanaData[currentCardIndex];
    if (!currentFlashcard) return;

    // Mark this card as shown today if it's a new card (no due_date or due_date is today)
    const isNewCard = !currentFlashcard.due_date || dayjs(currentFlashcard.due_date).isSame(dayjs(), 'day');
    if (isNewCard) {
      markNewCardShown('katakana', currentFlashcard.front);
    }

    const updatedFlashcard = practiceFlashcard(currentFlashcard, grade);

    try {
      // Get numeric user ID
      const numericUserId = await getNumericUserId(userId);

      // Only update studied_flashcards table (katakana table columns are generated/read-only)

      // Add or update the flashcard in studiedFlashcard table
      const now = new Date().toISOString();
      const studiedData: StudiedFlashcardData = {
        user_id: numericUserId,
        front: updatedFlashcard.front,
        back: updatedFlashcard.back || '',
        interval: updatedFlashcard.interval,
        repetition: updatedFlashcard.repetition,
        efactor: updatedFlashcard.efactor,
        due_date: updatedFlashcard.due_date,
        original_deck: 'katakana',
        last_studied: now // Update last_studied timestamp
      };

      // Check if record exists first, then update or insert
      const { data: existing } = await supaClient
        .from('studied_flashcards')
        .select('id')
        .eq('user_id', numericUserId)
        .eq('front', updatedFlashcard.front)
        .eq('original_deck', 'katakana')
        .maybeSingle();

      let studiedError;
      if (existing?.id) {
        // Update existing record
        const { error } = await supaClient
          .from('studied_flashcards')
          .update(studiedData)
          .eq('id', existing.id);
        studiedError = error;
      } else {
        // Insert new record
        const { error } = await supaClient
          .from('studied_flashcards')
          .insert(studiedData);
        studiedError = error;
      }

      if (studiedError) {
        console.error('Error updating studied flashcard:', studiedError);
      } else {
        console.log('Flashcard updated successfully in studiedFlashcard table');
      }
    } catch (error) {
      console.error('Error updating flashcard:', error);
    }

    // Trigger exit animation
    setIsExiting(true);

    // Wait for animation to complete
    setTimeout(() => {
      setPracticedFlashcards([...practicedFlashcards, updatedFlashcard]);
      
      const hasMoreCards = currentCardIndex < katakanaData.length - 1;
      
      if (hasMoreCards) {
        setCurrentCardIndex(currentCardIndex + 1);
        setIsFlipped(false);
        setIsExiting(false);
      } else {
        setIsComplete(true);
      }
    }, 400);
  };

  const practiceFlashcard = (flashcard: FlashcardItem, grade: SuperMemoGrade): UpdatedFlashcard => {
    const { interval, repetition, efactor } = supermemo(flashcard, grade);
    const due_date = dayjs().add(interval, 'day').toISOString();
    return {
      ...flashcard,
      interval,
      repetition,
      efactor,
      due_date,
    };
  };

  const currentFlashcard: FlashcardItem | undefined = katakanaData[currentCardIndex];

  /**
   * @TODO this needs to be simplified, because it's a timestamp it has to be either on or after tsz
   * @param due_date 
   * @returns 
   */
  const isFlashcardDue = (due_date: string | undefined): boolean => {
    if (!due_date) {
      return false;
    }
    const currentDate = dayjs();
    const flashcardDueDate = dayjs(due_date);
    return flashcardDueDate.isSame(currentDate, 'day');
  };

  const isDue = currentFlashcard && isFlashcardDue(currentFlashcard.due_date);
  const isNew = currentFlashcard && (!currentFlashcard.due_date || dayjs(currentFlashcard.due_date).isSame(dayjs(), 'day'));

  useEffect(() => {
    setIsFlipped(false);
  }, [currentCardIndex]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = (rating: SuperMemoGrade) => {
    void practice(rating);
  };

  // Determine UI colors and labels based on mode
  const getModeColor = () => {
    if (mode === 'new') return COLOR_PINK;
    if (mode === 'due') return COLOR_BLUE;
    return undefined; // Default
  };

  const getModeLabel = () => {
    if (mode === 'new') return 'New Cards';
    if (mode === 'due') return 'Due Cards';
    return 'Katakana';
  };

  // Show completion message
  if (isComplete || studyMessage) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-6">
            <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Great Work!</h2>
              <p className="text-muted-foreground">
                {studyMessage || "You have finished studying for now! Come back later :)"}
              </p>
            </div>
            <Button className="w-full" size="lg" onClick={() => navigate('/learn')}>
              Back to Decks
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading or no cards
  if (!currentFlashcard) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const hasMoreCards = currentCardIndex < katakanaData.length - 1;
  const hasQueueCard2 = currentCardIndex + 2 < katakanaData.length;

  return (
    <div className="flex-1 bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate('/learn')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Decks
            </Button>
            <div className="text-sm font-medium" style={{ color: getModeColor() || 'inherit' }}>
              {getModeLabel()}: {currentCardIndex + 1} / {katakanaData.length}
            </div>
          </div>

          {/* Card Stack */}
          <div className="relative py-8">
            <div className="relative space-y-[-280px]">
              {/* Queue cards */}
              {hasQueueCard2 && (
                <Flashcard
                  front={<div className="text-6xl">?</div>}
                  position="queue-2"
                />
              )}
              {hasMoreCards && (
                <Flashcard
                  front={<div className="text-6xl">?</div>}
                  position="queue-1"
                />
              )}
              {/* Active card */}
              <Flashcard
                front={<KatakanaCard character={currentFlashcard.front} romaji="" />}
                back={<KatakanaCard character={currentFlashcard.front} romaji={currentFlashcard.back || ''} />}
                isFlipped={isFlipped}
                isDue={isDue}
                isNew={isNew && !isDue}
                position="active"
                isExiting={isExiting}
                onFlip={handleFlip}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            {!isFlipped ? (
              <Button className="w-full" size="lg" onClick={handleFlip}>
                Show Answer
              </Button>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleRate(1)}
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  Again
                </Button>
                <Button variant="outline" onClick={() => handleRate(3)}>
                  Hard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRate(4)}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Good
                </Button>
                <Button onClick={() => handleRate(5)} className="bg-primary hover:bg-primary/90">
                  Easy
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KatakanaScheduler;
