export const LOST_REASON_VALUES = [
  "PriceTooHigh",
  "ClientStoppedResponding",
  "WentWithAnotherSeller",
  "NoBudget",
  "RequirementOutsideScope",
  "DeliveryTimeIssue",
  "ClientCancelled",
  "FiverrIssue",
  "CompetitorSelected",
  "Other",
] as const;

export type LostReasonValue = (typeof LOST_REASON_VALUES)[number];

export const LOST_REASON_LABELS: Record<LostReasonValue, string> = {
  PriceTooHigh: "Price Too High",
  ClientStoppedResponding: "Client Stopped Responding",
  WentWithAnotherSeller: "Went With Another Seller",
  NoBudget: "No Budget",
  RequirementOutsideScope: "Requirement Outside Scope",
  DeliveryTimeIssue: "Delivery Time Issue",
  ClientCancelled: "Client Cancelled",
  FiverrIssue: "Fiverr Issue",
  CompetitorSelected: "Competitor Selected",
  Other: "Other",
};

export const LOST_REASON_OPTIONS = LOST_REASON_VALUES.map((value) => ({
  value,
  label: LOST_REASON_LABELS[value],
}));
