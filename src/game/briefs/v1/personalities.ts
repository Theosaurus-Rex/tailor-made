export const personalities = [
  "deadpan",
  "gushing",
  "brisk",
  "grand",
  "anxious",
  "theatrical",
] as const;
export type Personality = (typeof personalities)[number];
