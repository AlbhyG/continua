import crypto from "crypto";

const SECRET =
  process.env.SHARE_SECRET || "continua-empathy-spectrum-default-secret-change-me";

interface SharePayload {
  score: number;
  label: string;
  questionnaireId: number;
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
  const expectedSig = crypto
    .createHmac("sha256", SECRET)
    .update(data)
    .digest("base64url");
  if (sig !== expectedSig) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(data, "base64url").toString());
  } catch {
    return null;
  }
}
