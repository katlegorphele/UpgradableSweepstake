"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Crown, Sparkles, PartyPopper } from "lucide-react"
import type { Participant } from "@/hooks/use-game-state"

interface WinnerModalProps {
  winner: Participant | null
  poolBalance: number
  isOpen: boolean
}

export function WinnerModal({ winner, poolBalance, isOpen }: WinnerModalProps) {
  if (!isOpen || !winner) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="relative mx-4 w-full max-w-md animate-in zoom-in-95 fade-in duration-300">
        {/* Glow effect */}
        <div className="absolute -inset-4 rounded-3xl bg-primary/20 blur-2xl" />
        
        <div className="relative overflow-hidden rounded-2xl border border-primary/50 bg-card p-8 text-center shadow-2xl">
          {/* Decorative elements */}
          <Sparkles className="absolute left-4 top-4 h-6 w-6 animate-pulse text-primary/50" />
          <Sparkles className="absolute right-4 top-4 h-6 w-6 animate-pulse text-primary/50" />
          <PartyPopper className="absolute bottom-4 left-4 h-6 w-6 text-yellow-500/50" />
          <PartyPopper className="absolute bottom-4 right-4 h-6 w-6 text-yellow-500/50" />

          {/* Crown */}
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/20">
              <Crown className="h-10 w-10 text-yellow-500" />
            </div>
          </div>

          {/* Winner text */}
          <h2 className="mb-2 text-2xl font-bold text-primary">Winner!</h2>
          <p className="mb-6 text-muted-foreground">Congratulations to this round{"'"}s winner!</p>

          {/* Winner avatar and name */}
          <div className="mb-6 flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24 border-4 border-primary ring-4 ring-primary/20">
              <AvatarImage src={winner.avatar || "/placeholder.svg"} alt={winner.address} />
              <AvatarFallback className="text-2xl">{winner.address[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-2xl font-bold">{winner.address}</p>
              <p className="text-muted-foreground">takes home the prize!</p>
            </div>
          </div>

          {/* Prize amount */}
          <div className="mb-6 rounded-xl bg-primary/10 p-4">
            <p className="text-sm text-muted-foreground">Prize Won</p>
            <p className="text-4xl font-bold text-primary">{poolBalance.toFixed(2)} ETH</p>
          </div>

          {/* Auto-close message */}
          <p className="text-sm text-muted-foreground">
            New round starting soon...
          </p>
        </div>
      </div>
    </div>
  )
}
