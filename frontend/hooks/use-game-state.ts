"use client"

import { useState, useEffect, useCallback, useRef } from "react"

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

export interface PoolBalances {
  celo: number
  cusd: number
  czar: number
}

export interface TicketPrices {
  CELO: bigint
  CUSD: bigint
  CZAR: bigint
}

export interface GameState {
  roundId: number
  timeRemaining: number
  totalTime: number
  participants: Participant[]
  poolBalances: PoolBalances
  ticketPrices: TicketPrices
  lastWinner: Winner | null
  previousWinners: Winner[]
}

interface PoolApiResponse {
  roundId: number
  roundStart: number
  roundDuration: number
  poolBalances: {
    celo: string
    cusd: string
    czar: string
  }
  participants: string[]
  paused: boolean
  ticketPrices: {
    celo: string
    cusd: string
    czar: string
  }
  maxParticipants: number
}

interface WinnersApiResponse {
  winners: { address: string; round: number; prizeAmount?: string }[]
  currentRound: number
}

function addressToAvatar(address: string) {
  return `https://api.dicebear.com/7.x/shapes/svg?seed=${address}`
}

async function fetchPoolState(): Promise<PoolApiResponse | null> {
  try {
    const res = await fetch("/api/pool")
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function fetchWinners(): Promise<WinnersApiResponse | null> {
  try {
    const res = await fetch("/api/winners")
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    roundId: 0,
    timeRemaining: 0,
    totalTime: 300,
    participants: [],
    poolBalances: { celo: 0, cusd: 0, czar: 0 },
    ticketPrices: { CELO: BigInt(0), CUSD: BigInt(0), CZAR: BigInt(0) },
    lastWinner: null,
    previousWinners: [],
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [showWinner, setShowWinner] = useState(false)
  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null)

  // Refs for local countdown
  const roundStartRef = useRef(0)
  const roundDurationRef = useRef(300)

  // Track if we're currently trying to distribute
  const isDistributingRef = useRef(false)
  const lastDistributeAttemptRef = useRef(0)

  // Fetch pool state from API and trigger distribute if needed
  const refreshPoolState = useCallback(async () => {
    const data = await fetchPoolState()
    if (!data) return

    // Handle paused state
    if (data.paused) {
      setIsPaused(true)
      return // Don't process further when paused
    }
    setIsPaused(false)

    roundStartRef.current = data.roundStart
    roundDurationRef.current = data.roundDuration

    const now = Math.floor(Date.now() / 1000)
    const roundEnd = data.roundStart + data.roundDuration
    const timeRemaining = Math.max(0, roundEnd - now)

    const participants: Participant[] = data.participants.map((addr, i) => ({
      id: `${data.roundId}-${i}`,
      address: addr,
      avatar: addressToAvatar(addr),
      contribution: "",
      joinedAt: Date.now() - (data.participants.length - i) * 10000,
    }))

    setGameState((prev) => ({
      ...prev,
      roundId: data.roundId,
      timeRemaining,
      totalTime: data.roundDuration,
      participants,
      poolBalances: {
        celo: parseFloat(data.poolBalances.celo),
        cusd: parseFloat(data.poolBalances.cusd),
        czar: parseFloat(data.poolBalances.czar),
      },
      ticketPrices: {
        CELO: BigInt(data.ticketPrices.celo),
        CUSD: BigInt(data.ticketPrices.cusd),
        CZAR: BigInt(data.ticketPrices.czar),
      },
    }))

    // If round has expired, try to trigger distribution
    if (timeRemaining <= 0 && !isDistributingRef.current) {
      // Rate limit: only try once every 15 seconds
      const timeSinceLastAttempt = now - lastDistributeAttemptRef.current
      if (timeSinceLastAttempt < 15) return

      isDistributingRef.current = true
      lastDistributeAttemptRef.current = now

      try {
        console.log("Attempting to distribute reward...")
        const res = await fetch("/api/pool/distribute", { method: "POST" })
        const result = await res.json()
        console.log("Distribute API response:", result)

        if (result.success) {
          // Distribution succeeded - refresh after tx confirms
          console.log("Distribution successful! TX:", result.hash)
          setTimeout(async () => {
            await refreshPoolState()
            await refreshWinners()
            isDistributingRef.current = false
          }, 3000)
        } else {
          console.error("Distribute failed:", result.error || "unknown error")
          isDistributingRef.current = false
        }
      } catch (err) {
        console.error("Distribute request failed:", err)
        isDistributingRef.current = false
      }
    }
  }, [])

  // Fetch winners from API
  const refreshWinners = useCallback(async () => {
    const data = await fetchWinners()
    if (!data || data.winners.length === 0) return

    const winners: Winner[] = data.winners.map((w) => ({
      address: w.address,
      avatar: addressToAvatar(w.address),
      prize: w.prizeAmount || "",
      round: w.round,
    }))

    setGameState((prev) => ({
      ...prev,
      lastWinner: winners[0] ?? prev.lastWinner,
      previousWinners: winners,
    }))
  }, [])

  // Initial fetch
  useEffect(() => {
    Promise.all([refreshPoolState(), refreshWinners()]).finally(() => {
      setIsLoading(false)
    })
  }, [refreshPoolState, refreshWinners])

  // Polling interval - 10 seconds normally, 60 seconds when paused
  useEffect(() => {
    const pollInterval = isPaused ? 60000 : 10000
    const interval = setInterval(refreshPoolState, pollInterval)
    return () => clearInterval(interval)
  }, [refreshPoolState, isPaused])

  // Local countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000)
      const roundEnd = roundStartRef.current + roundDurationRef.current
      const remaining = Math.max(0, roundEnd - now)
      setGameState((prev) => ({ ...prev, timeRemaining: remaining }))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Derive isRoundEnding from timeRemaining (not stored as state)
  const isRoundEnding = gameState.timeRemaining <= 0

  // joinPool is handled by the join-pool component directly via wagmi
  const joinPool = useCallback((_address: string, _contribution: number) => {
    // No-op: actual transaction is sent via useWriteContract in JoinPool component
  }, [])

  return {
    gameState,
    joinPool,
    refreshPoolState,
    isLoading,
    isPaused,
    isRoundEnding,
    showWinner,
    currentWinner,
  }
}
