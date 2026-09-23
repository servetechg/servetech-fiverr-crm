export type LeadFilterOption = {
  id: number;
  label: string;
};

export type LeadFilterOptions = {
  fiverrAccounts: LeadFilterOption[];
  services: LeadFilterOption[];
  salespeople: LeadFilterOption[];
};
