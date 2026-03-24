"use client";

import { motion } from "framer-motion";

interface RealisticFolderProps {
  title: string;
  subtitle: string;
  colorPreset: "teal" | "navy";
  onClick: () => void;
  icon: string;
}

export default function RealisticFolder({
  title,
  subtitle,
  colorPreset,
  onClick,
  icon,
}: RealisticFolderProps) {
  // Colors based on the photo idea
  const colors =
    colorPreset === "teal"
      ? {
          back: "#5f8f98",
          front: "#7da8b1",
          tab: "#5f8f98",
          shadow: "rgba(95, 143, 152, 0.4)",
        }
      : {
          back: "#2c3e50",
          front: "#34495e",
          tab: "#2c3e50",
          shadow: "rgba(44, 62, 80, 0.4)",
        };

  return (
    <motion.div
      className="relative w-full max-w-sm aspect-[4/3] cursor-pointer group perspective-1000 mx-auto"
      onClick={onClick}
      whileHover="hover"
      whileTap="tap"
      initial="rest"
      animate="rest"
      variants={{
        rest: { scale: 1, y: 0 },
        hover: { scale: 1.05, y: -10 },
        tap: { scale: 0.95 },
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Drop shadow */}
      <motion.div
        className="absolute -bottom-4 left-4 right-4 h-8 rounded-[100%] blur-xl"
        style={{ background: colors.shadow }}
        variants={{
          rest: { opacity: 0.5, scale: 0.9 },
          hover: { opacity: 0.8, scale: 1.05 },
        }}
      />

      {/* Back flap with tab */}
      <div className="absolute inset-0 z-10 transition-transform duration-500 ease-out group-hover:rotate-x-12 origin-bottom">
        {/* Tab */}
        <div
          className="absolute -top-6 left-8 w-32 h-8 rounded-t-xl"
          style={{ backgroundColor: colors.tab }}
        />
        {/* Main back cover */}
        <div
          className="absolute inset-0 rounded-2xl rounded-tl-none shadow-inner overflow-hidden"
          style={{ backgroundColor: colors.back }}
        >
          {/* Subtle noise/texture */}
          <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        </div>
      </div>

      {/* Internal Accordion Papers (White dividers) */}
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className="absolute bottom-2 left-3 right-3 bg-[#f8f9fa] rounded-xl border border-[#e9ecef] shadow-sm z-20 origin-bottom"
          style={{
            height: `${100 - i * 5}%`,
          }}
          variants={{
            rest: { y: -i * 2, rotateX: 0 },
            hover: { y: -i * 6, rotateX: i * 3 },
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Subtle line indicator for accordion effect */}
          <div className="absolute top-0 bottom-0 left-4 right-4 border-x border-dashed border-[#dee2e6] opacity-50" />
        </motion.div>
      ))}

      {/* Front flap */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-[85%] z-30 origin-bottom rounded-2xl shadow-xl flex flex-col items-center justify-center border-t border-[rgba(255,255,255,0.1)]"
        style={{ backgroundColor: colors.front }}
        variants={{
          rest: { rotateX: 0 },
          hover: { rotateX: -15 },
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        {/* Texture */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay rounded-2xl bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

        {/* Content on front flap */}
        <div className="relative z-10 text-center text-white px-6">
          <div className="text-5xl mb-4 drop-shadow-md">{icon}</div>
          <h2 className="text-2xl font-bold mb-2 tracking-tight drop-shadow-md">
            {title}
          </h2>
          <p className="text-sm text-white/80 font-medium">{subtitle}</p>
        </div>

        {/* Clasp (White plastic lock part) */}
        <div className="absolute top-6 w-12 h-10 bg-[#f8f9fa] rounded-lg shadow-md border-b-4 border-[#e9ecef] flex items-center justify-center">
          <div className="w-6 h-2 bg-[#dee2e6] rounded-full" />
        </div>
        
        {/* Bottom subtle curve/crease styling */}
        <div className="absolute bottom-4 left-8 right-8 h-px bg-white/10" />
        <div className="absolute bottom-2 left-6 right-6 h-px bg-white/5" />
      </motion.div>
    </motion.div>
  );
}
