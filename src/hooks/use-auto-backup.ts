"use client";

import { useEffect, useRef, useCallback } from "react";

const LAST_BACKUP_KEY = "biryani-last-auto-backup";

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function isPastMidnight(): boolean {
  const now = new Date();
  return now.getHours() === 0 && now.getMinutes() === 0;
}

function getLastBackupDate(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(LAST_BACKUP_KEY);
}

function setLastBackupDate(date: string) {
  localStorage.setItem(LAST_BACKUP_KEY, date);
}

async function downloadBackup(): Promise<boolean> {
  try {
    const res = await fetch("/api/backup");
    if (!res.ok) return false;
    const blob = await res.blob();
    const disposition = res.headers.get("Content-Disposition") || "";
    const match = disposition.match(/filename="(.+)"/);
    const filename = match ? match[1] : "biryani-backup.db";
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}

export function useAutoBackup(enabled: boolean = true) {
  const checkedRef = useRef(false);

  const checkAndBackup = useCallback(async () => {
    if (!enabled) return;
    const today = getTodayStr();
    const lastBackup = getLastBackupDate();
    if (lastBackup === today) return;

    const success = await downloadBackup();
    if (success) {
      setLastBackupDate(today);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Check on mount
    checkAndBackup();

    // Check every 30 seconds
    const interval = setInterval(() => {
      checkAndBackup();
    }, 30 * 1000);

    return () => clearInterval(interval);
  }, [enabled, checkAndBackup]);
}
