import Dexie, { type EntityTable } from "dexie";
import { type AssetData } from "./types";

const db = new Dexie("BarcodeAppDB") as Dexie & {
  assets: EntityTable<AssetData, "staffID">;
};

db.version(3).stores({
  assets: "staffID, modifiedAt",
});

export const saveAsset = async (asset: AssetData) => {
  const assetWithTime = { ...asset, modifiedAt: Date.now() };
  return await db.assets.put(assetWithTime);
};

export const bulkSaveAssets = async (assets: AssetData[]) => {
  const assetsWithTime = assets.map((asset) => ({
    ...asset,
    modifiedAt: Date.now(),
  }));
  return await db.assets.bulkPut(assetsWithTime);
};

export const getAllAssets = async () => {
  return await db.assets.toArray();
};

export const deleteAsset = async (staffID: string) => {
  return await db.assets.delete(staffID);
};

export const bulkDeleteAssets = async (staffIDs: string[]) => {
  return await db.assets.bulkDelete(staffIDs);
};

export const clearAllAssets = async () => {
  return await db.assets.clear();
};

export { db };
