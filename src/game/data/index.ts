import { dataV1, type GameData } from "./v1";

export const dataVersions: Readonly<Partial<Record<number, GameData>>> = { 1: dataV1 };

export const LATEST_DATA_VERSION = 1;
export const latestData: GameData = dataV1;

export function dataFor(version: number): GameData {
  const data = dataVersions[version];
  if (!data) throw new RangeError(`unknown data version ${version}`);
  return data;
}
