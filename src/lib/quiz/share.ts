import crypto from "crypto";
import type { AxisScores } from "./scoring";

// Share links are signed with SHARE_SECRET. There is deliberately no built-in
// default: a default in the source would let anyone forge a link. If the secret
// is not configured, links are neither created nor accepted.
const SECRET = process.env.SHARE_SECRET;

interface SharePayload {
  score: number;
  label: string;
  questionnaireId: number;
  scores?: AxisScores;
}

function sign(data: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

export function createShareLink(payload: SharePayload): string | null {
  if (!SECRET) return null;
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `/quiz/share?data=${data}&sig=${sign(data, SECRET)}`;
}

export function verifyShareLink(
  data: string,
  sig: string
): SharePayload | null {
  if (!SECRET) return null;

  const expected = Buffer.from(sign(data, SECRET));
  const given = Buffer.from(sig);
  if (
    expected.length !== given.length ||
    !crypto.timingSafeEqual(expected, given)
  ) {
    return null;
  }
  try {
    return JSON.parse(Buffer.from(data, "base64url").toString());
  } catch {
    return null;
  }
}
