"use client";

import { useState } from "react";
import { updatePronoun } from "@/app/actions/profile";

const LABELS = { he: "he / him", she: "she / her", they: "they / them" } as const;
type P = keyof typeof LABELS;

// Which pronoun the questions about you use. Starts empty until you choose,
// so it is never left at a default by accident.
export default function PronounPicker({
  initial,
  name,
  onChosen,
}: {
  initial: P | null;
  name: string;
  onChosen?: (p: P) => void;
}) {
  const [value, setValue] = useState<P | "">(initial ?? "");
  const [saved, setSaved] = useState<string | null>(null);

  async function change(next: P) {
    setValue(next);
    setSaved(null);
    const r = await updatePronoun(next);
    setSaved(r.ok ? "Saved." : r.message);
    if (r.ok) onChosen?.(next);
  }

  const first = name ? name.trim().split(/\s+/)[0] : "";
  return (
    <div>
      <label className="flex flex-wrap items-center gap-2">
        <span>
          Questions about {first ? <b>{first}</b> : "you"} should say
        </span>
        <select
          value={value}
          onChange={(e) => change(e.target.value as P)}
          className={`rounded-lg border bg-white/80 px-2 py-1 text-foreground ${value ? "border-foreground/20" : "border-accent"}`}
        >
          {!value && <option value="">Choose…</option>}
          {(Object.keys(LABELS) as P[]).map((k) => (
            <option key={k} value={k}>
              {LABELS[k]}
            </option>
          ))}
        </select>
        {saved && <span className="text-xs text-foreground/60">{saved}</span>}
      </label>
      {!value && (
        <p className="mt-1 text-xs text-foreground/60">
          Choose this once before your first invitation; you can change it any time.
        </p>
      )}
    </div>
  );
}
