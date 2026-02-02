"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Clock, Users, Coins, Hash } from "lucide-react"
import type { GameState } from "@/hooks/use-game-state"

interface RoundInfoProps {
  gameState: GameState
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export function RoundInfo({ gameState }: RoundInfoProps) {
  const progress = ((gameState.totalTime - gameState.timeRemaining) / gameState.totalTime) * 100

  return (
    <Card className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-0">
        {/* Progress bar */}
        <div className="h-1 w-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-1000 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
          {/* Round Number */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Hash className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Round</p>
              <p className="text-lg font-bold">#{gameState.roundId}</p>
            </div>
          </div>

          {/* Time Remaining */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Time Left</p>
              <p className="text-lg font-bold font-mono">{formatTime(gameState.timeRemaining)}</p>
            </div>
          </div>

          {/* Pool Balance */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pool</p>
              <p className="text-lg font-bold">{gameState.poolBalance.toFixed(2)} ETH</p>
            </div>
          </div>

          {/* Participants */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-chart-2/10 text-chart-2">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Players</p>
              <p className="text-lg font-bold">{gameState.participants.length}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
