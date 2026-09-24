import type { FollowUpListItem } from "@/types/follow-ups/follow-up-list-item";

type FollowUpCardContentProps = {
  item: FollowUpListItem;
};

export function FollowUpCardContent({ item }: FollowUpCardContentProps) {
  return (
    <>
      <p className="font-medium text-foreground">{item.clientLabel}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        {item.leadCustomId} · {item.scheduledDate}
      </p>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
    </>
  );
}
