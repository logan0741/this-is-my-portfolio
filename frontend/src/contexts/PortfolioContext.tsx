"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Activity, ViewMode } from "@/types";

interface PortfolioContextType {
  activities: Activity[];
  setActivities: (activities: Activity[]) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedActivities: Activity[];
  setSelectedActivities: (activities: Activity[]) => void;
  expandedFolders: Set<string>;
  toggleFolder: (key: string) => void;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(
  undefined
);

export function PortfolioProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("date");
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set()
  );

  const toggleFolder = useCallback((key: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  return (
    <PortfolioContext.Provider
      value={{
        activities,
        setActivities,
        viewMode,
        setViewMode,
        selectedActivities,
        setSelectedActivities,
        expandedFolders,
        toggleFolder,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx)
    throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}
