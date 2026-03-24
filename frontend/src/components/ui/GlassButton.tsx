"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import React from "react";

interface GlassButtonProps extends HTMLMotionProps<"button"> {
  variant?: "default" | "primary";
  children: React.ReactNode;
}

export default function GlassButton({
  variant = "default",
  children,
  className = "",
  ...props
}: GlassButtonProps) {
  const baseClass =
    variant === "primary" ? "glass-button glass-button-primary" : "glass-button";

  return (
    <motion.button
      className={`${baseClass} ${className}`}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
