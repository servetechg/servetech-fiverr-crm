"use client";

import type { ReactNode } from "react";
import { createContext, useContext } from "react";

import type { LeadListItem } from "@/types/leads/lead-list-item";

type LeadsActionsContextValue = {
  onEdit: (id: number) => void;
  onDelete: (row: LeadListItem) => void;
};

const LeadsActionsContext = createContext<LeadsActionsContextValue | null>(null);

export function LeadsActionsProvider({
  value,
  children,
}: {
  value: LeadsActionsContextValue;
  children: ReactNode;
}) {
  return <LeadsActionsContext.Provider value={value}>{children}</LeadsActionsContext.Provider>;
}

export function useLeadsActions(): LeadsActionsContextValue {
  const context = useContext(LeadsActionsContext);
  if (!context) {
    throw new Error("useLeadsActions must be used within LeadsActionsProvider");
  }
  return context;
}
