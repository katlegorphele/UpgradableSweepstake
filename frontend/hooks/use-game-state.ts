"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useWatchContractEvent } from "wagmi"
import { POOL_ABI, POOL_CONTRACT_ADDRESS } from "@/lib/contract"
import { formatEther } from "viem"

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
  minContribution: number
  lastWinner: Winner | null
  previousWinners: Winner[]
}

interface PoolApiResponse {
  roundId: number
  roundStart: number
  roundDuration: number
  poolBalance: string
  participants: string[]
  paused: boolean
  minContribution: string
  maxParticipants: number
}

interface WinnersApiResponse {
  winners: { address: string; round: number }[]
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
    poolBalance: 0,
    minContribution: 0,
    lastWinner: null,
    previousWinners: [],
  })

  const [isLoading, setIsLoading] = useState(true)
  const [isRoundEnding, setIsRoundEnding] = useState(false)
  const [showWinner, setShowWinner] = useState(false)
  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null)
  const roundStartRef = useRef(0)
  const roundDurationRef = useRef(300)

  // Fetch pool state from API
  const refreshPoolState = useCallback(async () => {
    const data = await fetchPoolState()
    if (!data) return

    roundStartRef.current = data.roundStart
    roundDurationRef.current = data.roundDuration

    const now = Math.floor(Date.now() / 1000)
    const roundEnd = data.roundStart + data.roundDuration
    const timeRemaining = Math.max(0, roundEnd - now)

    const participants: Participant[] = data.participants.map((addr, i) => ({
      id: `${data.roundId}-${i}`,
      address: addr,
      avatar: addressToAvatar(addr),
      contribution: "", // individual contributions aren't tracked on-chain
      joinedAt: Date.now() - (data.participants.length - i) * 10000,
    }))

    setGameState((prev) => ({
      ...prev,
      roundId: data.roundId,
      timeRemaining,
      totalTime: data.roundDuration,
      participants,
      poolBalance: parseFloat(data.poolBalance),
      minContribution: parseFloat(data.minContribution),
    }))

    setIsRoundEnding(timeRemaining <= 0)
  }, [])

  // Fetch winners from API
  const refreshWinners = useCallback(async () => {
    const data = await fetchWinners()
    if (!data || data.winners.length === 0) return

    const winners: Winner[] = data.winners.map((w) => ({
      address: w.address,
      avatar: addressToAvatar(w.address),
      prize: "", // prize amounts aren't stored on-chain per round
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

  // Poll pool state every 60 seconds (events handle real-time updates)
  useEffect(() => {
    const interval = setInterval(refreshPoolState, 60000)
    return () => clearInterval(interval)
  }, [refreshPoolState])

  // Local countdown timer - recomputes from roundStart + roundDuration each tick
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000)
      const roundEnd = roundStartRef.current + roundDurationRef.current
      const remaining = Math.max(0, roundEnd - now)

      setGameState((prev) => ({ ...prev, timeRemaining: remaining }))

      if (remaining <= 0) {
        setIsRoundEnding(true)
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Auto-trigger distributeReward when round timer expires
  const distributeCalledRef = useRef(false)
  useEffect(() => {
    if (isRoundEnding && !distributeCalledRef.current) {
      distributeCalledRef.current = true
      fetch("/api/pool/distribute", { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) console.error("Auto-distribute failed:", data.error)
        })
        .catch((err) => console.error("Auto-distribute error:", err))
        .finally(() => {
          // Allow retry after 10s if the round hasn't advanced
          setTimeout(() => { distributeCalledRef.current = false }, 10000)
        })
    }
  }, [isRoundEnding])

  // Watch for on-chain ParticipantJoined events -> refresh state
  useWatchContractEvent({
    address: POOL_CONTRACT_ADDRESS,
    abi: POOL_ABI,
    eventName: "ParticipantJoined",
    onLogs() {
      refreshPoolState()
    },
  })

  // Watch for on-chain RewardDistributed events -> show winner
  useWatchContractEvent({
    address: POOL_CONTRACT_ADDRESS,
    abi: POOL_ABI,
    eventName: "RewardDistributed",
    onLogs(logs) {
      const log = logs[0]
      if (!log) return

      const recipient = log.args.recipient as string
      const amount = log.args.amount as bigint
      const roundId = log.args.roundId as bigint

      const winner: Participant = {
        id: `winner-${roundId}`,
        address: recipient,
        avatar: addressToAvatar(recipient),
        contribution: formatEther(amount),
        joinedAt: Date.now(),
      }

      setCurrentWinner(winner)
      setShowWinner(true)

      const newWinner: Winner = {
        address: recipient,
        avatar: addressToAvatar(recipient),
        prize: formatEther(amount),
        round: Number(roundId),
      }

      setTimeout(() => {
        setShowWinner(false)
        setCurrentWinner(null)
        setIsRoundEnding(false)
        refreshPoolState()
        refreshWinners()

        setGameState((prev) => ({
          ...prev,
          lastWinner: newWinner,
          previousWinners: [newWinner, ...prev.previousWinners].slice(0, 10),
        }))
      }, 5000)
    },
  })

  // Watch for NewRoundStarted -> refresh state
  useWatchContractEvent({
    address: POOL_CONTRACT_ADDRESS,
    abi: POOL_ABI,
    eventName: "NewRoundStarted",
    onLogs() {
      setIsRoundEnding(false)
      refreshPoolState()
    },
  })

  // joinPool is now handled by the join-pool component directly via wagmi
  // This is kept for compatibility but does nothing (tx is on-chain now)
  const joinPool = useCallback((_address: string, _contribution: number) => {
    // No-op: actual transaction is sent via useWriteContract in JoinPool component
    // Pool state will refresh when ParticipantJoined event fires
  }, [])

  return {
    gameState,
    joinPool,
    refreshPoolState,
    isLoading,
    isRoundEnding,
    showWinner,
    currentWinner,
  }
}
