// Fan-wiki data from dressmakerwiki.site (build 410) and cozygameguides.com, checked against build 443
// (docs/notes/build-443-check.md). Where each value came from: docs/notes/data-v1-leanings.md.

export const DATA_VERSION = 1;

export const styleTags = [
  "Casual",
  "Cool",
  "Cute",
  "Daywear",
  "Eclectic",
  "Elaborate",
  "Elegant",
  "Eveningwear",
  "Flowers",
  "Formal",
  "Glamour",
  "Gothic",
  "Patterned",
  "Playful",
  "Professional",
  "Risqué",
  "Romantic",
  "Shimmering",
  "Simple",
  "Uncomfortable",
  "Warm",
  "Workwear",
] as const;
export type StyleTag = (typeof styleTags)[number];

export const fabricTypes = [
  "Burlap",
  "Cotton",
  "Lace",
  "Linen",
  "Sequin",
  "Silk",
  "Velvet",
  "Wool",
] as const;
export type FabricType = (typeof fabricTypes)[number];

export const colours = [
  "Black",
  "Blue",
  "Brown",
  "Green",
  "Grey",
  "Orange",
  "Pink",
  "Purple",
  "Red",
  "White",
  "Yellow",
] as const;
export type Colour = (typeof colours)[number];

export const accessoryTypes = [
  "Appliqué",
  "Bell",
  "Bow",
  "Brooch",
  "Button",
  "Feather",
  "Flower",
  "Jewel",
  "Lace Trim",
  "Piping",
  "Tassel",
  "Trim",
] as const;
export type AccessoryType = (typeof accessoryTypes)[number];

export interface FabricInfo {
  leansTowards: readonly StyleTag[];
  modifierOnly?: true;
}

export interface AccessoryInfo {
  unit: "piece" | "cm";
  leansTowards: readonly StyleTag[];
}

export interface GameData {
  version: number;
  tagWeights: Record<StyleTag, number>;
  fabrics: Record<FabricType, FabricInfo>;
  colourLeanings: Partial<Record<Colour, readonly StyleTag[]>>;
  accessories: Record<AccessoryType, AccessoryInfo>;
}

const tagWeights = {
  Casual: 1,
  Cool: 2,
  Cute: 5,
  Daywear: 3,
  Eclectic: 3,
  Elaborate: 5,
  Elegant: 4,
  Eveningwear: 3,
  Flowers: 2,
  Formal: 3,
  Glamour: 5,
  Gothic: 5,
  Patterned: 3,
  Playful: 5,
  Professional: 2,
  Risqué: 4,
  Romantic: 5,
  Shimmering: 1,
  Simple: 2,
  Uncomfortable: 1,
  Warm: 2,
  Workwear: 2,
} satisfies Record<StyleTag, number>;

const fabrics = {
  Burlap: { leansTowards: ["Uncomfortable"], modifierOnly: true },
  Cotton: { leansTowards: ["Daywear", "Cool", "Casual", "Workwear"] },
  Lace: {
    leansTowards: ["Gothic", "Elegant", "Eveningwear", "Romantic", "Risqué"],
  },
  Linen: { leansTowards: ["Daywear", "Cool", "Workwear", "Simple"] },
  Sequin: {
    leansTowards: ["Glamour", "Eveningwear", "Elaborate", "Shimmering"],
  },
  Silk: { leansTowards: ["Elegant", "Formal", "Eveningwear", "Simple"] },
  // Gothic is a deliberate addition: the wiki scores it low, but Gothic cards ask for velvet.
  Velvet: {
    leansTowards: ["Glamour", "Eveningwear", "Elegant", "Warm", "Gothic"],
  },
  Wool: { leansTowards: ["Professional", "Warm", "Simple"] },
} satisfies Record<FabricType, FabricInfo>;

const colourLeanings = {
  Black: ["Gothic"],
  Pink: ["Cute", "Romantic"],
} satisfies Partial<Record<Colour, readonly StyleTag[]>>;

const accessories = {
  Appliqué: { unit: "piece", leansTowards: ["Flowers", "Eclectic", "Gothic"] },
  Bell: { unit: "piece", leansTowards: ["Cute", "Playful"] },
  Bow: { unit: "piece", leansTowards: ["Cute", "Playful", "Romantic"] },
  Brooch: {
    unit: "piece",
    leansTowards: ["Elegant", "Glamour", "Eveningwear", "Elaborate"],
  },
  Button: {
    unit: "piece",
    leansTowards: ["Daywear", "Professional", "Eclectic"],
  },
  Feather: {
    unit: "piece",
    leansTowards: ["Elaborate", "Glamour", "Eveningwear", "Risqué"],
  },
  Flower: {
    unit: "piece",
    leansTowards: ["Flowers", "Cute", "Playful", "Romantic"],
  },
  Jewel: {
    unit: "piece",
    leansTowards: ["Elaborate", "Eveningwear", "Glamour", "Elegant"],
  },
  "Lace Trim": {
    unit: "cm",
    leansTowards: ["Romantic", "Cute", "Playful", "Gothic"],
  },
  Piping: { unit: "cm", leansTowards: ["Simple", "Elegant"] },
  Tassel: { unit: "piece", leansTowards: ["Eclectic", "Gothic", "Elaborate"] },
  Trim: {
    unit: "cm",
    leansTowards: ["Eclectic", "Cute", "Gothic", "Elaborate"],
  },
} satisfies Record<AccessoryType, AccessoryInfo>;

export const dataV1: GameData = {
  version: DATA_VERSION,
  tagWeights,
  fabrics,
  colourLeanings,
  accessories,
};
