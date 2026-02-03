"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, TrendingUp, Crown } from "lucide-react"
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

  // Function to truncate Ethereum address
  const truncateAddress = (address: string) => {
    if (!address || address.length < 10) return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

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
                  {/* Rank - Simple number or crown for winner
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center">
                    <span className="text-sm font-medium text-muted-foreground">
                        #{index + 1}
                      </span>
                  </div> */}

                  {/* Avatar */}
                  <Avatar className="h-10 w-10 border-2 border-border">
                    <AvatarImage src={participant.avatar || `/api/avatar/${participant.address}`} alt={participant.address} />
                    <AvatarFallback>
                      {truncateAddress(participant.address)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Truncated Address */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-mono text-sm font-medium">
                      {truncateAddress(participant.address)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatTimeAgo(participant.joinedAt)}
                    </p>
                  </div>

                  {/* Contribution */}
                  <div className="flex items-center gap-1 text-right">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="font-mono font-semibold">
                      {parseFloat(participant.contribution).toFixed(2)} ETH
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
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}