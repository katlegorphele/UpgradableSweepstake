"use client"

import { Users, Coins, Hash } from "lucide-react"
import type { GameState } from "@/hooks/use-game-state"

interface RoundInfoProps {
  gameState: GameState
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

const RADIUS = 90
const STROKE = 8
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function RoundInfo({ gameState }: RoundInfoProps) {
  const fraction = gameState.totalTime > 0
    ? gameState.timeRemaining / gameState.totalTime
    : 0
  const offset = CIRCUMFERENCE * (1 - fraction)

  const isUrgent = gameState.timeRemaining <= 30 && gameState.timeRemaining > 0

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Circular timer */}
      <div className="relative">
        {isUrgent && (
          <div className="absolute inset-0 rounded-full bg-destructive/20 blur-2xl animate-pulse" />
        )}

        <svg
          width={2 * (RADIUS + STROKE)}
          height={2 * (RADIUS + STROKE)}
          className="relative -rotate-90"
        >
          {/* Background track */}
          <circle
            cx={RADIUS + STROKE}
            cy={RADIUS + STROKE}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            className="text-muted/50"
          />
          {/* Progress arc */}
          <circle
            cx={RADIUS + STROKE}
            cy={RADIUS + STROKE}
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            className={`transition-all duration-1000 ease-linear ${
              isUrgent ? "text-destructive" : "text-primary"
            }`}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Round #{gameState.roundId}
          </p>
          <p className={`font-mono text-4xl font-bold tracking-tight ${
            isUrgent ? "text-destructive" : "text-foreground"
          }`}>
            {formatTime(gameState.timeRemaining)}
          </p>
          <p className="text-xs text-muted-foreground">remaining</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Hash className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Round</p>
            <p className="text-sm font-bold">#{gameState.roundId}</p>
          </div>
        </div>

        <div className="h-8 w-px bg-border/50" />

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success/10 text-success">
            <Coins className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Pool</p>
            <p className="text-sm font-bold">{gameState.poolBalance.toFixed(4)} ETH</p>
          </div>
        </div>

        <div className="h-8 w-px bg-border/50" />

        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-chart-2/10 text-chart-2">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground">Players</p>
            <p className="text-sm font-bold">{gameState.participants.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
