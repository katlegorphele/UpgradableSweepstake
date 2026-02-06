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

"use client";

import { useEffect, useState } from "react";

function Particle({ delay, size, left, top }: { delay: number; size: number; left: string; top: string }) {
  return (
    <div
      className="absolute rounded-full animate-float"
      style={{
        width: size,
        height: size,
        left,
        top,
        animationDelay: `${delay}s`,
        background: `radial-gradient(circle, hsl(43 96% 56% / 0.15), transparent)`,
      }}
    />
  );
}

export function AnimatedBackground() {
  const [particles, setParticles] = useState<
    { id: number; delay: number; size: number; left: string; top: string }[]
  >([]);

  useEffect(() => {
    const generated = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      delay: Math.random() * 6,
      size: 4 + Math.random() * 8,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {/* Top glow */}
      <div
        className="absolute -top-40 left-1/2 h-80 w-150 -translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(ellipse, hsl(43 96% 56% / 0.3), transparent)" }}
      />
      {/* Bottom accent */}
      <div
        className="absolute -bottom-20 right-0 h-60 w-100 rounded-full opacity-10 blur-3xl"
        style={{ background: "radial-gradient(ellipse, hsl(43 96% 56% / 0.2), transparent)" }}
      />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(43 96% 56% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(43 96% 56% / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Floating particles */}
      {particles.map((p) => (
        <Particle key={p.id} delay={p.delay} size={p.size} left={p.left} top={p.top} />
      ))}
    </div>
  );
}
