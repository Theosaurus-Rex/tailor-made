import { SEED_ALPHABET, SEED_LENGTH } from "@/domain/seed";

const LIMIT = 256 - (256 % SEED_ALPHABET.length);

export function newSeed(): string {
  let seed = "";
  while (seed.length < SEED_LENGTH) {
    const bytes = crypto.getRandomValues(new Uint8Array(SEED_LENGTH * 2));
    for (const byte of bytes) {
      if (byte >= LIMIT) continue;
      seed += SEED_ALPHABET[byte % SEED_ALPHABET.length];
      if (seed.length === SEED_LENGTH) break;
    }
  }
  return seed;
}
