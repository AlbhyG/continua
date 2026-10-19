import { test } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import { hashShareToken, isWellFormedShareToken, shareUrlPath } from "./share";

test("generated tokens are well formed and carry no scores", () => {
  const token = crypto.randomBytes(24).toString("base64url");
  assert.equal(token.length, 32);
  assert.ok(isWellFormedShareToken(token));
  assert.equal(shareUrlPath(token), `/quiz/share?t=${token}`);
});

test("malformed tokens are rejected before any lookup", () => {
  for (const bad of ["", "short", "x".repeat(33), "a".repeat(31) + "!", "eyJzY29yZSI6NX0"]) {
    assert.equal(isWellFormedShareToken(bad), false, bad);
  }
});

test("only a hash of the token is stored", () => {
  const token = "A".repeat(32);
  const hash = hashShareToken(token);
  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.notEqual(hash, token);
  assert.equal(hash, hashShareToken(token));
});
