export const SEED_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
export const SEED_LENGTH = 8;

const RANDOM_SEED = new RegExp(`^[${SEED_ALPHABET}]{${SEED_LENGTH}}$`);
const DAILY_SEED = /^(\d{4})-(\d{2})-(\d{2})$/;

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    return leap ? 29 : 28;
  }
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function isDailySeed(seed: string): boolean {
  const match = DAILY_SEED.exec(seed);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  return month >= 1 && month <= 12 && day >= 1 && day <= daysInMonth(year, month);
}

export function isValidSeed(seed: string): boolean {
  return RANDOM_SEED.test(seed) || isDailySeed(seed);
}
