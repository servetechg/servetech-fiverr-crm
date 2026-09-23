import { MODULE_PLACEHOLDERS } from "@/config/navigation";

export function getModulePlaceholder(path: keyof typeof MODULE_PLACEHOLDERS) {
  const entry = MODULE_PLACEHOLDERS[path];
  if (!entry) {
    throw new Error(`Unknown module path: ${path}`);
  }
  return entry;
}
