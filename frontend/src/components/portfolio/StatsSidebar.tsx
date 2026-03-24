"use client";

import { motion } from "framer-motion";
import { PortfolioStats } from "@/types";

interface StatsSidebarProps {
  stats: PortfolioStats;
  contextLabel?: string;
}

export default function StatsSidebar({ stats, contextLabel }: StatsSidebarProps) {
  const sortedRoles = Object.entries(stats.roleDistribution).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <motion.aside
      className="w-full lg:w-80 flex-shrink-0 space-y-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {/* Context label */}
      {contextLabel && (
        <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
          📊 {contextLabel} 통계
        </p>
      )}

      {/* Overview stats */}
      <div className="stats-card">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          전체 요약
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-lg bg-[rgba(255,255,255,0.03)]">
            <div className="text-2xl font-bold text-[var(--text-primary)]">
              {stats.totalActivities}
            </div>
            <div className="text-[10px] text-[var(--text-tertiary)] mt-1">
              총 활동
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-[rgba(255,214,0,0.05)]">
            <div className="text-2xl font-bold text-[#ffd700]">
              {stats.totalAwards}
            </div>
            <div className="text-[10px] text-[var(--text-tertiary)] mt-1">
              수상 횟수
            </div>
          </div>
        </div>
      </div>

      {/* Role distribution */}
      <div className="stats-card">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
          기술 스택별 참여
        </h3>
        <div className="space-y-2">
          {sortedRoles.map(([role, count]) => (
            <div key={role} className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">
                {role}
              </span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background:
                        "linear-gradient(90deg, #667eea, #764ba2)",
                    }}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        (count / Math.max(...Object.values(stats.roleDistribution))) *
                        100
                      }%`,
                    }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </div>
                <span className="text-xs font-mono text-[var(--text-tertiary)] w-4 text-right">
                  {count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GitHub links */}
      {stats.githubLinks.length > 0 && (
        <div className="stats-card">
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">
            GitHub 프로젝트
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {stats.githubLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 p-2 rounded-lg hover:bg-[rgba(255,255,255,0.04)] transition-colors group"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="var(--text-tertiary)"
                  className="flex-shrink-0 mt-0.5 group-hover:fill-[var(--text-primary)] transition-colors"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="text-xs text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors line-clamp-1">
                  {link.title}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </motion.aside>
  );
}
