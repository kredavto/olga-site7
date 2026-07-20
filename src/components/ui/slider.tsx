"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

/** Premium gold slider — same Radix behaviour, luxury skin. */
export const Slider = React.forwardRef<
  React.ComponentRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={`relative flex w-full touch-none select-none items-center py-2 ${className ?? ""}`}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-[3px] w-full grow overflow-hidden rounded-full bg-white/10">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-[#b8892b] via-[#e2b64f] to-[#f0cd7a] shadow-[0_0_12px_rgba(226,182,79,0.6)]" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border border-[#f0cd7a]/70 bg-[#0c0c0e] shadow-[0_0_0_4px_rgba(226,182,79,0.15),0_0_18px_rgba(226,182,79,0.55)] transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e2b64f]/50 disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing" />
  </SliderPrimitive.Root>
));
Slider.displayName = "Slider";
