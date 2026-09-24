"use client";

import { useRef, useTransition } from "react";
import { FileText, ImageIcon, Loader2, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { LostChatProof } from "@/types/leads/lost-chat-proof";

type ChatProofUploadProps = {
  value: LostChatProof | null;
  onChange: (next: LostChatProof | null) => void;
  disabled?: boolean;
};

export function ChatProofUpload({ value, onChange, disabled }: ChatProofUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();

  const onFilesSelected = (files: FileList | null): void => {
    if (!files || files.length === 0) {
      return;
    }

    const selected = Array.from(files);
    const firstSelected = selected[0];
    if (!firstSelected) {
      return;
    }
    const isPdf = selected.length === 1 && firstSelected.type === "application/pdf";
    const isPng =
      selected.length >= 1 &&
      selected.length <= 3 &&
      selected.every((file) => file.type === "image/png");

    if (!isPdf && !isPng) {
      toast.error("Upload one PDF or up to three PNG images.");
      return;
    }

    startTransition(async () => {
      const formData = new FormData();
      for (const file of selected) {
        formData.append("files", file);
      }

      const response = await fetch("/api/cloudinary/lost-chat-proof", {
        method: "POST",
        body: formData,
      });

      const body: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
            ? body.error
            : "Upload failed.";
        toast.error(message);
        return;
      }

      const parsed = body as LostChatProof;
      onChange(parsed);
      toast.success(isPdf ? "PDF uploaded." : `${parsed.urls.length} image(s) uploaded.`);
    });
  };

  return (
    <div className="space-y-2">
      <Label>Chat proof (PDF or PNG)</Label>
      <p className="text-xs text-muted-foreground">Max 1 PDF or up to 3 PNG screenshots.</p>

      {value && value.urls.length > 0 ? (
        <ul className="space-y-2">
          {value.urls.map((url, index) => (
            <li
              key={url}
              className="flex items-center justify-between gap-2 rounded-xl border border-white/40 bg-muted/30 px-3 py-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                {value.kind === "pdf" ? (
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                  <ImageIcon className="size-4 shrink-0 text-muted-foreground" />
                )}
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="truncate text-sm underline underline-offset-2"
                >
                  {value.kind === "pdf" ? "Chat proof PDF" : `Screenshot ${index + 1}`}
                </a>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 rounded-full text-destructive"
                disabled={disabled || isPending}
                onClick={() => onChange(null)}
              >
                <Trash2 className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={disabled || isPending}
          onClick={() => inputRef.current?.click()}
        >
          {isPending ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {value ? "Replace files" : "Choose files"}
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/png"
          multiple
          className="hidden"
          disabled={disabled || isPending}
          onChange={(event) => {
            onFilesSelected(event.target.files);
            event.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
