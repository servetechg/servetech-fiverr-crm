import { getCloudinaryClient } from "@/lib/cloudinary/client";
import type { LostChatProof } from "@/types/leads/lost-chat-proof";

export async function deleteLostChatProofAssets(
  proof: LostChatProof | null | undefined,
): Promise<void> {
  if (!proof || proof.publicIds.length === 0) {
    return;
  }

  const cloudinary = getCloudinaryClient();
  const resourceType = proof.kind === "pdf" ? "raw" : "image";

  for (const publicId of proof.publicIds) {
    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    } catch {
      // Best-effort cleanup — do not block CRM deletes if Cloudinary is unavailable.
    }
  }
}

export function orphanedLostChatProofPublicIds(
  previous: LostChatProof | null,
  next: LostChatProof | null,
): string[] {
  if (!previous) {
    return [];
  }
  const keep = new Set(next?.publicIds ?? []);
  return previous.publicIds.filter((id) => !keep.has(id));
}

export async function deleteLostChatProofPublicIds(publicIds: string[], kind: LostChatProof["kind"]): Promise<void> {
  if (publicIds.length === 0) {
    return;
  }
  await deleteLostChatProofAssets({ kind, urls: [], publicIds });
}
