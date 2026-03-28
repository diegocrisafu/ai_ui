"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  variant?: "default" | "prominent" | "subtle";
}

const variants = {
  default: "bg-white/10 border-white/20 shadow-lg",
  prominent: "bg-white/15 border-white/25 shadow-xl",
  subtle: "bg-white/5 border-white/10 shadow-md",
};

export default function GlassCard({
  children,
  className = "",
  hover = false,
  onClick,
  variant = "default",
}: GlassCardProps) {
  return (
    <motion.div
      className={`
        backdrop-blur-xl rounded-2xl border
        ${variants[variant]}
        ${hover ? "cursor-pointer" : ""}
        ${className}
      `}
      whileHover={hover ? { scale: 1.02, backgroundColor: "rgba(255,255,255,0.15)" } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
