"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import GlassButton from "@/components/ui/GlassButton";
import { Activity } from "@/types";
import { Suspense } from "react";

const isVercel = process.env.NEXT_PUBLIC_IS_VERCEL === "true";

const TERM_OPTIONS = ["1학기", "여름방학", "2학기", "겨울방학"];
const DEFAULT_CATEGORIES = ["프로젝트", "대회", "캡스톤", "캠프"];
const DEFAULT_ROLES = [
  "Backend",
  "Frontend",
  "Data Engineer",
  "Algorithm Developer",
];

function AdminContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [roles, setRoles] = useState(DEFAULT_ROLES);
  const [alert, setAlert] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    id: uuidv4(),
    year: new Date().getFullYear(),
    term: "",
    category: "",
    selectedRoles: [] as string[],
    title: "",
    is_awarded: false,
    award_title: "",
    github_url: "",
    reflection: "",
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [certFiles, setCertFiles] = useState<File[]>([]);
  const [customCategory, setCustomCategory] = useState("");
  const [customRole, setCustomRole] = useState("");

  // Redirect on Vercel
  useEffect(() => {
    if (isVercel) {
      router.replace("/");
    }
  }, [router]);

  // Load existing data for editing
  useEffect(() => {
    if (editId) {
      fetch("/data.json")
        .then((res) => res.json())
        .then((data: Activity[]) => {
          const activity = data.find((a) => a.id === editId);
          if (activity) {
            setFormData({
              id: activity.id,
              year: activity.year,
              term: activity.term,
              category: activity.category,
              selectedRoles: activity.roles,
              title: activity.title,
              is_awarded: activity.is_awarded,
              award_title: activity.award_title || "",
              github_url: activity.github_url || "",
              reflection: activity.reflection,
            });
          }
        });
    }
  }, [editId]);

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - 2019 },
    (_, i) => currentYear - i
  );

  // Validation
  const canProceedStep1 = formData.term !== "" && formData.category !== "";
  const canProceedStep1_1 = formData.selectedRoles.length > 0;
  const canSubmit =
    formData.title !== "" &&
    (imageFiles.length > 0 || editId);

  const addCustomCategory = useCallback(() => {
    if (customCategory.trim() && !categories.includes(customCategory.trim())) {
      setCategories((prev) => [...prev, customCategory.trim()]);
      setFormData((prev) => ({ ...prev, category: customCategory.trim() }));
      setCustomCategory("");
    }
  }, [customCategory, categories]);

  const addCustomRole = useCallback(() => {
    if (customRole.trim() && !roles.includes(customRole.trim())) {
      setRoles((prev) => [...prev, customRole.trim()]);
      setFormData((prev) => ({
        ...prev,
        selectedRoles: [...prev.selectedRoles, customRole.trim()],
      }));
      setCustomRole("");
    }
  }, [customRole, roles]);

  const toggleRole = (role: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(role)
        ? prev.selectedRoles.filter((r) => r !== role)
        : [...prev.selectedRoles, role],
    }));
  };

  const handleNext = () => {
    if (step === 1 && !canProceedStep1) {
      setAlert("학기와 카테고리를 선택해주세요.");
      return;
    }
    if (step === 1.5 && !canProceedStep1_1) {
      setAlert("역할을 하나 이상 선택해주세요.");
      return;
    }
    setAlert(null);
    if (step === 1) setStep(1.5);
    else if (step === 1.5) setStep(2);
  };

  const handleBack = () => {
    setAlert(null);
    if (step === 2) setStep(1.5);
    else if (step === 1.5) setStep(1);
  };

  const handleSubmit = async () => {
    if (!canSubmit) {
      setAlert("제목과 이미지를 작성하세요.");
      return;
    }

    const submitData = new FormData();
    submitData.append("id", formData.id);
    submitData.append("year", String(formData.year));
    submitData.append("term", formData.term);
    submitData.append("category", formData.category);
    submitData.append("roles", JSON.stringify(formData.selectedRoles));
    submitData.append("title", formData.title);
    submitData.append("is_awarded", String(formData.is_awarded));
    submitData.append("award_title", formData.award_title);
    submitData.append("github_url", formData.github_url);
    submitData.append("reflection", formData.reflection);

    imageFiles.forEach((f) => submitData.append("images", f));
    certFiles.forEach((f) => submitData.append("certificates", f));

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const endpoint = editId
        ? `${apiUrl}/api/portfolio/${editId}`
        : `${apiUrl}/api/portfolio`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(endpoint, { method, body: submitData });
      if (res.ok) {
        router.push("/portfolio");
      } else {
        setAlert("전송에 실패했습니다. 백엔드 서버를 확인해주세요.");
      }
    } catch {
      setAlert("서버에 연결할 수 없습니다. Phase 2에서 백엔드를 구성해주세요.");
    }
  };

  if (isVercel) return null;

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header */}
      <motion.header
        className="sticky top-0 z-50 px-6 py-4"
        style={{
          background: "rgba(10, 10, 26, 0.8)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.back()}
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
            <span className="text-sm font-medium">돌아가기</span>
          </button>
          <h1 className="text-lg font-semibold">
            {editId ? "활동 수정" : "새 활동 추가"}
          </h1>
          <div className="w-20" />
        </div>
      </motion.header>

      {/* Step indicator */}
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="flex items-center gap-2 mb-8">
          {[1, 1.5, 2].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                  step >= s
                    ? "bg-[rgba(102,126,234,0.3)] text-[var(--text-primary)] border border-[rgba(102,126,234,0.5)]"
                    : "bg-[rgba(255,255,255,0.04)] text-[var(--text-tertiary)] border border-[rgba(255,255,255,0.08)]"
                }`}
              >
                {i + 1}
              </div>
              {i < 2 && (
                <div
                  className={`w-12 h-0.5 rounded ${
                    step > s
                      ? "bg-[rgba(102,126,234,0.5)]"
                      : "bg-[rgba(255,255,255,0.08)]"
                  }`}
                />
              )}
            </div>
          ))}
          <span className="ml-3 text-xs text-[var(--text-tertiary)]">
            {step === 1
              ? "기본 정보"
              : step === 1.5
              ? "역할 선택"
              : "상세 내용"}
          </span>
        </div>

        {/* Alert */}
        <AnimatePresence>
          {alert && (
            <motion.div
              className="mb-6 p-4 rounded-xl bg-[rgba(245,87,108,0.1)] border border-[rgba(245,87,108,0.3)] text-[#f5576c] text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              ⚠️ {alert}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
              className="glass p-8 space-y-6"
            >
              <h2 className="text-xl font-semibold mb-2">기본 정보</h2>

              {/* Year */}
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  년도
                </label>
                <select
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: Number(e.target.value) })
                  }
                  className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:border-[rgba(102,126,234,0.5)] focus:outline-none transition-colors"
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y} className="bg-[#111127]">
                      {y}년
                    </option>
                  ))}
                </select>
              </div>

              {/* Term */}
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  학기
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TERM_OPTIONS.map((t) => (
                    <motion.button
                      key={t}
                      className={`p-3 rounded-xl text-sm font-medium transition-all ${
                        formData.term === t
                          ? "bg-[rgba(102,126,234,0.2)] border border-[rgba(102,126,234,0.4)] text-[var(--text-primary)]"
                          : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.07)]"
                      }`}
                      onClick={() => setFormData({ ...formData, term: t })}
                      whileTap={{ scale: 0.97 }}
                    >
                      {t}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  카테고리
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {categories.map((c) => (
                    <motion.button
                      key={c}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        formData.category === c
                          ? "bg-[rgba(102,126,234,0.2)] border border-[rgba(102,126,234,0.4)] text-[var(--text-primary)]"
                          : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.07)]"
                      }`}
                      onClick={() => setFormData({ ...formData, category: c })}
                      whileTap={{ scale: 0.97 }}
                    >
                      {c}
                    </motion.button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="직접 추가하기"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCustomCategory()}
                    className="flex-1 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[rgba(102,126,234,0.5)] focus:outline-none"
                  />
                  <GlassButton onClick={addCustomCategory} className="text-sm px-4 py-2">
                    추가
                  </GlassButton>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 1.5: Roles */}
          {step === 1.5 && (
            <motion.div
              key="step1-5"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
              className="glass p-8 space-y-6"
            >
              <h2 className="text-xl font-semibold mb-2">역할 선택</h2>
              <p className="text-sm text-[var(--text-tertiary)]">
                이 활동에서 담당한 역할을 선택해주세요 (복수 선택 가능)
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {roles.map((role) => (
                  <motion.button
                    key={role}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      formData.selectedRoles.includes(role)
                        ? "bg-[rgba(102,126,234,0.2)] border border-[rgba(102,126,234,0.4)] text-[var(--text-primary)]"
                        : "bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-[var(--text-secondary)] hover:bg-[rgba(255,255,255,0.07)]"
                    }`}
                    onClick={() => toggleRole(role)}
                    whileTap={{ scale: 0.97 }}
                  >
                    {formData.selectedRoles.includes(role) ? "✓ " : ""}
                    {role}
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="직접 추가"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCustomRole()}
                  className="flex-1 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[rgba(102,126,234,0.5)] focus:outline-none"
                />
                <GlassButton onClick={addCustomRole} className="text-sm px-4 py-2">
                  역할 추가하기
                </GlassButton>
              </div>
            </motion.div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
              className="glass p-8 space-y-6"
            >
              <h2 className="text-xl font-semibold mb-2">상세 내용</h2>

              {/* Title */}
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  활동 제목 *
                </label>
                <input
                  type="text"
                  placeholder="예: AI 기반 음성 분류 시스템"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[rgba(102,126,234,0.5)] focus:outline-none"
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  프로젝트 이미지 *
                </label>
                <div className="border-2 border-dashed border-[rgba(255,255,255,0.1)] rounded-xl p-6 text-center hover:border-[rgba(102,126,234,0.3)] transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) =>
                      setImageFiles(Array.from(e.target.files || []))
                    }
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <div className="text-3xl mb-2">📷</div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      클릭하여 이미지 업로드
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                      여러 파일 선택 가능
                    </p>
                  </label>
                </div>
                {imageFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {imageFiles.map((f, i) => (
                      <span
                        key={i}
                        className="text-xs bg-[rgba(255,255,255,0.06)] px-3 py-1.5 rounded-lg text-[var(--text-secondary)]"
                      >
                        📎 {f.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Certificate upload */}
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  증거 자료 (인증서, 수상장 등)
                </label>
                <div className="border-2 border-dashed border-[rgba(255,255,255,0.1)] rounded-xl p-6 text-center hover:border-[rgba(255,214,0,0.3)] transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={(e) =>
                      setCertFiles(Array.from(e.target.files || []))
                    }
                    className="hidden"
                    id="cert-upload"
                  />
                  <label htmlFor="cert-upload" className="cursor-pointer">
                    <div className="text-3xl mb-2">📄</div>
                    <p className="text-sm text-[var(--text-secondary)]">
                      클릭하여 증거 자료 업로드
                    </p>
                  </label>
                </div>
                {certFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {certFiles.map((f, i) => (
                      <span
                        key={i}
                        className="text-xs bg-[rgba(255,214,0,0.05)] border border-[rgba(255,214,0,0.15)] px-3 py-1.5 rounded-lg text-[var(--text-secondary)]"
                      >
                        📄 {f.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Award toggle */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm text-[var(--text-secondary)]">
                    수상 여부
                  </label>
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        is_awarded: !formData.is_awarded,
                      })
                    }
                    className={`w-12 h-6 rounded-full transition-all relative ${
                      formData.is_awarded
                        ? "bg-[rgba(102,126,234,0.5)]"
                        : "bg-[rgba(255,255,255,0.1)]"
                    }`}
                  >
                    <motion.div
                      className="w-5 h-5 bg-white rounded-full absolute top-0.5"
                      animate={{ left: formData.is_awarded ? 26 : 2 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  </button>
                </div>
                <AnimatePresence>
                  {formData.is_awarded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <input
                        type="text"
                        placeholder="수상 제목 (예: 대상, 우수상)"
                        value={formData.award_title}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            award_title: e.target.value,
                          })
                        }
                        className="w-full mt-3 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[rgba(255,214,0,0.5)] focus:outline-none"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* GitHub URL */}
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  GitHub URL (선택)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/..."
                  value={formData.github_url}
                  onChange={(e) =>
                    setFormData({ ...formData, github_url: e.target.value })
                  }
                  className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[rgba(102,126,234,0.5)] focus:outline-none"
                />
              </div>

              {/* Reflection */}
              <div>
                <label className="block text-sm text-[var(--text-secondary)] mb-2">
                  한 줄 회고 (선택)
                </label>
                <textarea
                  placeholder="이 활동을 통해 배운 점이나 느낀 점..."
                  value={formData.reflection}
                  onChange={(e) =>
                    setFormData({ ...formData, reflection: e.target.value })
                  }
                  rows={3}
                  className="w-full bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-tertiary)] focus:border-[rgba(102,126,234,0.5)] focus:outline-none resize-none"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <GlassButton onClick={handleBack} className="text-sm">
              ← 뒤로가기
            </GlassButton>
          ) : (
            <div />
          )}

          {step < 2 ? (
            <GlassButton
              variant="primary"
              onClick={handleNext}
              className="text-sm"
            >
              다음 →
            </GlassButton>
          ) : (
            <GlassButton
              variant="primary"
              onClick={handleSubmit}
              className="text-sm"
            >
              {editId ? "수정 완료" : "작성 완료"} ✓
            </GlassButton>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-[var(--text-secondary)]">로딩 중...</p>
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}
