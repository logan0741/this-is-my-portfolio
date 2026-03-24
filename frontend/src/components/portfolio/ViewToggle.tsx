"use client";

import { ViewMode } from "@/types";
import { motion } from "framer-motion";

interface ViewToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  return (
    <div className="toggle-group">
      <motion.button
        className={`toggle-btn ${viewMode === "date" ? "active" : ""}`}
        onClick={() => onChange("date")}
        whileTap={{ scale: 0.95 }}
      >
        📅 날짜별로 보기
      </motion.button>
      <motion.button
        className={`toggle-btn ${viewMode === "purpose" ? "active" : ""}`}
        onClick={() => onChange("purpose")}
        whileTap={{ scale: 0.95 }}
      >
        🎯 목적성 위주로 보기
      </motion.button>
    </div>
  );
}
