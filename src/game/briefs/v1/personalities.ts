export const personalities = ["deadpan", "gushing", "brisk"] as const;
export type Personality = (typeof personalities)[number];
