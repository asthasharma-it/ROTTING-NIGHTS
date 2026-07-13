import { WatchStatusType } from "@/types/media";

export const STATUS_ORDER: WatchStatusType[] = [
  "NOPE",
  "MAYBE",
  "DEFINITELY",
  "ONGOING",
  "WATCHED",
];

export const STATUS_META: Record<
  WatchStatusType,
  { label: string; emoji: string; color: string }
> = {
  NOPE: { label: "Nope", emoji: "\u{1F6AB}", color: "var(--status-nope)" },
  MAYBE: { label: "Maybe", emoji: "\u{1F914}", color: "var(--status-maybe)" },
  DEFINITELY: { label: "Definitely", emoji: "✅", color: "var(--status-definitely)" },
  ONGOING: { label: "Ongoing", emoji: "▶️", color: "var(--status-ongoing)" },
  WATCHED: { label: "Watched", emoji: "✔️", color: "var(--status-watched)" },
};
