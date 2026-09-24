"use client";

type Option = {
  id: number;
  label: string;
};

export function resolveOptionLabel(
  options: Option[],
  id: number | undefined,
  placeholder: string,
): string {
  if (!id) {
    return placeholder;
  }
  return options.find((option) => option.id === id)?.label ?? placeholder;
}

type FormSelectTriggerLabelProps = {
  value: string;
  placeholder?: string;
};

export function FormSelectTriggerLabel({ value, placeholder = "Select…" }: FormSelectTriggerLabelProps) {
  const isPlaceholder = !value || value === placeholder;
  return (
    <span className={isPlaceholder ? "text-muted-foreground" : "text-foreground"}>{value || placeholder}</span>
  );
}
