"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "primary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  type?: "button" | "submit";
}

const variantStyles = {
  default: "bg-white/10 border-white/20 hover:bg-white/20",
  primary: "bg-blue-500/30 border-blue-400/30 hover:bg-blue-500/40",
  ghost: "bg-transparent border-transparent hover:bg-white/10",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
};

export default function GlassButton({
  children,
  onClick,
  className = "",
  variant = "default",
  size = "md",
  disabled = false,
  type = "button",
}: GlassButtonProps) {
  return (
    <motion.button
      type={type}
      className={`
        backdrop-blur-lg rounded-xl border text-white font-medium
        transition-colors duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
      whileHover={!disabled ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  );
}
