"use client";

import { Header } from "@/components/game/header";
import { RoundInfo } from "@/components/game/round-info";
import { JoinPool } from "@/components/game/join-pool";
import { ParticipantList } from "@/components/game/participant-list";
import { WinnerSection } from "@/components/game/winner-section";
import { Footer } from "@/components/game/footer";
import { Confetti } from "@/components/game/confetti";
import { WinnerModal } from "@/components/game/winner-modal";
import { useGameState } from "@/hooks/use-game-state";
import GamePaused from "@/components/paused-screen/game-paused";

export default function EthRewardPoolPage() {
  const {
    gameState,
    joinPool,
    isLoading,
    isPaused,
    isRoundEnding,
    showWinner,
    currentWinner,
  } = useGameState();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading pool data...</p>
        </div>
      </div>
    );
  }

  if (isPaused) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <GamePaused/>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Confetti animation */}
      <Confetti active={showWinner} />

      {/* Winner modal */}
      <WinnerModal
        winner={currentWinner}
        prizeAmount={currentWinner?.contribution || "0"}
        isOpen={showWinner}
      />

      {/* Header */}
      <Header />

      {/* Main content */}
      <main className="container mx-auto flex-1 px-4 py-6">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Win <span className="text-primary">cZAR</span> Every Round
          </h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            Join the pool with CELO, cUSD, or cZAR and get a chance to win the
            prize in cZAR when the round ends!
          </p>
        </div>

        {/* Round info */}
        <div className="mb-6">
          <RoundInfo gameState={gameState} />
        </div>

        {/* Main game area */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* All columns with same min-height */}
          <div className="lg:col-span-1">
            <JoinPool
              onJoin={(address: string, token: string) => joinPool(address, 0)}
              isRoundEnding={isRoundEnding}
              ticketPrices={gameState.ticketPrices}
            />
          </div>

          <div className="lg:col-span-1 min-h-100">
            <ParticipantList
              participants={gameState.participants}
              highlightWinner={currentWinner?.id}
            />
          </div>

          <div className="lg:col-span-1 min-h-100">
            <WinnerSection
              lastWinner={gameState.lastWinner}
              previousWinners={gameState.previousWinners}
            />
          </div>
        </div>

        {/* How it works section */}
        <div className="mt-12">
          <h2 className="mb-6 text-center text-2xl font-bold">How It Works</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/50 bg-card/50 p-6 text-center backdrop-blur-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
                1
              </div>
              <h3 className="mb-2 font-semibold">Connect Wallet</h3>
              <p className="text-sm text-muted-foreground">
                Connect your Web3 wallet or login with email to get started.
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/50 p-6 text-center backdrop-blur-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
                2
              </div>
              <h3 className="mb-2 font-semibold">Join the Pool</h3>
              <p className="text-sm text-muted-foreground">
                Pay R20 with CELO, cUSD, or cZAR before the round ends.
              </p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/50 p-6 text-center backdrop-blur-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-2xl font-bold text-primary">
                3
              </div>
              <h3 className="mb-2 font-semibold">Win Big</h3>
              <p className="text-sm text-muted-foreground">
                One lucky participant wins the entire pool when the round ends!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
