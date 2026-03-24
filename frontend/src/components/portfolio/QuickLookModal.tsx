"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useCallback } from "react";

interface QuickLookModalProps {
  imageSrc: string;
  onClose: () => void;
}

export default function QuickLookModal({
  imageSrc,
  onClose,
}: QuickLookModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  return (
    <motion.div
      className="quicklook-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="relative max-w-4xl max-h-[85vh] w-full mx-6"
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors z-10"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Image container */}
        <div className="relative w-full h-[70vh] glass overflow-hidden">
          <Image
            src={imageSrc}
            alt="Quick Look"
            fill
            className="object-contain p-4"
            sizes="(max-width: 768px) 100vw, 80vw"
          />
        </div>

        {/* Filename */}
        <p className="text-center mt-3 text-sm text-[var(--text-tertiary)]">
          {imageSrc.split("/").pop()}
        </p>
      </motion.div>
    </motion.div>
  );
}
