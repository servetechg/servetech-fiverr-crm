export const ACTIVE_STATUS_SELECT_ITEMS: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
};

export function activeStatusSelectValue(isActive: boolean): "active" | "inactive" {
  return isActive ? "active" : "inactive";
}

export function parseActiveStatusSelectValue(value: string | null): boolean {
  return value === "active";
}
