"use client";

import { useEffect, useState } from "react";

// Formats a timestamp in the viewer's own time zone. The server renders in
// UTC, so the time is filled in after the page loads in the browser; until
// then only the date is shown, to avoid a time that is hours off.
export const formatDateTime = (iso: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));

export default function LocalDateTime({ iso, className }: { iso: string; className?: string }) {
  const [text, setText] = useState<string | null>(null);
  useEffect(() => setText(formatDateTime(iso)), [iso]);
  return (
    <time dateTime={iso} className={className}>
      {text ??
        new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(
          new Date(iso)
        )}
    </time>
  );
}
