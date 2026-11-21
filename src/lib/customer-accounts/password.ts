import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const KEY_LENGTH = 64;
const COST = 16384;

const derive = (password: string, salt: Buffer, cost: number): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, { N: cost }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });

/** `scrypt$<cost>$<salt>$<hash>`: a per-user random salt, never the password (ACC-005). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, COST);
  return `scrypt$${COST}$${salt.toString("base64")}$${key.toString("base64")}`;
}

/** Compare in constant time. A malformed stored value never matches. */
export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, cost, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !cost || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await derive(password, Buffer.from(salt, "base64"), Number(cost));
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
