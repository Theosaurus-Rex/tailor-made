import type { AccessoryType, FabricType, StyleTag } from "@/game/data/v1";

export const fabricNouns: Record<FabricType, string> = {
  Burlap: "burlap",
  Cotton: "cotton",
  Lace: "lace",
  Linen: "linen",
  Sequin: "sequins",
  Silk: "silk",
  Velvet: "velvet",
  Wool: "wool",
};

export const accessoryNouns: Record<AccessoryType, { singular: string; plural: string }> = {
  Appliqué: { singular: "appliqué", plural: "appliqués" },
  Bell: { singular: "bell", plural: "bells" },
  Bow: { singular: "bow", plural: "bows" },
  Brooch: { singular: "brooch", plural: "brooches" },
  Button: { singular: "button", plural: "buttons" },
  Feather: { singular: "feather", plural: "feathers" },
  Flower: { singular: "flower", plural: "flowers" },
  Jewel: { singular: "jewel", plural: "jewels" },
  "Lace Trim": { singular: "lace trim", plural: "lace trim" },
  Piping: { singular: "piping", plural: "piping" },
  Tassel: { singular: "tassel", plural: "tassels" },
  Trim: { singular: "trim", plural: "trim" },
};

export const styleAvoidLines: Partial<Record<StyleTag, string>> = {
  Flowers: "No florals",
};
