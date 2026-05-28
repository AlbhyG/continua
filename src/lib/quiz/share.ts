import crypto from "crypto";
import type { AxisScores } from "./scoring";

const LEGACY_DEFAULT_SECRET =
  "continua-empathy-spectrum-default-secret-change-me";

const SECRET =
  process.env.SHARE_SECRET || LEGACY_DEFAULT_SECRET;

interface SharePayload {
  score: number;
  label: string;
  questionnaireId: number;
  scores?: AxisScores;
}

export function createShareLink(payload: SharePayload): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");
  return `/quiz/share?data=${data}&sig=${sig}`;
}

export function verifyShareLink(
  data: string,
  sig: string
): SharePayload | null {
  const secrets = [SECRET];
  if (SECRET !== LEGACY_DEFAULT_SECRET) {
    secrets.push(LEGACY_DEFAULT_SECRET);
  }

  const hasValidSignature = secrets.some((secret) => {
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("base64url");
    return sig === expectedSig;
  });

  if (!hasValidSignature) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(data, "base64url").toString());
  } catch {
    return null;
  }
}
