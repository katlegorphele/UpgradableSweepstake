"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { TOKEN_INFO, TOKEN_ADDRESSES, TokenType, ERC20_ABI } from "@/lib/contract"
import { useAccount, useBalance, useReadContract } from "wagmi"
import { formatUnits } from "viem"
import { cn } from "@/lib/utils"

interface TokenSelectorProps {
  selectedToken: TokenType
  onTokenSelect: (token: TokenType) => void
  ticketPrices: {
    CELO: bigint
    CUSD: bigint
    CZAR: bigint
  }
  disabled?: boolean
}

export function TokenSelector({
  selectedToken,
  onTokenSelect,
  ticketPrices,
  disabled = false,
}: TokenSelectorProps) {
  const { address, isConnected } = useAccount()

  // Get CELO balance (native)
  const { data: celoBalance } = useBalance({
    address: address,
  })

  // Get cUSD balance
  const { data: cusdBalance } = useReadContract({
    address: TOKEN_ADDRESSES.CUSD as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  })

  // Get cZAR balance
  const { data: czarBalance } = useReadContract({
    address: TOKEN_ADDRESSES.CZAR as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  })

  const tokens: TokenType[] = ["CELO", "CUSD", "CZAR"]

  const getBalance = (token: TokenType): string => {
    if (!isConnected) return "0"
    const decimals = TOKEN_INFO[token].decimals

    switch (token) {
      case "CELO":
        return celoBalance ? formatUnits(celoBalance.value, decimals) : "0"
      case "CUSD":
        return cusdBalance ? formatUnits(cusdBalance as bigint, decimals) : "0"
      case "CZAR":
        return czarBalance ? formatUnits(czarBalance as bigint, decimals) : "0"
      default:
        return "0"
    }
  }

  const getTicketPrice = (token: TokenType): string => {
    if (!ticketPrices) return "0"
    const price = ticketPrices[token]
    if (!price) return "0"
    return formatUnits(price, TOKEN_INFO[token].decimals)
  }

  const hasEnoughBalance = (token: TokenType): boolean => {
    const balance = parseFloat(getBalance(token))
    const price = parseFloat(getTicketPrice(token))
    return balance >= price
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-muted-foreground">
        Select Payment Token
      </div>
      <div className="grid grid-cols-3 gap-2">
        {tokens.map((token) => {
          const info = TOKEN_INFO[token]
          const balance = getBalance(token)
          const price = getTicketPrice(token)
          const hasBalance = hasEnoughBalance(token)
          const isSelected = selectedToken === token

          return (
            <Button
              key={token}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "h-auto flex-col gap-1 py-3 transition-all",
                isSelected && "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background",
                !isSelected && "hover:bg-muted",
                !hasBalance && isConnected && !isSelected && "opacity-50"
              )}
              onClick={() => onTokenSelect(token)}
              disabled={disabled}
            >
              <span className="text-base font-bold">{info.symbol}</span>
              <span className={cn(
                "text-xs",
                isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
              )}>
                {parseFloat(price).toFixed(2)} {info.symbol}
              </span>
              {isConnected && (
                <span className={cn(
                  "text-xs font-medium",
                  isSelected
                    ? (hasBalance ? "text-green-200" : "text-red-200")
                    : (hasBalance ? "text-green-500" : "text-red-400")
                )}>
                  Bal: {parseFloat(balance).toFixed(2)}
                </span>
              )}
            </Button>
          )
        })}
      </div>

      {/* Ticket price display */}
      <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Ticket Price (R20)</span>
          <span className="font-mono font-semibold">
            {getTicketPrice(selectedToken)} {TOKEN_INFO[selectedToken].symbol}
          </span>
        </div>
      </div>
    </div>
  )
}
