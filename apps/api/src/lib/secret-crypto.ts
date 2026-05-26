import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const PREFIX = "encrypted:v1";
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

function getEncryptionKey(): Buffer {
  const secret = process.env.APP_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error("APP_ENCRYPTION_KEY is required to use encrypted settings.");
  }

  const base64Key = Buffer.from(secret, "base64");
  if (base64Key.length === KEY_LENGTH) return base64Key;

  const utf8Key = Buffer.from(secret, "utf8");
  if (utf8Key.length === KEY_LENGTH) return utf8Key;

  throw new Error("APP_ENCRYPTION_KEY must be 32 bytes. Generate one with: openssl rand -base64 32");
}

export function isEncryptedSecret(value: string | null | undefined): value is string {
  return typeof value === "string" && value.startsWith(`${PREFIX}:`);
}

export function encryptSecret(plainText: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [
    PREFIX,
    iv.toString("base64"),
    authTag.toString("base64"),
    ciphertext.toString("base64"),
  ].join(":");
}

export function decryptSecret(encryptedValue: string): string {
  const [prefix, version, iv, authTag, ciphertext] = encryptedValue.split(":");
  if (`${prefix}:${version}` !== PREFIX || !iv || !authTag || !ciphertext) {
    throw new Error("Invalid encrypted secret format.");
  }

  const decipher = createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(authTag, "base64"));

  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, "base64")),
    decipher.final(),
  ]).toString("utf8");
}
