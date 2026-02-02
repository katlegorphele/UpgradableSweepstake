"use client"

import { Twitter, MessageCircle, Github, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/50 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Social Links */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Twitter className="h-5 w-5" />
              <span className="sr-only">Twitter</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MessageCircle className="h-5 w-5" />
              <span className="sr-only">Discord</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Github className="h-5 w-5" />
              <span className="sr-only">GitHub</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Globe className="h-5 w-5" />
              <span className="sr-only">Website</span>
            </Button>
          </div>

          {/* Disclaimer */}
          <p className="text-center text-xs text-muted-foreground">
            This is a demo app; real blockchain integration coming soon.
          </p>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            © 2026 EthRewardPool
          </p>
        </div>
      </div>
    </footer>
  )
}
