"use client"

import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Wallet, Mail, Moon, Sun, Gem } from "lucide-react"

export function Header() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Gem className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Eth<span className="text-primary">RewardPool</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button variant="outline" size="sm" className="hidden gap-2 sm:flex bg-transparent">
            <Mail className="h-4 w-4" />
            Login with Email
          </Button>

          <Button size="sm" className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Connect Wallet</span>
            <span className="sm:hidden">Connect</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
