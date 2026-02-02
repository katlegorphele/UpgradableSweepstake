"use client"

import { useState, useEffect, useCallback } from "react"

export interface Participant {
  id: string
  address: string
  avatar: string
  contribution: string
  joinedAt: number
}

export interface Winner {
  address: string
  avatar: string
  prize: string
  round: number
}

export interface GameState {
  roundId: number
  timeRemaining: number
  totalTime: number
  participants: Participant[]
  poolBalance: number
  lastWinner: Winner | null
  previousWinners: Winner[]
}

const initialParticipants: Participant[] = [
  { id: "1", address: "0xc0ffee254729296a45a3885639AC7E10F9d54979", avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${Math.floor(Math.random() * 10000)}`, contribution: "0.02", joinedAt: Date.now() - 60000 },
  { id: "2", address: "0x999999cf1046e68e36E1aA2E0E07105eDDD1f08E", avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${Math.floor(Math.random() * 10000)}`, contribution: "0.01", joinedAt: Date.now() - 45000 },
  { id: "3", address: "0x632113fCADFc585b54DA7b482eda815427EC3e59", avatar: `https://api.dicebear.com/7.x/shapes/svg?seed=${Math.floor(Math.random() * 10000)}`, contribution: "0.03", joinedAt: Date.now() - 30000 },
]

const previousWinners: Winner[] = [
  { address: "0xc0ffee254729296a45a3885639AC7E10F9d54979", avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=0x742d35Cc6634C0532925a3b844Bc454e4438f44e", prize: "0.15", round: 5 },
  { address: "0x742d35Cc6634C0532925a3b844Bc454e4438d44e", avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=0x742d35Cc6634C0532925a3b844Bc454e4438d44e", prize: "0.12", round: 4 },
  { address: "0x742d35Cc6634C0532925a3b809Bc454e4438d11e", avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=0x742d35Cc6634C0532925a3b809Bc454e4438d11e", prize: "0.08", round: 3 },
]

const ROUND_DURATION = 120 // 2 minutes in seconds

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    roundId: 6,
    timeRemaining: ROUND_DURATION,
    totalTime: ROUND_DURATION,
    participants: initialParticipants,
    poolBalance: 0.06,
    lastWinner: { address: "0xc0ffee254729296a45a3885639AC7E10F9d54979", avatar: "https://i.pravatar.cc/40?img=4", prize: "0.15", round: 5 },
    previousWinners,
  })

  const [isRoundEnding, setIsRoundEnding] = useState(false)
  const [showWinner, setShowWinner] = useState(false)
  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null)

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeRemaining <= 1) {
          // Round ended
          setIsRoundEnding(true)
          return prev
        }
        return {
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Handle round end
  useEffect(() => {
    if (isRoundEnding && gameState.participants.length > 0) {
      // Select random winner
      const winnerIndex = Math.floor(Math.random() * gameState.participants.length)
      const winner = gameState.participants[winnerIndex]
      setCurrentWinner(winner)
      setShowWinner(true)

      // Start new round after 5 seconds
      setTimeout(() => {
        setShowWinner(false)
        setCurrentWinner(null)
        setIsRoundEnding(false)
        
        const newWinner: Winner = {
          address: winner.address,
          avatar: winner.avatar,
          prize: gameState.poolBalance.toFixed(2),
          round: gameState.roundId,
        }

        setGameState((prev) => ({
          roundId: prev.roundId + 1,
          timeRemaining: ROUND_DURATION,
          totalTime: ROUND_DURATION,
          participants: [],
          poolBalance: 0,
          lastWinner: newWinner,
          previousWinners: [newWinner, ...prev.previousWinners].slice(0, 5),
        }))
      }, 5000)
    }
  }, [isRoundEnding, gameState.participants, gameState.poolBalance, gameState.roundId])

  const joinPool = useCallback((address: string, contribution: number) => {
    const newParticipant: Participant = {
      id: Date.now().toString(),
      address,
      avatar: `https://i.pravatar.cc/40?img=${Math.floor(Math.random() * 70)}`,
      contribution: contribution.toFixed(2),
      joinedAt: Date.now(),
    }

    setGameState((prev) => ({
      ...prev,
      participants: [...prev.participants, newParticipant],
      poolBalance: prev.poolBalance + contribution,
    }))

    return newParticipant
  }, [])

  const withdrawReward = useCallback(() => {
    // Simulated withdrawal
    return { success: true, message: "Reward claimed successfully!" }
  }, [])

  return {
    gameState,
    joinPool,
    withdrawReward,
    isRoundEnding,
    showWinner,
    currentWinner,
  }
}
