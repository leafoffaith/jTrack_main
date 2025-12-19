"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface FlashcardProps {
  front: React.ReactNode
  back?: React.ReactNode
  isFlipped?: boolean
  isDue?: boolean
  className?: string
  position?: "active" | "queue-1" | "queue-2"
  isExiting?: boolean
  onFlipComplete?: () => void
}

export function Flashcard({
  front,
  back,
  isFlipped = false,
  isDue = false,
  className,
  position = "active",
  isExiting = false,
  onFlipComplete,
}: FlashcardProps) {
  const isActive = position === "active"

  return (
    <div
      className={cn(
        "relative w-full max-w-md mx-auto transition-all duration-300",
        position === "queue-1" && "scale-95 -translate-y-4 opacity-60",
        position === "queue-2" && "scale-90 -translate-y-8 opacity-30",
        isExiting && "animate-fade-out",
        className,
      )}
      style={{ perspective: "1000px" }}
    >
      <div
        className={cn(
          "relative w-full transition-transform duration-500 ease-in-out",
          isFlipped && "[transform:rotateY(180deg)]",
        )}
        style={{ transformStyle: "preserve-3d" }}
        onTransitionEnd={() => {
          if (isFlipped && onFlipComplete) {
            onFlipComplete()
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
          {/* Due Card Label */}
          {isDue && isActive && !isFlipped && (
            <div className="absolute top-0 left-0 right-0 z-10">
              <div className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1.5 text-center rounded-t-xl">
                DUE CARD
              </div>
            </div>
          )}

          <CardContent
            className={cn("flex items-center justify-center min-h-[320px] p-8", isDue && isActive && "pt-12")}
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
          {/* Due Card Label */}
          {isDue && isActive && isFlipped && (
            <div className="absolute top-0 left-0 right-0 z-10">
              <div className="bg-accent text-accent-foreground text-xs font-bold px-3 py-1.5 text-center rounded-t-xl">
                DUE CARD
              </div>
            </div>
          )}

          <CardContent
            className={cn("flex items-center justify-center min-h-[320px] p-8", isDue && isActive && "pt-12")}
          >
            <div className="text-center space-y-4 w-full">{back}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Specialized card content components
export function HiraganaCard({ character, romaji }: { character: string; romaji: string }) {
  return (
    <>
      <div className="text-8xl font-bold">{character}</div>
      <div className="text-2xl text-muted-foreground">{romaji}</div>
    </>
  )
}

export function KatakanaCard({ character, romaji }: { character: string; romaji: string }) {
  return (
    <>
      <div className="text-8xl font-bold">{character}</div>
      <div className="text-2xl text-muted-foreground">{romaji}</div>
    </>
  )
}

export function KanjiCard({
  kanji,
  meaning,
  onReading,
  kunReading,
  examples,
}: {
  kanji: string
  meaning: string
  onReading?: string
  kunReading?: string
  examples?: string[]
}) {
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
        {examples && examples.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground">Examples</p>
            <ul className="text-sm space-y-1">
              {examples.map((ex, i) => (
                <li key={i}>{ex}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
