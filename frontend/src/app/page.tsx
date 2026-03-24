"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import GlassButton from "@/components/ui/GlassButton";

const isVercel = process.env.NEXT_PUBLIC_IS_VERCEL === "true";

export default function HomePage() {
  return (
    <main className="relative flex flex-col items-center justify-center min-h-screen px-6">
      <AnimatedBackground />

      {/* Hero Section */}
      <motion.div
        className="text-center z-10 max-w-2xl"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Apple-style small label */}
        <motion.p
          className="text-sm font-medium tracking-widest uppercase mb-4"
          style={{ color: "var(--text-tertiary)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Chonnam National University · AI Major
        </motion.p>

        {/* Main title */}
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-4 leading-tight"
          style={{
            background: "linear-gradient(135deg, #f5f5f7 0%, #a0a0b0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          김건희
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg md:text-xl mb-2 font-light"
          style={{ color: "var(--text-secondary)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          대학생활에서 얻는 경험과 감정들의 기록
        </motion.p>

        {/* Descriptive text */}
        <motion.p
          className="text-sm mb-10 max-w-md mx-auto leading-relaxed"
          style={{ color: "var(--text-tertiary)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          프로젝트, 대회, 캡스톤 디자인, 그리고 다양한 활동들을
          <br />
          애플 감성의 서류첩(Expanding File Folder)에 담았습니다.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <Link href="/portfolio">
            <GlassButton variant="primary" className="text-base px-8 py-3.5">
              <span className="flex items-center gap-2">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                포트폴리오 보러가기
              </span>
            </GlassButton>
          </Link>

          {!isVercel && (
            <Link href="/admin">
              <GlassButton className="text-base px-8 py-3.5">
                <span className="flex items-center gap-2">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  내용 추가하기
                </span>
              </GlassButton>
            </Link>
          )}
        </motion.div>
      </motion.div>

      {/* Bottom floating effect */}
      <motion.div
        className="absolute bottom-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
          </svg>
        </motion.div>
      </motion.div>
    </main>
  );
}
