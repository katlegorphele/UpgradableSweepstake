"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, Trophy, TrendingUp } from "lucide-react"
import type { Participant } from "@/hooks/use-game-state"

interface ParticipantListProps {
  participants: Participant[]
  highlightWinner?: string | null
}

export function ParticipantList({ participants, highlightWinner }: ParticipantListProps) {
  // Sort by contribution amount (highest first)
  const sortedParticipants = [...participants].sort(
    (a, b) => parseFloat(b.contribution) - parseFloat(a.contribution)
  )

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Participants
          </span>
          <Badge variant="secondary" className="font-mono">
            {participants.length} players
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-70 pr-4">
          {sortedParticipants.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 py-8 text-muted-foreground">
              <Users className="h-12 w-12 opacity-50" />
              <p>No participants yet</p>
              <p className="text-sm">Be the first to join!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedParticipants.map((participant, index) => (
                <div
                  key={participant.id}
                  className={`flex items-center gap-3 rounded-lg p-3 transition-all duration-500 ${
                    highlightWinner === participant.id
                      ? "animate-pulse bg-primary/20 ring-2 ring-primary"
                      : "bg-muted/30 hover:bg-muted/50"
                  }`}
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  {/* Rank */}
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                    {index === 0 ? (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    ) : index === 1 ? (
                      <Trophy className="h-5 w-5 text-gray-400" />
                    ) : index === 2 ? (
                      <Trophy className="h-5 w-5 text-amber-600" />
                    ) : (
                      <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                    )}
                  </div>

                  {/* Avatar */}
                  <Avatar className="h-10 w-10 border-2 border-border">
                    <AvatarImage src={participant.avatar || "/placeholder.svg"} alt={participant.address} />
                    <AvatarFallback>{participant.address[0]}</AvatarFallback>
                  </Avatar>

                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{participant.address}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatTimeAgo(participant.joinedAt)}
                    </p>
                  </div>

                  {/* Contribution */}
                  <div className="flex items-center gap-1 text-right">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="font-mono font-semibold">
                      {participant.contribution} ETH
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  return `${Math.floor(minutes / 60)}h ago`
}
