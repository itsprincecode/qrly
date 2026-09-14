import { useState, useEffect, type MouseEvent } from "react";
import {
  History as HistoryIcon,
  Trash2,
  Copy,
  Download,
  ExternalLink,
  Sparkles,
  QrCode,
  Check,
  RotateCw,
} from "lucide-react";
import type { PlatformType, StoredQRCode } from "../types";
import { fetchRecentQRCodes, deleteQRCode, clearAllLocalHistory } from "../lib/supabase";
import { generateHighResPngBlob, downloadFile } from "../lib/qr";

interface HistoryProps {
  onOpenInGenerator: (url: string, type: PlatformType) => void;
  onNotify: (msg: string, type?: "success" | "info" | "error") => void;
  onHistoryCountChange: (count: number) => void;
}

function formatRelativeTime(dateStr: string): string {
  try {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return "Recently";
  }
}

export function History({
  onOpenInGenerator,
  onNotify,
  onHistoryCountChange,
}: HistoryProps) {
  const [items, setItems] = useState<StoredQRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const records = await fetchRecentQRCodes();
      setItems(records);
      onHistoryCountChange(records.length);
    } catch {
      onNotify("Could not load history", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id: string, e: MouseEvent) => {
    e.stopPropagation();
    const success = await deleteQRCode(id);
    if (success) {
      const updated = items.filter((x) => x.id !== id);
      setItems(updated);
      onHistoryCountChange(updated.length);
      onNotify("Removed from history", "info");
    }
  };

  const handleClearAll = () => {
    if (items.length === 0) return;
    if (window.confirm("Are you sure you want to clear all history records?")) {
      clearAllLocalHistory();
      setItems([]);
      onHistoryCountChange(0);
      onNotify("History cleared", "info");
    }
  };

  const handleCopyUrl = async (url: string, id: string, e: MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      onNotify("Link copied to clipboard", "success");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      onNotify("Unable to copy", "error");
    }
  };

  const handleQuickDownload = async (item: StoredQRCode, e: MouseEvent) => {
    e.stopPropagation();
    try {
      const blob = await generateHighResPngBlob(
        item.original_url,
        {
          foregroundColor: item.foreground_color || "#000000",
          backgroundColor: item.background_color || "#ffffff",
          margin: item.margin || 2,
          errorCorrection: item.error_correction || "M",
        },
        1024
      );
      const filename = `qrly-${item.type}-${Date.now()}.png`;
      downloadFile(blob, filename);
      onNotify("QR code downloaded (1024px)", "success");
    } catch {
      onNotify("Failed to download QR", "error");
    }
  };

  return (
    <div className="relative z-10 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <HistoryIcon className="h-6 w-6 text-cyan-400" />
            <span>Recent QR Codes</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Codes generated on this device or synchronized to your Supabase cloud.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            // onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all self-start sm:self-auto"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RotateCw className="h-6 w-6 text-cyan-400 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 rounded-2xl border border-white/[0.06] bg-[#0c101b]/60 backdrop-blur-xl">
          <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-3">
            <QrCode className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-white">No QR codes generated yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Create your first QR code in the generator and download or preview it. It will automatically be remembered here.
          </p>
        </div>
      ) : (
        /* Grid of History items */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            return (
              <div
                key={item.id}
                onClick={() => onOpenInGenerator(item.original_url, item.type)}
                className="group relative flex flex-col justify-between p-4 rounded-xl border border-white/[0.08] bg-[#0c101b]/80 hover:bg-[#111728]/90 hover:border-cyan-500/40 transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/10"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 pb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      {item.type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {formatRelativeTime(item.created_at)}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-slate-200 truncate mt-1 group-hover:text-cyan-300 transition-colors">
                    {item.original_url}
                  </p>

                  <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400">
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-white/20"
                      style={{ backgroundColor: item.foreground_color || "#000" }}
                      title="Foreground"
                    />
                    <span>{item.foreground_color}</span>
                    <span>•</span>
                    <span>EC: {item.error_correction}</span>
                    {item.has_logo && (
                      <>
                        <span>•</span>
                        <span className="text-cyan-400">Logo</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom action toolbar */}
                <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/[0.06] text-xs">
                  <span className="text-[11px] text-cyan-400 group-hover:underline flex items-center gap-1">
                    <span>Re-open</span>
                    <ExternalLink className="h-3 w-3" />
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      title="Copy destination link"
                      onClick={(e) => handleCopyUrl(item.original_url, item.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>

                    <button
                      type="button"
                      title="Download 1024px PNG"
                      onClick={(e) => handleQuickDownload(item, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-white/[0.08] transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      title="Delete record"
                      // onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
