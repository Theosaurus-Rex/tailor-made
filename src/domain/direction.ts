import type { AccessoryType, Colour, FabricType, StyleTag, accessories } from "@/game/data/v1";

export type PerPieceAccessory = {
  [A in AccessoryType]: (typeof accessories)[A]["unit"] extends "piece" ? A : never;
}[AccessoryType];

export type Direction =
  | { type: "style"; tag: StyleTag }
  | { type: "styleAvoid"; tag: StyleTag }
  | { type: "fabric"; fabric: FabricType }
  | { type: "fabricAvoid"; fabric: FabricType }
  | { type: "fabricOnly"; fabric: "Burlap" }
  | { type: "colour"; colour: Colour }
  | { type: "colourAvoid"; colour: Colour }
  | { type: "colourOnly"; colour: Colour }
  | { type: "accessory"; accessory: AccessoryType }
  | { type: "accessoryAvoid"; accessory: AccessoryType }
  | { type: "accessoryMin"; accessory: PerPieceAccessory; count: number }
  | { type: "accessoryExact"; accessory: PerPieceAccessory; count: number }
  | { type: "coloursMin"; count: number };

export type DirectionType = Direction["type"];

export const COUNT_RANGE = { min: 2, max: 8 } as const;
