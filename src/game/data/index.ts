import { dataV1, type GameData } from "./v1";

export const dataVersions: Record<number, GameData> = { 1: dataV1 };

export const LATEST_DATA_VERSION = 1;
export const latestData = dataVersions[LATEST_DATA_VERSION];
