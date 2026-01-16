import React from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';
import { COLOR_PINK, COLOR_BLUE } from '../../constants/colors';

interface FlashcardProps {
  front: React.ReactNode;
  back?: React.ReactNode;
  kanjiBack?: {
    meaning: string[];
    kun_readings: string[];
    on_readings: string[];
    name_readings: string[];
    stroke_count: number;
  };
  isFlipped?: boolean;
  isDue?: boolean;
  isNew?: boolean;
  className?: string;
  position?: "active" | "queue-1" | "queue-2";
  isExiting?: boolean;
  onFlipComplete?: () => void;
  onFlip?: () => void;
}

export function Flashcard({
  front,
  back,
  kanjiBack,
  isFlipped = false,
  isDue = false,
  isNew = false,
  className,
  position = "active",
  isExiting = false,
  onFlipComplete,
  onFlip,
}: FlashcardProps) {
  const isActive = position === "active";

  const handleCardClick = () => {
    if (isActive && !isFlipped && onFlip) {
      onFlip();
    }
  };

  return (
    <div
      className={cn(
        "relative w-full max-w-md mx-auto transition-all duration-300",
        position === "queue-1" && "scale-95 -translate-y-4 opacity-60 pointer-events-none",
        position === "queue-2" && "scale-90 -translate-y-8 opacity-30 pointer-events-none",
        isExiting && "animate-fade-out",
        className,
      )}
      style={{ perspective: "1000px" }}
    >
      <div
        className={cn(
          "relative w-full transition-transform duration-500 ease-in-out cursor-pointer",
          isFlipped && "[transform:rotateY(180deg)]",
        )}
        style={{ transformStyle: "preserve-3d" }}
        onClick={handleCardClick}
        onTransitionEnd={() => {
          if (isFlipped && onFlipComplete) {
            onFlipComplete();
          }
        }}
      >
        {/* Front of card */}
        <Card
          className={cn(
            "relative overflow-hidden shadow-xl min-h-[320px]",
            isActive && "shadow-2xl",
            isFlipped && "invisible",
          )}
          style={{
            backfaceVisibility: "hidden",
          }}
        >
          {/* Due/New Card Label */}
          {isActive && !isFlipped && (isDue || isNew) && (
            <div className="absolute top-0 left-0 right-0 z-10">
              <div 
                className="text-white text-xs font-bold px-3 py-1.5 text-center rounded-t-xl"
                style={{ backgroundColor: isDue ? COLOR_BLUE : COLOR_PINK }}
              >
                {isDue ? "DUE CARD" : "NEW CARD"}
              </div>
            </div>
          )}

          <CardContent
            className={cn("flex items-center justify-center min-h-[320px] p-8", (isDue || isNew) && isActive && "pt-12")}
          >
            <div className="text-center space-y-4 w-full">{front}</div>
          </CardContent>
        </Card>

        {/* Back of card */}
        <Card
          className={cn(
            "absolute inset-0 overflow-hidden shadow-xl min-h-[320px]",
            isActive && "shadow-2xl",
            !isFlipped && "invisible",
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {/* Due/New Card Label */}
          {isActive && isFlipped && (isDue || isNew) && (
            <div className="absolute top-0 left-0 right-0 z-10">
              <div 
                className="text-white text-xs font-bold px-3 py-1.5 text-center rounded-t-xl"
                style={{ backgroundColor: isDue ? COLOR_BLUE : COLOR_PINK }}
              >
                {isDue ? "DUE CARD" : "NEW CARD"}
              </div>
            </div>
          )}

          <CardContent
            className={cn("flex items-center justify-center min-h-[320px] p-8", (isDue || isNew) && isActive && "pt-12")}
          >
            <div className="text-center space-y-4 w-full">
              {kanjiBack ? (
                <KanjiCard
                  kanji={front as string}
                  meaning={kanjiBack.meaning.join(', ')}
                  onReading={kanjiBack.on_readings.join(', ')}
                  kunReading={kanjiBack.kun_readings.join(', ')}
                />
              ) : (
                back
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Specialized card content components
export function HiraganaCard({ character, romaji }: { character: string; romaji: string }) {
  return (
    <>
      <div className="text-8xl font-bold">{character}</div>
      {romaji && <div className="text-2xl text-muted-foreground">{romaji}</div>}
    </>
  );
}

export function KatakanaCard({ character, romaji }: { character: string; romaji: string }) {
  return (
    <>
      <div className="text-8xl font-bold">{character}</div>
      {romaji && <div className="text-2xl text-muted-foreground">{romaji}</div>}
    </>
  );
}

export function KanjiCard({
  kanji,
  meaning,
  onReading,
  kunReading,
  examples,
  strokeCount,
}: {
  kanji: string;
  meaning: string;
  onReading?: string;
  kunReading?: string;
  examples?: string[];
  strokeCount?: number;
}) {
  const [svgData, setSvgData] = React.useState<string | null>(null);
  const [loadingSvg, setLoadingSvg] = React.useState(false);
  const [exampleSentences, setExampleSentences] = React.useState<string[]>([]);

  // Fetch stroke order SVG from kanjiapi.dev
  React.useEffect(() => {
    const fetchSvg = async () => {
      try {
        setLoadingSvg(true);
        const response = await fetch(`https://kanjiapi.dev/v1/kanji/${encodeURIComponent(kanji)}`);
        const data = await response.json();
        if (data.stroke_svg) {
          setSvgData(data.stroke_svg);
        }
      } catch (error) {
        console.error('Error fetching stroke SVG:', error);
      } finally {
        setLoadingSvg(false);
      }
    };

    if (kanji) {
      void fetchSvg();
    }
  }, [kanji]);

  // Load example sentences from tatoeba.json
  React.useEffect(() => {
    const loadExamples = async () => {
      try {
        // Dynamically import tatoeba.json
        const tatoebaData = await import('../../assets/jmdict/tatoeba.json');
        const sentences = (tatoebaData.default || tatoebaData) as Array<[number, string, number, string]>;

        // Filter sentences containing this kanji (limit to 2)
        // Format: [id, japanese, id2, english]
        const filtered = sentences
          .filter(([, japanese]) => japanese.includes(kanji))
          .slice(0, 2)
          .map(([, japanese, , english]) => `${japanese} — ${english}`);

        setExampleSentences(filtered);
      } catch (error) {
        console.error('Error loading example sentences:', error);
      }
    };

    if (kanji && !examples) {
      void loadExamples();
    }
  }, [kanji, examples]);

  const displayExamples = examples || exampleSentences;

  return (
    <div className="space-y-6 w-full">
      <div className="text-7xl font-bold">{kanji}</div>
      <div className="space-y-4 text-left max-w-sm mx-auto">
        <div>
          <p className="text-sm text-muted-foreground">Meaning</p>
          <p className="text-lg font-semibold">{meaning}</p>
        </div>
        {onReading && (
          <div>
            <p className="text-sm text-muted-foreground">On Reading</p>
            <p className="text-lg">{onReading}</p>
          </div>
        )}
        {kunReading && (
          <div>
            <p className="text-sm text-muted-foreground">Kun Reading</p>
            <p className="text-lg">{kunReading}</p>
          </div>
        )}
        {strokeCount && (
          <div>
            <p className="text-sm text-muted-foreground">Stroke Count</p>
            <p className="text-lg font-semibold">{strokeCount} strokes</p>
          </div>
        )}
        {svgData && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Stroke Order</p>
            <div
              className="bg-gray-50 rounded-lg p-4 flex items-center justify-center"
              dangerouslySetInnerHTML={{ __html: svgData }}
            />
          </div>
        )}
        {loadingSvg && !svgData && (
          <div className="text-xs text-muted-foreground">Loading stroke order...</div>
        )}
        {displayExamples && displayExamples.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground">Examples</p>
            <ul className="text-sm space-y-1">
              {displayExamples.map((ex, i) => (
                <li key={i}>{ex}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export function SentenceCard({
  sentence,
  translation
}: {
  sentence: string;
  translation: string;
}) {
  return (
    <div className="space-y-6 w-full max-w-lg mx-auto">
      <div className="text-3xl font-bold leading-relaxed">{sentence}</div>
      <div className="border-t-2 border-gray-200 pt-4">
        <p className="text-sm text-muted-foreground mb-2">Translation</p>
        <p className="text-xl text-gray-700">{translation}</p>
      </div>
    </div>
  );
}

export default Flashcard;
