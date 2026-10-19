"use client";

import { useEffect, useState } from "react";

export interface AxisResult {
  axis: string;
  name: string;
  score: number;
  label: string;
  highLabel: string;
  lowLabel: string;
}

export interface ResultData {
  scores: Record<string, number>;
  axisResults: AxisResult[];
  activeShareCount?: number;
  canShare?: boolean;
  isOwner?: boolean;
  signedIn?: boolean;
  personId?: string | null;
  personName?: string | null;
}

// Tell the header's "See Results" which result is the latest (or that there is none).
export function setLatestResult(resultId: string | null) {
  try {
    const current = localStorage.getItem("latest_result_id");
    if (resultId === null) {
      if (current === null) return;
      localStorage.removeItem("latest_result_id");
    } else {
      if (current === resultId) return;
      localStorage.setItem("latest_result_id", resultId);
    }
    window.dispatchEvent(new Event("continua:latest-result"));
  } catch {
    // Browser storage is a convenience only.
  }
}

// Loads a result: from this tab's session storage right after submitting,
// otherwise from the server.
export function useResult(resultId: string) {
  const [result, setResult] = useState<ResultData | null>(null);
  const [loadError, setLoadError] = useState<"not_found" | "unavailable" | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(`result_${resultId}`);
    if (stored) {
      setResult(JSON.parse(stored));
      return;
    }
    fetch(`/quiz/api/results/${resultId}`)
      .then((res) => {
        if (res.status === 403 || res.status === 404) {
          // Stale or inaccessible result: stop the header from pointing at it again.
          if (localStorage.getItem("latest_result_id") === resultId) setLatestResult(null);
          setLoadError("not_found");
          return null;
        }
        if (!res.ok) {
          setLoadError("unavailable");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) setResult(data);
      })
      .catch(() => setLoadError("unavailable"));
  }, [resultId]);

  // Opening one of your own results (for example from the Account page on
  // another device) makes the header's "See Results" point to it.
  useEffect(() => {
    if (result && result.isOwner !== false && result.canShare !== false) {
      setLatestResult(resultId);
    }
  }, [result, resultId]);

  return { result, loadError };
}

// Keep this tab's cached copy of the result in step with a changed field.
export function updateStoredResult(resultId: string, patch: Partial<ResultData>) {
  try {
    const key = `result_${resultId}`;
    const stored = sessionStorage.getItem(key);
    if (stored) sessionStorage.setItem(key, JSON.stringify({ ...JSON.parse(stored), ...patch }));
  } catch {
    // Session storage is a convenience only.
  }
}
