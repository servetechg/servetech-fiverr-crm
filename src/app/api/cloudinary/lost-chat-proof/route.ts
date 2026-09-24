import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { getCloudinaryClient, getCloudinaryFolder } from "@/lib/cloudinary/client";
import type { LostChatProof } from "@/types/leads/lost-chat-proof";

const MAX_PNG_BYTES = 5 * 1024 * 1024;
const MAX_PDF_BYTES = 10 * 1024 * 1024;

function bufferFromFile(file: File): Promise<Buffer> {
  return file.arrayBuffer().then((arrayBuffer) => Buffer.from(arrayBuffer));
}

export async function POST(request: Request): Promise<Response> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const files = formData.getAll("files").filter((entry): entry is File => entry instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "Select at least one file." }, { status: 400 });
  }

  const firstFile = files[0];
  if (!firstFile) {
    return NextResponse.json({ error: "Select at least one file." }, { status: 400 });
  }

  const isPdf = files.length === 1 && firstFile.type === "application/pdf";
  const isPngBatch =
    files.length >= 1 &&
    files.length <= 3 &&
    files.every((file) => file.type === "image/png");

  if (!isPdf && !isPngBatch) {
    return NextResponse.json(
      { error: "Upload either one PDF or up to three PNG images (PNG only)." },
      { status: 400 },
    );
  }

  for (const file of files) {
    if (isPdf && file.size > MAX_PDF_BYTES) {
      return NextResponse.json({ error: "PDF must be 10 MB or smaller." }, { status: 400 });
    }
    if (!isPdf && file.size > MAX_PNG_BYTES) {
      return NextResponse.json({ error: "Each PNG must be 5 MB or smaller." }, { status: 400 });
    }
  }

  try {
    const cloudinary = getCloudinaryClient();
    const uploads: LostChatProof = { kind: isPdf ? "pdf" : "images", urls: [], publicIds: [] };

    for (const file of files) {
      const buffer = await bufferFromFile(file);
      const result = await cloudinary.uploader.upload(
        `data:${file.type};base64,${buffer.toString("base64")}`,
        {
          folder: `${getCloudinaryFolder()}/lost-chat-proof`,
          resource_type: isPdf ? "raw" : "image",
          format: isPdf ? "pdf" : undefined,
        },
      );
      uploads.urls.push(result.secure_url);
      uploads.publicIds.push(result.public_id);
    }

    return NextResponse.json(uploads);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
