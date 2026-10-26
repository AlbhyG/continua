"use client";

import { useState, useTransition } from "react";
import { updatePronoun } from "@/app/actions/profile";
import { EXAMPLE_TEMPLATE, PRONOUNS, itemName, renderItem, type Pronoun } from "@/lib/observer/pronouns";

// Chosen by example sentence, not by naming pronouns: the person picks how the
// statements about them should read. Saved as soon as it changes.
export default function PronounPicker({
  displayName,
  initial,
  chosen,
}: {
  displayName: string;
  initial: Pronoun;
  chosen: boolean;
}) {
  // Nothing is selected until the person has chosen; until then statements
  // read with "their" (the default), and the text says so.
  const [value, setValue] = useState<Pronoun | null>(chosen ? initial : null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const name = itemName(displayName);

  function choose(p: Pronoun) {
    const previous = value;
    setValue(p);
    setStatus(null);
    startTransition(async () => {
      const result = await updatePronoun(p);
      if (result?.success) {
        setStatus("Saved.");
      } else {
        setValue(previous);
        setStatus(result?.message ?? "Your choice could not be saved.");
      }
    });
  }

  return (
    <fieldset className="glass-card mt-3 p-5" aria-busy={pending}>
      <legend className="sr-only">How should the statements about you read?</legend>
      <p className="font-semibold" aria-hidden="true">
        How should the statements about you read?
      </p>
      <p className="mt-1 text-sm text-foreground/70">
        {value
          ? "People you invite see the statements written this way."
          : "Choose one. Until you do, people you invite see the last version."}
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {PRONOUNS.map((p) => (
          <label
            key={p}
            className={`flex cursor-pointer items-start gap-3 rounded-lg p-3 text-sm ${value === p ? "bg-white" : "bg-white/50"}`}
          >
            <input
              type="radio"
              name="pronoun"
              className="mt-0.5"
              checked={value === p}
              disabled={pending}
              onChange={() => choose(p)}
            />
            <span>{renderItem(EXAMPLE_TEMPLATE, name, p)}</span>
          </label>
        ))}
      </div>
      {status && (
        <p role="status" className="mt-2 text-xs text-foreground/70">
          {status}
        </p>
      )}
    </fieldset>
  );
}
