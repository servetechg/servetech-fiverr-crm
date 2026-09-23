import type { ZodError } from "zod";

export function zodFieldErrors(error: ZodError): Record<string, string[]> {
  return error.flatten().fieldErrors as Record<string, string[]>;
}
