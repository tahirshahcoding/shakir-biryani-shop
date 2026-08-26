import * as settingRepo from "./setting.repository";

export async function getSettings() {
  return settingRepo.findMany();
}

export async function updateSettings(data: Record<string, string>) {
  return settingRepo.upsertMany(data);
}
