/**
 * Symmetrisk kryptering för känsliga konfigurationsuppgifter
 * (t.ex. CatalystOne API-nycklar) som lagras i databasen.
 *
 * Använder AES-256-GCM med slumpmässig IV per kryptering.
 * Master key kommer från ENCRYPTION_KEY (32+ tecken).
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const masterKey = process.env.ENCRYPTION_KEY;
  if (!masterKey || masterKey.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters');
  }
  // Derivera en 32-byte key från master key via scrypt
  return scryptSync(masterKey, 'pacted-salt-v1', 32);
}

/**
 * Kryptera en sträng. Returnerar binär buffer som kan lagras i databasen.
 * Format: [IV (12 byte)] [TAG (16 byte)] [CIPHERTEXT]
 */
export function encrypt(plaintext: string): Buffer {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]);
}

/**
 * Dekryptera buffer från databasen tillbaka till klartext.
 */
export function decrypt(data: Buffer): string {
  const iv = data.subarray(0, IV_LENGTH);
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const ciphertext = data.subarray(IV_LENGTH + TAG_LENGTH);
  const decipher = createDecipheriv(ALGORITHM, getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

/**
 * Kryptera ett JS-objekt till buffer (för DeliveryConfig.configEncrypted)
 */
export function encryptJson(obj: unknown): Buffer {
  return encrypt(JSON.stringify(obj));
}

export function decryptJson<T = unknown>(data: Buffer): T {
  return JSON.parse(decrypt(data)) as T;
}
