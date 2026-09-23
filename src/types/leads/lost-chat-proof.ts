import { z } from "zod";

export const lostChatProofSchema = z.object({
  kind: z.enum(["pdf", "images"]),
  urls: z.array(z.string().url()).min(1).max(3),
  publicIds: z.array(z.string().min(1)).min(1).max(3),
});

export type LostChatProof = z.infer<typeof lostChatProofSchema>;

export function parseLostChatProof(value: unknown): LostChatProof | null {
  const parsed = lostChatProofSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}
