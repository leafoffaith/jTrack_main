"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Flashcard, HiraganaCard, KanjiCard } from "@/components/flashcard"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, CheckCircle2 } from "lucide-react"

// Mock data - replace with real data fetching
const mockDecks: Record<string, any> = {
  hiragana: {
    name: "Hiragana",
    cards: [
      { id: 1, character: "あ", romaji: "a", isDue: true },
      { id: 2, character: "い", romaji: "i", isDue: false },
      { id: 3, character: "う", romaji: "u", isDue: true },
    ],
  },
  katakana: {
    name: "Katakana",
    cards: [
      { id: 1, character: "カ", romaji: "ka", isDue: true },
      { id: 2, character: "キ", romaji: "ki", isDue: false },
    ],
  },
  kanji: {
    name: "Kanji",
    cards: [
      {
        id: 1,
        kanji: "日",
        meaning: "sun, day",
        onReading: "ニチ (nichi)",
        kunReading: "ひ (hi)",
        examples: ["日本 (nihon) - Japan", "今日 (kyou) - today"],
        isDue: true,
      },
    ],
  },
}

export default function StudyPage() {
  const params = useParams()
  const router = useRouter()
  const deckId = params.deckId as string
  const deck = mockDecks[deckId]

  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  if (!deck) {
    return <div>Deck not found</div>
  }

  const currentCard = deck.cards[currentCardIndex]
  const hasMoreCards = currentCardIndex < deck.cards.length - 1

  const handleRate = (rating: "again" | "hard" | "good" | "easy") => {
    console.log(`Rated: ${rating}`)

    setIsExiting(true)

    // Wait for fade animation to complete before advancing
    setTimeout(() => {
      if (hasMoreCards) {
        setCurrentCardIndex((prev) => prev + 1)
        setIsFlipped(false)
        setIsExiting(false)
      } else {
        setIsComplete(true)
      }
    }, 400)
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  if (isComplete) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isLoggedIn={true} username="user@example.com" />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center space-y-6">
              <CheckCircle2 className="h-16 w-16 text-primary mx-auto" />
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Great Work!</h2>
                <p className="text-muted-foreground">You have finished studying for now! Come back later :)</p>
              </div>
              <Button className="w-full" size="lg" onClick={() => router.push("/learn")}>
                Back to Decks
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navbar isLoggedIn={true} username="user@example.com" />

      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.push("/learn")} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Decks
            </Button>
            <div className="text-sm text-muted-foreground">
              Card {currentCardIndex + 1} of {deck.cards.length}
            </div>
          </div>

          {/* Card Stack */}
          <div className="relative py-8">
            <div className="relative space-y-[-280px]">
              {/* Queue cards */}
              {currentCardIndex + 2 < deck.cards.length && (
                <Flashcard front={<div className="text-6xl">?</div>} position="queue-2" />
              )}
              {hasMoreCards && <Flashcard front={<div className="text-6xl">?</div>} position="queue-1" />}
              {/* Active card */}
              <Flashcard
                front={
                  deckId === "kanji" ? (
                    <div className="text-8xl font-bold">{currentCard.kanji}</div>
                  ) : (
                    <HiraganaCard character={currentCard.character} romaji="" />
                  )
                }
                back={
                  deckId === "kanji" ? (
                    <KanjiCard {...currentCard} />
                  ) : (
                    <HiraganaCard character={currentCard.character} romaji={currentCard.romaji} />
                  )
                }
                isFlipped={isFlipped}
                isDue={currentCard.isDue}
                position="active"
                isExiting={isExiting}
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
                  onClick={() => handleRate("again")}
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  Again
                </Button>
                <Button variant="outline" onClick={() => handleRate("hard")}>
                  Hard
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRate("good")}
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Good
                </Button>
                <Button onClick={() => handleRate("easy")} className="bg-primary hover:bg-primary/90">
                  Easy
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
