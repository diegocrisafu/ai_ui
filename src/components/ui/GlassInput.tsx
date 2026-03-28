"use client";

import { InputHTMLAttributes } from "react";

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export default function GlassInput({ className = "", ...props }: GlassInputProps) {
  return (
    <input
      className={`
        w-full bg-white/10 backdrop-blur-lg border border-white/20
        rounded-xl px-4 py-3 text-white placeholder-white/50
        focus:outline-none focus:border-white/40 focus:bg-white/15
        transition-all duration-200
        ${className}
      `}
      {...props}
    />
  );
}
