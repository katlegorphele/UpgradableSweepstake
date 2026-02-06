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

export function OrbitRing() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
      {/* Outer ring */}
      <div className="animate-spin-slow absolute h-125 w-125 rounded-full border border-dashed border-primary/10 sm:h-150 sm:w-150">
        <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary/40" />
        <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-primary/20" />
      </div>
      {/* Inner ring */}
      <div
        className="animate-spin-slow absolute h-87.5 w-87.5 rounded-full border border-dashed border-primary/5 sm:h-105 sm:w-105"
        style={{ animationDirection: "reverse", animationDuration: "30s" }}
      >
        <div className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary/30" />
      </div>
    </div>
  );
}
