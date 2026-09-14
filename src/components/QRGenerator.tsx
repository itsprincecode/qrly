import { useState, useEffect, useMemo } from "react";
import {
  Link as LinkIcon,
  X,
  ClipboardPaste,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Info,
  Phone,
  MessageSquare,
  Mail,
} from "lucide-react";
import type { PlatformType, QRConfig, StoredQRCode } from "../types";
import { PLATFORMS, computeDestinationUrl } from "../data/platforms";
import { PlatformSelector } from "./PlatformSelector";
import { CustomizationPanel } from "./CustomizationPanel";
import { QRPreview } from "./QRPreview";
import { saveQRCodeToHistory } from "../lib/supabase";

interface QRGeneratorProps {
  onNotify: (msg: string, type?: "success" | "info" | "error") => void;
  onHistoryUpdated?: () => void;
  initialUrl?: string;
  initialType?: PlatformType;
}

const DEFAULT_CONFIG: QRConfig = {
  type: "website",
  inputVal: "https://example.com",
  extraVal: "",
  extraVal2: "",
  computedUrl: "https://example.com",
  foregroundColor: "#000000",
  backgroundColor: "#ffffff",
  transparentBackground: false,
  size: 320,
  margin: 2,
  errorCorrection: "M",
  logoUrl: null,
  logoSize: 22,
};

