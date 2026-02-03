"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Rocket, Minus, Plus, Loader2, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"
import { POOL_ABI, POOL_CONTRACT_ADDRESS } from "@/lib/contract"

interface JoinPoolProps {
  onJoin: (address: string, contribution: number) => void
  isRoundEnding: boolean
  minContribution: number
}

export function JoinPool({ onJoin, isRoundEnding, minContribution }: JoinPoolProps) {
  const [contribution, setContribution] = useState(0.01)
  const [inputValue, setInputValue] = useState("0.01")
  const [joined, setJoined] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showError, setShowError] = useState(false)

  const { address, isConnected } = useAccount()
  const { data: hash, writeContract, isPending, error, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      console.log("JoinPool error:", error)
      const message = error.message.includes("Already joined")
        ? "You already joined this round."
        : error.message.includes("Contribution too small")
        ? `Contribution must be at least ${minContribution} ETH.`
        : error.message.includes("rejected")
        ? "Transaction was rejected."
        : "Transaction failed. Please try again."
      
      setErrorMessage(message)
      setShowError(true)
      
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => {
        setShowError(false)
        setErrorMessage(null)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [error, minContribution])

  // Reset error when user starts new action
  useEffect(() => {
    if (isPending || isConfirming) {
      setShowError(false)
      setErrorMessage(null)
    }
  }, [isPending, isConfirming])

  const handleJoin = () => {
    if (!isConnected) return
    
    // Clear any existing error
    setShowError(false)
    setErrorMessage(null)
    
    writeContract({
      address: POOL_CONTRACT_ADDRESS,
      abi: POOL_ABI,
      functionName: "joinPool",
      value: parseEther(contribution.toString()),
    })
  }

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && address) {
      setJoined(true)
      onJoin(address, contribution)
      setShowError(false)
      setErrorMessage(null)
      
      setTimeout(() => {
        setJoined(false)
        reset()
      }, 2000)
    }
  }, [isSuccess, address, contribution, onJoin, reset])

  const adjustContribution = (delta: number) => {
    setContribution((prev) => {
      const next = Math.max(minContribution || 0.01, Math.round((prev + delta) * 100) / 100)
      setInputValue(next.toString())
      return next
    })
    
    // Clear error when adjusting
    if (showError) {
      setShowError(false)
      setErrorMessage(null)
    }
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
    const parsed = parseFloat(value)
    if (!isNaN(parsed) && parsed > 0) {
      setContribution(parsed)
    }
    
    // Clear error when typing
    if (showError) {
      setShowError(false)
      setErrorMessage(null)
    }
  }

  const handleInputBlur = () => {
    const min = minContribution || 0.01
    if (contribution < min) {
      setContribution(min)
      setInputValue(min.toString())
    } else {
      setInputValue(contribution.toString())
    }
  }

  const isDisabled = !isConnected || isPending || isConfirming || isRoundEnding

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Rocket className="h-5 w-5 text-primary" />
          Join This Round
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Contribution (ETH)</Label>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustContribution(-0.01)}
              disabled={contribution <= (minContribution || 0.01) || isDisabled}
              className="shrink-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <div className="relative flex-1">
              <Input
                type="text"
                inputMode="decimal"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                onBlur={handleInputBlur}
                disabled={isDisabled}
                className="bg-input/50 pr-12 text-center font-mono text-lg font-semibold"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">ETH</span>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => adjustContribution(0.01)}
              disabled={isDisabled}
              className="shrink-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Button
          className="w-full gap-2 bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
          size="lg"
          onClick={handleJoin}
          disabled={isDisabled}
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Confirm in Wallet...
            </>
          ) : isConfirming ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Confirming...
            </>
          ) : joined ? (
            "Joined Successfully!"
          ) : !isConnected ? (
            "Connect Wallet to Join"
          ) : isRoundEnding ? (
            "Round Ending..."
          ) : (
            <>
              <Rocket className="h-5 w-5" />
              Join Pool
            </>
          )}
        </Button>

        {/* Error Toast with Animation */}
        {showError && errorMessage && (
          <div className="animate-in slide-in-from-bottom-2 fade-in duration-300">
            <div className="flex items-start justify-between gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">{errorMessage}</p>
              <button
                onClick={() => {
                  setShowError(false)
                  setErrorMessage(null)
                }}
                className="shrink-0 text-destructive hover:text-destructive/80"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {isRoundEnding && (
          <p className="text-center text-sm text-warning">
            Round is ending! Please wait for the next round.
          </p>
        )}
      </CardContent>
    </Card>
  )
}