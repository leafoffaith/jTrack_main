import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Navbar } from "@/components/navbar"
import { ArrowRight, BookOpen } from "lucide-react"

// Mock auth - replace with real auth check
const isAuthenticated = true
const username = "user@example.com"

const decks = [
  {
    id: "hiragana",
    title: "Hiragana",
    description: "Basic Japanese syllabary, perfect for beginners.",
    dueCards: 5,
    newCards: 10,
    icon: "あ",
  },
  {
    id: "katakana",
    title: "Katakana",
    description: "Used for foreign words and emphasis.",
    dueCards: 3,
    newCards: 8,
    icon: "カ",
  },
  {
    id: "kanji",
    title: "Kanji",
    description: "Chinese characters used in Japanese writing.",
    dueCards: 12,
    newCards: 5,
    icon: "漢",
  },
]

export default function LearnPage() {
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar isLoggedIn={false} />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Please Login First</CardTitle>
              <CardDescription>You need to be logged in to access your decks and start learning.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/login">
                <Button className="w-full" size="lg">
                  Go to Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar isLoggedIn={isAuthenticated} username={username} onSignOut={() => console.log("Sign out")} />

      <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold">Choose Your Deck</h1>
            <p className="text-lg text-muted-foreground">Select a deck to start your study session</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <Link key={deck.id} href={`/study/${deck.id}`}>
                <Card className="h-full transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer group">
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <span className="text-3xl">{deck.icon}</span>
                      </div>
                      {deck.dueCards > 0 && (
                        <div className="px-2 py-1 rounded-md bg-accent text-accent-foreground text-xs font-semibold">
                          {deck.dueCards} due
                        </div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{deck.title}</CardTitle>
                      <CardDescription className="mt-2">{deck.description}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{deck.newCards} new cards</span>
                      <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                    <Button className="w-full" size="lg">
                      Study Now
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
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
      </div>
    </div>
  )
}