export function QRGenerator({
  onNotify,
  onHistoryUpdated,
  initialUrl,
  initialType,
}: QRGeneratorProps) {
  const [config, setConfig] = useState<QRConfig>(() => ({
    ...DEFAULT_CONFIG,
    type: initialType || "website",
    inputVal: initialUrl || "https://example.com",
    computedUrl: initialUrl || "https://example.com",
  }));

  // Update if initialUrl or initialType changes (e.g., clicking re-open from history)
  useEffect(() => {
    if (initialUrl) {
      const type = initialType || "website";
      const computed = computeDestinationUrl(type, initialUrl);
      setConfig((prev) => ({
        ...prev,
        type,
        inputVal: initialUrl,
        computedUrl: computed,
      }));
    }
  }, [initialUrl, initialType]);

  const activePlatform = useMemo(() => {
    return PLATFORMS.find((p) => p.id === config.type) || PLATFORMS[0];
  }, [config.type]);

  // Validate the computed URL
  const isValidUrl = useMemo(() => {
    const url = config.computedUrl.trim();
    if (!url) return false;
    try {
      // For mailto, basic regex
      if (url.startsWith("mailto:")) {
        return /mailto:[^\s@]+@[^\s@]+\.[^\s@]+/.test(url);
      }
      // For http/https/wa.me/etc.
      const parsed = new URL(url);
      return Boolean(parsed.protocol && parsed.host);
    } catch {
      return false;
    }
  }, [config.computedUrl]);

  // Handle platform change
  const handlePlatformChange = (newType: PlatformType) => {
    const platform = PLATFORMS.find((p) => p.id === newType);
    let sampleVal = "";
    if (newType === "website") sampleVal = "https://example.com";
    else if (newType === "instagram") sampleVal = "designcode";
    else if (newType === "youtube") sampleVal = "@designcode";
    else if (newType === "linkedin") sampleVal = "alexmorgan";
    else if (newType === "github") sampleVal = "torvalds";
    else if (newType === "twitter") sampleVal = "designcode";
    else if (newType === "whatsapp") sampleVal = "15551234567";
    else if (newType === "telegram") sampleVal = "telegram";
    else if (newType === "email") sampleVal = "contact@example.com";
    else if (newType === "facebook") sampleVal = "meta";
    else sampleVal = "https://myapp.com/invite";

    const computed = computeDestinationUrl(newType, sampleVal);
    setConfig((prev) => ({
      ...prev,
      type: newType,
      inputVal: sampleVal,
      extraVal: "",
      extraVal2: "",
      computedUrl: computed,
    }));
  };

  // Handle input change
  const handleInputChange = (val: string, extra?: string, extra2?: string) => {
    const nextInput = val;
    const nextExtra = extra !== undefined ? extra : config.extraVal || "";
    const nextExtra2 = extra2 !== undefined ? extra2 : config.extraVal2 || "";
    const computed = computeDestinationUrl(config.type, nextInput, nextExtra, nextExtra2);

    setConfig((prev) => ({
      ...prev,
      inputVal: nextInput,
      extraVal: nextExtra,
      extraVal2: nextExtra2,
      computedUrl: computed,
    }));
  };

  // Clear input
  const handleClear = () => {
    handleInputChange("", "", "");
  };

  // Paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        handleInputChange(text);
        onNotify("Link pasted from clipboard", "info");
      }
    } catch {
      onNotify("Clipboard access denied or unavailable", "error");
    }
  };

  // Save to history on download
  const handleRecordDownload = async () => {
    if (!isValidUrl) return;

    try {
      await saveQRCodeToHistory({
        type: config.type,
        original_url: config.computedUrl,
        display_name: `${activePlatform.name} QR`,
        foreground_color: config.foregroundColor,
        background_color: config.transparentBackground ? "transparent" : config.backgroundColor,
        size: config.size,
        margin: config.margin,
        error_correction: config.errorCorrection,
        has_logo: Boolean(config.logoUrl),
        created_by: "anonymous",
        download_count: 1,
      });

      if (onHistoryUpdated) {
        onHistoryUpdated();
      }
    } catch (e) {
      console.warn("Could not save to history:", e);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* 2-Column Responsive SaaS Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls & Input (7 cols on desktop) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0c101b]/80 backdrop-blur-xl p-5 sm:p-6 shadow-xl space-y-6">
            {/* 1. Platform Selector */}
            <PlatformSelector
              selected={config.type}
              onSelect={handlePlatformChange}
            />

            {/* 2. Link Input Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="main-qr-link-input"
                  className="text-xs font-semibold uppercase tracking-wider text-slate-400"
                >
                  Enter Your Link
                </label>
                {config.inputVal && (
                  <div className="flex items-center gap-1">
                    {isValidUrl ? (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                        <CheckCircle2 className="h-3 w-3" /> Valid Link
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] text-rose-400 font-mono">
                        <AlertCircle className="h-3 w-3" /> Please enter a valid URL
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Main Input with Prefix & Action Buttons */}
              <div className="relative flex items-center rounded-xl border border-white/10 bg-black/40 focus-within:border-cyan-400 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
                <div className="pl-3.5 pr-2 text-slate-500 flex items-center gap-1.5 shrink-0 select-none">
                  <LinkIcon className="h-4 w-4 text-cyan-400/80" />
                  {activePlatform.id !== "website" && activePlatform.id !== "custom" && (
                    <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                      {activePlatform.prefix}
                    </span>
                  )}
                </div>

                <input
                  id="main-qr-link-input"
                  type="text"
                  value={config.inputVal}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder={activePlatform.placeholder}
                  className="w-full bg-transparent py-3 pr-20 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none font-mono"
                  autoComplete="off"
                  spellCheck={false}
                />

                {/* Clear and Paste action buttons */}
                <div className="absolute right-2 flex items-center gap-1">
                  {config.inputVal ? (
                    <button
                      type="button"
                      onClick={handleClear}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                      title="Clear Input"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePaste}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs text-slate-300 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-colors"
                      title="Paste from clipboard"
                    >
                      <ClipboardPaste className="h-3.5 w-3.5 text-cyan-400" />
                      <span className="hidden sm:inline">Paste</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Extra input field for WhatsApp prefill message */}
              {activePlatform.hasExtraFields === "whatsapp" && (
                <div className="pt-2 space-y-1 animate-in fade-in duration-200">
                  <label className="text-[11px] text-slate-400 flex items-center gap-1.5">
                    <MessageSquare className="h-3 w-3 text-cyan-400" />
                    <span>Optional Pre-filled Chat Message:</span>
                  </label>
                  <input
                    type="text"
                    value={config.extraVal || ""}
                    onChange={(e) => handleInputChange(config.inputVal, e.target.value)}
                    placeholder="Hello! I found your QR code and would like to connect..."
                    className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              )}

              {/* Extra input fields for Email subject & body */}
              {activePlatform.hasExtraFields === "email" && (
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 animate-in fade-in duration-200">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Subject (Optional)</label>
                    <input
                      type="text"
                      value={config.extraVal || ""}
                      onChange={(e) => handleInputChange(config.inputVal, e.target.value, config.extraVal2)}
                      placeholder="Inquiry / Partnership"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-400">Body Text (Optional)</label>
                    <input
                      type="text"
                      value={config.extraVal2 || ""}
                      onChange={(e) => handleInputChange(config.inputVal, config.extraVal, e.target.value)}
                      placeholder="Hello, I would like to learn more..."
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Helper text & computed URL preview */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400 pt-0.5">
                <span>{activePlatform.helperText || "Direct destination link"}</span>
                {config.computedUrl && (
                  <span className="font-mono text-cyan-400/80 truncate max-w-xs">
                    Encodes: {config.computedUrl}
                  </span>
                )}
              </div>
            </div>

            {/* 3. Customization Panel */}
            <CustomizationPanel
              config={config}
              onChange={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
              onReset={() =>
                setConfig((prev) => ({
                  ...prev,
                  foregroundColor: DEFAULT_CONFIG.foregroundColor,
                  backgroundColor: DEFAULT_CONFIG.backgroundColor,
                  transparentBackground: false,
                  size: DEFAULT_CONFIG.size,
                  margin: DEFAULT_CONFIG.margin,
                  errorCorrection: DEFAULT_CONFIG.errorCorrection,
                  logoUrl: null,
                  logoSize: DEFAULT_CONFIG.logoSize,
                }))
              }
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Live QR Preview & Instant Download (5 cols on desktop) */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <QRPreview
            config={config}
            isValidUrl={isValidUrl}
            onRecordDownload={handleRecordDownload}
            onNotify={onNotify}
          />
        </div>
      </div>
    </div>
  );
}
