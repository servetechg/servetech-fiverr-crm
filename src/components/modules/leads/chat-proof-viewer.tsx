"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import type { LostChatProof } from "@/types/leads/lost-chat-proof";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;

type ChatProofViewerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proof: LostChatProof;
  title: string;
  subtitle?: string;
};

function fileExtension(kind: LostChatProof["kind"], url: string): string {
  if (kind === "pdf") {
    return "pdf";
  }
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split(".").pop();
    if (ext && /^[a-z0-9]+$/i.test(ext)) {
      return ext;
    }
  } catch {
    /* use default */
  }
  return "png";
}

async function downloadUrl(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Download failed");
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = filename;
    anchor.rel = "noopener";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export function ChatProofViewer({
  open,
  onOpenChange,
  proof,
  title,
  subtitle,
}: ChatProofViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  const activeUrl = proof.urls[activeIndex] ?? proof.urls[0];
  const hasMultiple = proof.kind === "images" && proof.urls.length > 1;

  const downloadName = useMemo(() => {
    if (!activeUrl) {
      return "chat-proof";
    }
    const ext = fileExtension(proof.kind, activeUrl);
    if (proof.kind === "pdf") {
      return `chat-proof.${ext}`;
    }
    return `chat-proof-${activeIndex + 1}.${ext}`;
  }, [activeIndex, activeUrl, proof.kind]);

  const zoomOut = useCallback(() => {
    setZoom((value) => Math.max(MIN_ZOOM, Math.round((value - ZOOM_STEP) * 100) / 100));
  }, []);

  const zoomIn = useCallback(() => {
    setZoom((value) => Math.min(MAX_ZOOM, Math.round((value + ZOOM_STEP) * 100) / 100));
  }, []);

  const goPrev = useCallback(() => {
    setActiveIndex((index) => (index <= 0 ? proof.urls.length - 1 : index - 1));
    setZoom(1);
  }, [proof.urls.length]);

  const goNext = useCallback(() => {
    setActiveIndex((index) => (index >= proof.urls.length - 1 ? 0 : index + 1));
    setZoom(1);
  }, [proof.urls.length]);

  useEffect(() => {
    if (!open || !hasMultiple) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goNext, goPrev, hasMultiple, open]);

  if (!activeUrl) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-[#0b141a]/96 supports-backdrop-filter:backdrop-blur-none" />
        <DialogPrimitive.Popup
          className={cn(
            "fixed inset-0 z-50 flex flex-col outline-none",
            "data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          )}
        >
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/10 px-4 py-3 text-white sm:px-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{title}</p>
              {subtitle ? (
                <p className="truncate text-xs text-white/60">{subtitle}</p>
              ) : null}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full text-white hover:bg-white/10 hover:text-white"
                aria-label="Zoom out"
                onClick={zoomOut}
                disabled={zoom <= MIN_ZOOM}
              >
                <ZoomOut className="size-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full text-white hover:bg-white/10 hover:text-white"
                aria-label="Zoom in"
                onClick={zoomIn}
                disabled={zoom >= MAX_ZOOM}
              >
                <ZoomIn className="size-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full text-white hover:bg-white/10 hover:text-white"
                aria-label="Download"
                onClick={() => void downloadUrl(activeUrl, downloadName)}
              >
                <Download className="size-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="rounded-full text-white hover:bg-white/10 hover:text-white"
                aria-label="Close"
                onClick={() => onOpenChange(false)}
              >
                <X className="size-5" />
              </Button>
            </div>
          </header>

          <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[#0b141a]">
            {hasMultiple ? (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 z-10 size-10 -translate-y-1/2 rounded-full bg-black/40 text-white hover:bg-black/55 hover:text-white sm:left-4"
                  aria-label="Previous"
                  onClick={goPrev}
                >
                  <ChevronLeft className="size-6" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 z-10 size-10 -translate-y-1/2 rounded-full bg-black/40 text-white hover:bg-black/55 hover:text-white sm:right-4"
                  aria-label="Next"
                  onClick={goNext}
                >
                  <ChevronRight className="size-6" />
                </Button>
              </>
            ) : null}

            <div className="size-full overflow-auto p-4 sm:p-8">
              <div
                className="mx-auto flex min-h-full w-full items-center justify-center"
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: "transform 200ms ease-out",
                }}
              >
                {proof.kind === "pdf" ? (
                  <iframe
                    title="Chat proof PDF"
                    src={`${activeUrl}#toolbar=0&navpanes=0`}
                    className="h-[min(85vh,900px)] w-full max-w-4xl rounded-sm bg-white shadow-2xl"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element -- Cloudinary URLs are external; viewer needs full zoom control
                  <img
                    src={activeUrl}
                    alt={`Chat proof ${activeIndex + 1}`}
                    className="max-h-[85vh] w-auto max-w-full object-contain shadow-2xl"
                    draggable={false}
                  />
                )}
              </div>
            </div>
          </div>

          {hasMultiple ? (
            <footer className="shrink-0 border-t border-white/10 bg-[#111b21] px-4 py-3">
              <ul className="mx-auto flex max-w-3xl items-center justify-center gap-2 overflow-x-auto pb-1">
                {proof.urls.map((url, index) => (
                  <li key={url}>
                    <button
                      type="button"
                      className={cn(
                        "relative size-14 shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                        index === activeIndex ? "border-[#25d366]" : "border-transparent opacity-70 hover:opacity-100",
                      )}
                      onClick={() => {
                        setActiveIndex(index);
                        setZoom(1);
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="size-full object-cover" />
                    </button>
                  </li>
                ))}
              </ul>
            </footer>
          ) : proof.kind === "pdf" ? (
            <footer className="flex shrink-0 items-center justify-center gap-2 border-t border-white/10 bg-[#111b21] px-4 py-2 text-xs text-white/50">
              <FileText className="size-3.5" />
              PDF document
            </footer>
          ) : null}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
