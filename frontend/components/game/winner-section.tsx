"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Crown, Sparkles } from "lucide-react"
import type { Winner } from "@/hooks/use-game-state"

interface WinnerSectionProps {
  lastWinner: Winner | null
  previousWinners: Winner[]
}

export function WinnerSection({ lastWinner, previousWinners }: WinnerSectionProps) {
  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Crown className="h-5 w-5 text-yellow-500" />
          Winners Hall
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Latest Winner */}
        {lastWinner && (
          <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-primary/20 via-primary/10 to-transparent p-4">
            <Sparkles className="absolute right-2 top-2 h-5 w-5 text-primary/50" />
            <p className="mb-2 text-xs font-medium text-primary">Latest Winner</p>
            <div className="flex items-center gap-3">
              {/* <Avatar className="h-12 w-12 border-2 border-primary/50">
                <AvatarImage src={lastWinner.avatar || "/placeholder.svg"} alt={lastWinner.address} />
                <AvatarFallback>{lastWinner.address[0]}</AvatarFallback>
              </Avatar> */}
              <div className="flex-1">
                <p className="font-semibold">{lastWinner.address}</p>
                <p className="text-sm text-muted-foreground">Round #{lastWinner.round}</p>
              </div>
              <Badge variant="secondary" className="bg-primary/20 font-mono text-primary">
                {lastWinner.prize} ETH
              </Badge>
            </div>
          </div>
        )}

        {/* Previous Winners */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Previous Winners
          </p>
          {previousWinners.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No previous winners yet
            </p>
          ) : (
            <div className="space-y-2">
              {previousWinners.slice(0, 4).map((winner, index) => (
                <div
                  key={`${winner.round}-${winner.address}`}
                  className="flex items-center gap-3 rounded-lg bg-muted/30 p-2 transition-colors hover:bg-muted/50"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={winner.avatar || "/placeholder.svg"} alt={winner.address} />
                    <AvatarFallback>{winner.address[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{winner.address}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold text-success">
                      {winner.prize} ETH
                    </p>
                    <p className="text-xs text-muted-foreground">R#{winner.round}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
