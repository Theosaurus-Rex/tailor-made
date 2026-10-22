import type {
  AccessoryType,
  Colour,
  FabricType,
  StyleTag,
  accessories,
  fabrics,
} from "@/game/data/v1";

export type PerPieceAccessory = {
  [A in AccessoryType]: (typeof accessories)[A]["unit"] extends "piece" ? A : never;
}[AccessoryType];

export type GeneralFabric = {
  [F in FabricType]: (typeof fabrics)[F] extends { modifierOnly: true } ? never : F;
}[FabricType];

export type Direction =
  | { type: "style"; tag: StyleTag }
  | { type: "styleAvoid"; tags: readonly StyleTag[] }
  | { type: "fabric"; fabrics: readonly GeneralFabric[] }
  | { type: "fabricAvoid"; fabrics: readonly GeneralFabric[] }
  | { type: "burlapOnly" }
  | { type: "fabricsOnly"; fabrics: readonly GeneralFabric[] }
  | { type: "fabricsMin"; count: number }
  | { type: "colour"; colours: readonly Colour[] }
  | { type: "colourAvoid"; colours: readonly Colour[] }
  | { type: "colourOnly"; colours: readonly Colour[] }
  | { type: "accessory"; accessories: readonly AccessoryType[] }
  | { type: "accessoryAvoid"; accessories: readonly AccessoryType[] }
  | { type: "accessoryMin"; accessory: PerPieceAccessory; count: number }
  | { type: "accessoryExact"; accessory: PerPieceAccessory; count: number }
  | { type: "coloursMin"; count: number };

export type DirectionType = Direction["type"];

export const COUNT_RANGE = { min: 2, max: 8 } as const;
export const FABRICS_MIN_RANGE = { min: 2, max: 4 } as const;
export const ONLY_LIST_SIZE = { min: 1, max: 3 } as const;
export const SAME_KIND_LIST_SIZE = { min: 1, max: 2 } as const;
