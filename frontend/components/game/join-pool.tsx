"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Rocket, Loader2, X } from "lucide-react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi"
import { POOL_ABI, POOL_CONTRACT_ADDRESS, TOKEN_ADDRESSES, TOKEN_INFO, ERC20_ABI, TokenType } from "@/lib/contract"
import { TokenSelector } from "./token-selector"

interface JoinPoolProps {
  onJoin: (address: string, token: TokenType) => void
  isRoundEnding: boolean
  ticketPrices: {
    CELO: bigint
    CUSD: bigint
    CZAR: bigint
  }
}

export function JoinPool({ onJoin, isRoundEnding, ticketPrices }: JoinPoolProps) {
  const [selectedToken, setSelectedToken] = useState<TokenType>("CELO")
  const [joined, setJoined] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showError, setShowError] = useState(false)
  const [needsApproval, setNeedsApproval] = useState(false)
  const [isApproving, setIsApproving] = useState(false)

  const { address, isConnected } = useAccount()
  const { data: hash, writeContract, isPending, error, reset } = useWriteContract()
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  // Check allowance for ERC20 tokens
  const tokenAddress = selectedToken !== "CELO"
    ? TOKEN_ADDRESSES[selectedToken] as `0x${string}`
    : undefined

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address && tokenAddress ? [address, POOL_CONTRACT_ADDRESS] : undefined,
  })

  // Check if approval is needed for ERC20 tokens
  useEffect(() => {
    if (selectedToken === "CELO" || !ticketPrices) {
      setNeedsApproval(false)
      return
    }

    const ticketPrice = ticketPrices[selectedToken]
    if (allowance !== undefined && ticketPrice) {
      const needsApprove = (allowance as bigint) < ticketPrice
      console.log(`Allowance check for ${selectedToken}: allowance=${allowance}, ticketPrice=${ticketPrice}, needsApproval=${needsApprove}`)
      setNeedsApproval(needsApprove)
    }
  }, [selectedToken, allowance, ticketPrices])

  // Refetch allowance when token changes
  useEffect(() => {
    if (selectedToken !== "CELO") {
      refetchAllowance()
    }
  }, [selectedToken, refetchAllowance])

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (error) {
      console.log("JoinPool error:", error)
      const message = error.message.includes("Already joined")
        ? "You already joined this round."
        : error.message.includes("Contribution too small")
        ? `Contribution must be at least the ticket price.`
        : error.message.includes("rejected")
        ? "Transaction was rejected."
        : error.message.includes("insufficient")
        ? "Insufficient balance for this token."
        : "Transaction failed. Please try again."

      setErrorMessage(message)
      setShowError(true)
      setIsApproving(false)

      const timer = setTimeout(() => {
        setShowError(false)
        setErrorMessage(null)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [error])

  // Reset error when user starts new action
  useEffect(() => {
    if (isPending || isConfirming) {
      setShowError(false)
      setErrorMessage(null)
    }
  }, [isPending, isConfirming])

  const handleApprove = () => {
    if (!isConnected || selectedToken === "CELO" || !ticketPrices) return

    setShowError(false)
    setErrorMessage(null)
    setIsApproving(true)

    const tokenAddr = TOKEN_ADDRESSES[selectedToken] as `0x${string}`
    const ticketPrice = ticketPrices[selectedToken]

    writeContract({
      address: tokenAddr,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [POOL_CONTRACT_ADDRESS, ticketPrice],
    })
  }

  const handleJoin = () => {
    if (!isConnected || !ticketPrices) return

    setShowError(false)
    setErrorMessage(null)
    setIsApproving(false)

    if (selectedToken === "CELO") {
      // Join with native CELO
      writeContract({
        address: POOL_CONTRACT_ADDRESS,
        abi: POOL_ABI,
        functionName: "joinPoolWithCELO",
        value: ticketPrices.CELO,
      })
    } else {
      // Join with ERC20 token
      const tokenAddr = TOKEN_ADDRESSES[selectedToken] as `0x${string}`
      writeContract({
        address: POOL_CONTRACT_ADDRESS,
        abi: POOL_ABI,
        functionName: "joinPoolWithToken",
        args: [tokenAddr],
      })
    }
  }

  // Handle successful transaction
  useEffect(() => {
    if (isSuccess && address) {
      if (isApproving) {
        // Approval succeeded, refetch allowance and reset state
        setIsApproving(false)
        setNeedsApproval(false) // Immediately update UI
        refetchAllowance().then(() => {
          // Double-check after refetch
          reset()
        })
      } else {
        // Join succeeded
        setJoined(true)
        onJoin(address, selectedToken)
        setShowError(false)
        setErrorMessage(null)

        setTimeout(() => {
          setJoined(false)
          reset()
        }, 2000)
      }
    }
  }, [isSuccess, address, selectedToken, onJoin, reset, isApproving, refetchAllowance])

  const isDisabled = !isConnected || isPending || isConfirming || isRoundEnding

  const getButtonContent = () => {
    if (isPending && isApproving) {
      return (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Approving...
        </>
      )
    }
    if (isPending) {
      return (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Confirm in Wallet...
        </>
      )
    }
    if (isConfirming && isApproving) {
      return (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Confirming Approval...
        </>
      )
    }
    if (isConfirming) {
      return (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          Confirming...
        </>
      )
    }
    if (joined) {
      return "Joined Successfully!"
    }
    if (!isConnected) {
      return "Connect Wallet to Join"
    }
    if (isRoundEnding) {
      return "Round Ending..."
    }
    if (needsApproval && selectedToken !== "CELO") {
      return (
        <>
          Approve {TOKEN_INFO[selectedToken].symbol}
        </>
      )
    }
    return (
      <>
        <Rocket className="h-5 w-5" />
        Join Pool with {TOKEN_INFO[selectedToken].symbol}
      </>
    )
  }

  const handleButtonClick = () => {
    if (needsApproval && selectedToken !== "CELO") {
      handleApprove()
    } else {
      handleJoin()
    }
    
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
        <TokenSelector
          selectedToken={selectedToken}
          onTokenSelect={setSelectedToken}
          ticketPrices={ticketPrices}
          disabled={isDisabled}
        />

        <Button
          className="w-full gap-2 bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
          size="lg"
          onClick={handleButtonClick}
          disabled={isDisabled}
        >
          {getButtonContent()}
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

        {/* Prize info */}
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
          <p className="text-center text-sm text-muted-foreground">
            Prize will be paid in <span className="font-semibold text-primary">cZAR</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
