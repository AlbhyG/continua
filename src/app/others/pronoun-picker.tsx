"use client";

import { useState } from "react";
import { updatePronoun } from "@/app/actions/profile";

const LABELS = { he: "he / him", she: "she / her", they: "they / them" } as const;
type P = keyof typeof LABELS;

// Which pronoun the questions about you use. Shown wherever it matters.
export default function PronounPicker({ initial, name }: { initial: P; name: string }) {
  const [value, setValue] = useState<P>(initial);
  const [saved, setSaved] = useState<string | null>(null);

  async function change(next: P) {
    setValue(next);
    setSaved(null);
    const r = await updatePronoun(next);
    setSaved(r.ok ? "Saved." : r.message);
  }

  return (
    <label className="flex flex-wrap items-center gap-2">
      <span>
        Questions about {name ? <b>{name}</b> : "you"} will say
      </span>
      <select
        value={value}
        onChange={(e) => change(e.target.value as P)}
        className="rounded-lg border border-foreground/20 bg-white/80 px-2 py-1 text-foreground"
      >
        {(Object.keys(LABELS) as P[]).map((k) => (
          <option key={k} value={k}>
            {LABELS[k]}
          </option>
        ))}
      </select>
      {saved && <span className="text-xs text-foreground/60">{saved}</span>}
    </label>
  );
}
