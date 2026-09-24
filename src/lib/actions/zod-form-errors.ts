import { flattenError, type ZodError } from "zod";

export function zodFieldErrors(error: ZodError): Record<string, string[]> {
  return flattenError(error).fieldErrors as Record<string, string[]>;
}
