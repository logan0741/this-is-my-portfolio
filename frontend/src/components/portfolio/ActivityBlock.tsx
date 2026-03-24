"use client";

import { Activity } from "@/types";
import { parseGithubName } from "@/lib/data";
import { useState } from "react";
import { motion } from "framer-motion";
import QuickLookModal from "./QuickLookModal";
import Link from "next/link";
import Image from "next/image";

const isVercel = process.env.NEXT_PUBLIC_IS_VERCEL === "true";

interface ActivityBlockProps {
  activity: Activity;
}

export default function ActivityBlock({ activity }: ActivityBlockProps) {
  const [quickLookImage, setQuickLookImage] = useState<string | null>(null);

  return (
    <>
      <div className="activity-block relative group">
        {/* Top row: title + award */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-snug pr-4">
            {activity.title}
          </h3>
          {activity.is_awarded && activity.award_title && (
            <span className="award-badge flex-shrink-0">
              🏆 {activity.award_title}
            </span>
          )}
        </div>

        {/* Roles */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {activity.roles.map((role) => (
            <span key={role} className="role-tag">
              {role}
            </span>
          ))}
        </div>

        {/* Bottom row: github + thumbnails */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* GitHub link */}
            {activity.github_url && (
              <a
                href={activity.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="font-mono">
                  {parseGithubName(activity.github_url)}
                </span>
              </a>
            )}
          </div>

          {/* Thumbnails */}
          <div className="flex items-center gap-1.5">
            {/* Image thumbnails */}
            {activity.images.slice(0, 2).map((img, i) => (
              <div
                key={`img-${i}`}
                className="relative w-10 h-10 rounded-lg overflow-hidden border border-[rgba(255,255,255,0.1)] cursor-pointer hover:border-[rgba(102,126,234,0.5)] transition-all hover:scale-110"
                onClick={() => setQuickLookImage(img)}
              >
                <Image
                  src={img}
                  alt={`${activity.title} image ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
            {/* Certificate thumbnails */}
            {activity.certificates.slice(0, 2).map((cert, i) => (
              <div
                key={`cert-${i}`}
                className="relative w-10 h-10 rounded-lg overflow-hidden border border-[rgba(255,214,0,0.2)] cursor-pointer hover:border-[rgba(255,214,0,0.5)] transition-all hover:scale-110"
                onClick={() => setQuickLookImage(cert)}
              >
                <Image
                  src={cert}
                  alt={`${activity.title} certificate ${i + 1}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-[rgba(0,0,0,0.3)]">
                  <span className="text-[10px]">📄</span>
                </div>
              </div>
            ))}
            {activity.images.length + activity.certificates.length > 4 && (
              <span className="text-xs text-[var(--text-tertiary)]">
                +{activity.images.length + activity.certificates.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Reflection preview (collapsed) */}
        {activity.reflection && (
          <p className="mt-3 text-xs text-[var(--text-tertiary)] line-clamp-2 leading-relaxed">
            {activity.reflection}
          </p>
        )}

        {/* Edit button (non-Vercel only) */}
        {!isVercel && (
          <motion.div
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
            whileHover={{ scale: 1.05 }}
          >
            <Link
              href={`/admin?id=${activity.id}`}
              className="text-xs text-[var(--text-secondary)] bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] border border-[rgba(255,255,255,0.1)] px-3 py-1.5 rounded-lg transition-all"
            >
              수정하기
            </Link>
          </motion.div>
        )}
      </div>

      {/* Quick Look Modal */}
      {quickLookImage && (
        <QuickLookModal
          imageSrc={quickLookImage}
          onClose={() => setQuickLookImage(null)}
        />
      )}
    </>
  );
}
