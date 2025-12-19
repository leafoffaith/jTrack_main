"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen } from "lucide-react"

interface NavbarProps {
  isLoggedIn?: boolean
  username?: string
  onSignOut?: () => void
}

export function Navbar({ isLoggedIn = false, username, onSignOut }: NavbarProps) {
  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
              <BookOpen className="h-6 w-6 text-primary" />
              <span>FlashLearn</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/learn" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Learn
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <span className="text-sm text-muted-foreground hidden sm:inline">{username}</span>
                <Button variant="outline" onClick={onSignOut} size="sm">
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/login?mode=register">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
