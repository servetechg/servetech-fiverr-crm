"use client";

type ActiveInactiveSelectLabelProps = {
  isActive: boolean;
};

export function ActiveInactiveSelectLabel({ isActive }: ActiveInactiveSelectLabelProps) {
  return <span>{isActive ? "Active" : "Inactive"}</span>;
}
