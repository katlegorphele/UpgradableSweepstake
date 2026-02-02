"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Rocket, Minus, Plus, Loader2 } from "lucide-react"

interface JoinPoolProps {
  onJoin: (name: string, contribution: number) => void
  isRoundEnding: boolean
}

export function JoinPool({ onJoin, isRoundEnding }: JoinPoolProps) {
  const [name, setName] = useState("")
  const [contribution, setContribution] = useState(0.01)
  const [isJoining, setIsJoining] = useState(false)
  const [joined, setJoined] = useState(false)

  const handleJoin = async () => {
    if (!name.trim()) return
    
    setIsJoining(true)
    
    // Simulate transaction delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    onJoin(name, contribution)
    setIsJoining(false)
    setJoined(true)
    
    // Reset after animation
    setTimeout(() => {
      setJoined(false)
      setName("")
    }, 2000)
  }

  const adjustContribution = (delta: number) => {
    setContribution((prev) => Math.max(0.01, Math.round((prev + delta) * 100) / 100))
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Rocket className="h-5 w-5 text-primary" />
          Join This Round
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* <div className="space-y-2">
          <Label htmlFor="name">Your Name</Label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isJoining || isRoundEnding}
            className="bg-input/50"
          />
        </div> */}

        <div className="space-y-2">
          <Label>Contribution (ETH)</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustContribution(-0.01)}
              disabled={contribution <= 0.01 || isJoining || isRoundEnding}
              className="shrink-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="flex-1 rounded-lg bg-input/50 px-4 py-2 text-center font-mono text-lg font-semibold">
              {contribution.toFixed(2)} ETH
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustContribution(0.01)}
              disabled={isJoining || isRoundEnding}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button
          className="w-full gap-2 bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
          size="lg"
          onClick={handleJoin}
          disabled={!name.trim() || isJoining || isRoundEnding}
        >
          {isJoining ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Joining Pool...
            </>
          ) : joined ? (
            <>
              <span className="animate-bounce">🎉</span>
              Joined Successfully!
            </>
          ) : isRoundEnding ? (
            "Round Ending..."
          ) : (
            <>
              <Rocket className="h-5 w-5" />
              Join Pool
            </>
          )}
        </Button>

        {isRoundEnding && (
          <p className="text-center text-sm text-warning">
            Round is ending! Please wait for the next round.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
