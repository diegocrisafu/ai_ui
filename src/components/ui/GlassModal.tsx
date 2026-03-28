"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ReactNode } from "react";
import { X } from "lucide-react";

interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function GlassModal({
  isOpen,
  onClose,
  title,
  children,
}: GlassModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="
                bg-white/10 backdrop-blur-2xl border border-white/20
                rounded-2xl shadow-2xl w-full max-w-md overflow-hidden
              "
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-xl font-semibold text-white">{title}</h2>
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-5">{children}</div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
