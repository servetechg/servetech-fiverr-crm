"use client";

import { FileText, ImageIcon } from "lucide-react";
import { useState } from "react";

import { ChatProofViewer } from "@/components/modules/leads/chat-proof-viewer";
import { Button } from "@/components/ui/button";
import type { LostChatProof } from "@/types/leads/lost-chat-proof";

type ChatProofTableCellProps = {
  proof: LostChatProof | null;
  leadCustomId: string;
  clientLabel: string;
};

export function ChatProofTableCell({ proof, leadCustomId, clientLabel }: ChatProofTableCellProps) {
  const [open, setOpen] = useState(false);
  const [viewerKey, setViewerKey] = useState(0);

  if (!proof || proof.urls.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  const label =
    proof.kind === "pdf"
      ? "View PDF"
      : proof.urls.length === 1
        ? "View image"
        : `${proof.urls.length} images`;

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 max-w-[9rem] gap-1.5 rounded-full px-2.5 font-normal text-foreground hover:bg-muted/60"
        onClick={() => {
          setViewerKey((key) => key + 1);
          setOpen(true);
        }}
      >
        {proof.kind === "pdf" ? (
          <FileText className="size-3.5 shrink-0 text-muted-foreground" />
        ) : (
          <ImageIcon className="size-3.5 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate underline-offset-2 hover:underline">{label}</span>
      </Button>
      <ChatProofViewer
        key={viewerKey}
        open={open}
        onOpenChange={setOpen}
        proof={proof}
        title={leadCustomId}
        subtitle={clientLabel}
      />
    </>
  );
}
