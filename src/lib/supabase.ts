import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { StoredQRCode } from "../types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
      supabaseAnonKey &&
      supabaseUrl !== "https://your-project.supabase.co" &&
      supabaseAnonKey !== "your-anon-key"
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const LOCAL_STORAGE_KEY = "qrly_history_v1";

function getLocalHistory(): StoredQRCode[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalHistory(list: StoredQRCode[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list.slice(0, 30)));
  } catch (e) {
    console.warn("Failed to persist to localStorage", e);
  }
}

/**
 * Save newly generated QR code to history
 * Writes to Supabase if configured, always persists locally
 */
export async function saveQRCodeToHistory(
  item: Omit<StoredQRCode, "id" | "created_at">
): Promise<StoredQRCode> {
  const localId = "local-" + Date.now() + "-" + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const record: StoredQRCode = {
    ...item,
    id: localId,
    created_at: now,
  };

  // Always update local storage first so user sees immediate feedback
  const localList = getLocalHistory();
  // Deduplicate exact same URL if generated within seconds
  const filtered = localList.filter(
    (x) => x.original_url !== record.original_url || Date.now() - new Date(x.created_at).getTime() > 10000
  );
  saveLocalHistory([record, ...filtered]);

  // Attempt Supabase insert if client is available
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("qr_codes")
        .insert([
          {
            type: item.type,
            original_url: item.original_url,
            display_name: item.display_name,
            foreground_color: item.foreground_color,
            background_color: item.background_color,
            size: item.size,
            margin: item.margin,
            error_correction: item.error_correction,
            has_logo: item.has_logo,
            created_by: item.created_by || "anonymous",
            download_count: item.download_count || 1,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        // Update local record with real Supabase ID
        const remoteRecord: StoredQRCode = {
          id: data.id,
          created_at: data.created_at,
          type: data.type,
          original_url: data.original_url,
          display_name: data.display_name,
          foreground_color: data.foreground_color,
          background_color: data.background_color,
          size: data.size,
          margin: data.margin,
          error_correction: data.error_correction,
          has_logo: data.has_logo,
          created_by: data.created_by,
          download_count: data.download_count,
        };
        const updatedLocal = getLocalHistory().map((x) => (x.id === localId ? remoteRecord : x));
        saveLocalHistory(updatedLocal);
        return remoteRecord;
      }
    } catch (err) {
      console.warn("Supabase record creation skipped or failed:", err);
    }
  }

  return record;
}

/**
 * Fetch recent QR code history
 */
export async function fetchRecentQRCodes(limit = 24): Promise<StoredQRCode[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("qr_codes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!error && data && data.length > 0) {
        // Merge with any local offline ones if necessary
        const remoteList: StoredQRCode[] = data.map((d) => ({
          id: d.id,
          created_at: d.created_at,
          type: d.type,
          original_url: d.original_url,
          display_name: d.display_name,
          foreground_color: d.foreground_color,
          background_color: d.background_color,
          size: d.size,
          margin: d.margin,
          error_correction: d.error_correction,
          has_logo: d.has_logo,
          created_by: d.created_by,
          download_count: d.download_count,
        }));
        return remoteList;
      }
    } catch (err) {
      console.warn("Could not query Supabase, falling back to local history:", err);
    }
  }

  return getLocalHistory();
}

/**
 * Delete a QR code from history
 */
export async function deleteQRCode(id: string): Promise<boolean> {
  // Always remove locally
  const list = getLocalHistory().filter((x) => x.id !== id);
  saveLocalHistory(list);

  if (supabase && !id.startsWith("local-")) {
    try {
      const { error } = await supabase.from("qr_codes").delete().eq("id", id);
      return !error;
    } catch {
      return false;
    }
  }
  return true;
}

/**
 * Clear all history
 */
export function clearAllLocalHistory(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch {
    // ignore
  }
}
