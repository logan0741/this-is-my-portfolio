"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Activity, ViewMode } from "@/types";
import { groupByDate, groupByCategory, computeStats } from "@/lib/data";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import FolderAccordion from "@/components/portfolio/FolderAccordion";
import StatsSidebar from "@/components/portfolio/StatsSidebar";
import RealisticFolder from "@/components/portfolio/RealisticFolder";
import GlassButton from "@/components/ui/GlassButton";

export default function PortfolioPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  // Initially null to show the 2 realistic folders selection screen
  const [viewMode, setViewMode] = useState<ViewMode>(null);
  const [selectedContext, setSelectedContext] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/data.json")
      .then((res) => res.json())
      .then((data: Activity[]) => {
        setActivities(data);
        setSelectedContext(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const dateGroups = useMemo(() => groupByDate(activities), [activities]);
  const categoryGroups = useMemo(
    () => groupByCategory(activities),
    [activities]
  );
  const stats = useMemo(
    () => computeStats(selectedContext.length > 0 ? selectedContext : activities),
    [selectedContext, activities]
  );

  const handleSelectMode = (mode: "date" | "purpose") => {
    setViewMode(mode);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <motion.div
          className="glass p-8 text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <p className="text-[var(--text-secondary)]">로딩 중...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Dynamic Header */}
      <motion.header
        className="sticky top-0 z-50 px-6 py-4"
        style={{
          background: "rgba(10, 10, 26, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (viewMode) setViewMode(null);
              else router.push("/");
            }}
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          >
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
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">
              {viewMode ? "폴더 선택으로" : "메인으로"}
            </span>
          </button>

          <h1 className="text-lg font-semibold text-[var(--text-primary)]">
            {viewMode === "date"
              ? "📆 날짜별 포트폴리오"
              : viewMode === "purpose"
              ? "🎯 목적성 포트폴리오"
              : "포트폴리오 보관함"}
          </h1>

          <div className="w-20" /> {/* Spacer for centering */}
        </div>
      </motion.header>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {!viewMode ? (
          // ------------------------------------------------------------------
          // Folder Selection Screen (2 Large Realistic Folders)
          // ------------------------------------------------------------------
          <motion.div
            key="folder-selection"
            className="max-w-5xl mx-auto px-6 py-12 md:py-24"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                포트폴리오 열람 방식 선택
              </h2>
              <p className="text-[var(--text-secondary)]">
                어떤 서류첩을 열어보시겠습니까?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
              <RealisticFolder
                title="날짜별로 보기"
                subtitle="년도 및 학기 순서로 정리된 기록"
                colorPreset="teal"
                icon="📅"
                onClick={() => handleSelectMode("date")}
              />
              <RealisticFolder
                title="목적성 위주로 보기"
                subtitle="대회, 프로젝트, 캡스톤 등 카테고리별"
                colorPreset="navy"
                icon="🎯"
                onClick={() => handleSelectMode("purpose")}
              />
            </div>
          </motion.div>
        ) : (
          // ------------------------------------------------------------------
          // Detailed Portfolio View (Accordions + Sidebar)
          // ------------------------------------------------------------------
          <motion.div
            key="portfolio-content"
            className="max-w-7xl mx-auto px-6 py-8 flex flex-col lg:flex-row gap-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
          >
            {/* Folder content area */}
            <main className="flex-1 min-w-0">
              {viewMode === "date" ? (
                /* 날짜별로 보기 */
                <div className="space-y-4">
                  {dateGroups.map((yearGroup) => (
                    <FolderAccordion
                      key={yearGroup.year}
                      label={`${yearGroup.year}년`}
                      sublabel={`${yearGroup.terms.reduce((sum, t) => sum + t.activities.length, 0)}개 활동`}
                      activities={yearGroup.terms.flatMap((t) => t.activities)}
                      onSelectActivities={setSelectedContext}
                      depth={0}
                    >
                      {/* Sub-folders by term */}
                      {yearGroup.terms.map((termGroup) => (
                        <FolderAccordion
                          key={`${yearGroup.year}-${termGroup.term}`}
                          label={termGroup.term}
                          activities={termGroup.activities}
                          onSelectActivities={setSelectedContext}
                          depth={1}
                        />
                      ))}
                    </FolderAccordion>
                  ))}
                </div>
              ) : (
                /* 목적성 위주로 보기 */
                <div className="space-y-4">
                  {categoryGroups.map((catGroup) => (
                    <FolderAccordion
                      key={catGroup.category}
                      label={catGroup.category}
                      sublabel={`${catGroup.activities.length}개 활동`}
                      activities={catGroup.activities}
                      onSelectActivities={setSelectedContext}
                      depth={0}
                    />
                  ))}
                </div>
              )}

              {activities.length === 0 && (
                <div className="glass p-12 text-center mt-8">
                  <p className="text-[var(--text-tertiary)] text-lg mb-2">
                    아직 등록된 활동이 없습니다
                  </p>
                  <p className="text-[var(--text-tertiary)] text-sm mb-6">
                    "내용 추가하기"를 눌러 활동을 추가해보세요.
                  </p>
                  <Link href="/admin">
                    <GlassButton variant="primary">추가하러 가기</GlassButton>
                  </Link>
                </div>
              )}
            </main>

            {/* Sidebar */}
            <StatsSidebar
              stats={stats}
              contextLabel={
                selectedContext.length < activities.length
                  ? "선택된 폴더"
                  : "전체"
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
