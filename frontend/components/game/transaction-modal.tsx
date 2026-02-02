"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, X } from "lucide-react"

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  type: "success" | "error"
  title: string
  message: string
}

export function TransactionModal({
  isOpen,
  onClose,
  type,
  title,
  message,
}: TransactionModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-sm animate-in zoom-in-95 fade-in duration-200">
        <div className="overflow-hidden rounded-xl border border-border bg-card p-6 shadow-xl">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Icon */}
          <div className="mb-4 flex justify-center">
            {type === "success" ? (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold">{title}</h3>
            <p className="mb-6 text-sm text-muted-foreground">{message}</p>
          </div>

          {/* Action button */}
          <Button className="w-full" onClick={onClose}>
            {type === "success" ? "Awesome!" : "Try Again"}
          </Button>
        </div>
      </div>
    </div>
  )
}
