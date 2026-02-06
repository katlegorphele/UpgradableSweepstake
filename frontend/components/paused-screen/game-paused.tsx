// Copyright 2026 katlegorphele
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     https://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { Pause, Shield, Bell, ArrowRight } from "lucide-react";
import { AnimatedBackground } from "./animated-background";
import { Header } from "../game/header";
// import { CountdownTimer } from "@/components/countdown-timer";
// import { PrizePoolDisplay } from "@/components/prize-pool-display";
// import { StatusBadge } from "@/components/status-badge";
import { OrbitRing } from "./orbit-ring";
// import { NotifyForm } from "@/components/notify-form";

export default function GamePaused() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background">
      <AnimatedBackground />

      {/* Header */}
      <Header />

      {/* Main */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16">
        {/* Orbit decoration */}
        <OrbitRing />

        {/* Central content */}
        <div className="relative z-10 flex max-w-2xl flex-col items-center gap-8 text-center">
          {/* Icon */}
          <div className="animate-pulse-glow flex h-20 w-20 items-center justify-center rounded-3xl border border-primary/20 bg-card">
            <Pause className="h-9 w-9 text-primary" />
          </div>

          {/* Title */}
          <div className="flex flex-col gap-3">
            <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              The el<span className="text-primary">ZAR</span>o Pool is
              <span className="text-primary"> Paused</span>
            </h1>
            <p className="mx-auto max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              {"We're upgrading the engine to bring you faster draws and a smoother experience. Hang tight."}
            </p>
          </div>

          

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary/60" />
              <span>Funds are safe</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ArrowRight className="h-3.5 w-3.5 text-primary/60" />
              <span>No action needed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary/60" />
              <span>Smart contract secured</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
