import { useState, type ChangeEvent } from "react";
import {
  Palette,
  Sliders,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Upload,
  Trash2,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import type { ErrorCorrectionLevel, QRConfig } from "../types";

interface CustomizationPanelProps {
  config: QRConfig;
  onChange: (updates: Partial<QRConfig>) => void;
  onReset: () => void;
}

const COLOR_PRESETS = [
  { name: "Monochrome", fg: "#000000", bg: "#ffffff" },
  { name: "Cyan Matrix", fg: "#06b6d4", bg: "#ffffff" },
  { name: "Obsidian Slate", fg: "#0f172a", bg: "#ffffff" },
  { name: "Electric Violet", fg: "#6d28d9", bg: "#ffffff" },
  { name: "Emerald Tech", fg: "#047857", bg: "#ffffff" },
  { name: "Midnight Cyber", fg: "#22d3ee", bg: "#0b0f19" },
  { name: "Crimson Red", fg: "#b91c1c", bg: "#ffffff" },
  { name: "Deep Navy", fg: "#1e3a8a", bg: "#ffffff" },
];

export function CustomizationPanel({ config, onChange, onReset }: CustomizationPanelProps) {
  const [openSection, setOpenSection] = useState<"color" | "style" | "logo" | null>("color");

  const toggleSection = (section: "color" | "style" | "logo") => {
    setOpenSection(openSection === section ? null : section);
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please select a logo under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      // When adding a logo, automatically ensure error correction is at least Q or H for scannability
      const safeEc: ErrorCorrectionLevel =
        config.errorCorrection === "L" || config.errorCorrection === "M" ? "Q" : config.errorCorrection;

      onChange({
        logoUrl: dataUrl,
        errorCorrection: safeEc,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Customize QR
        </label>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-400 transition-colors font-mono"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Reset Defaults</span>
        </button>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-slate-900/50 backdrop-blur-md divide-y divide-white/[0.06] overflow-hidden">
        {/* SECTION 1: COLOR */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection("color")}
            className="flex w-full items-center justify-between p-3.5 text-left text-xs font-medium text-slate-200 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <Palette className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold">Color Palette</span>
              <div className="flex items-center gap-1.5 ml-2">
                <span
                  className="h-3 w-3 rounded-full border border-white/20"
                  style={{ backgroundColor: config.foregroundColor }}
                  title="Foreground"
                />
                <span
                  className="h-3 w-3 rounded-full border border-white/20"
                  style={{
                    backgroundColor: config.transparentBackground ? "transparent" : config.backgroundColor,
                  }}
                  title="Background"
                />
              </div>
            </div>
            {openSection === "color" ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {openSection === "color" && (
            <div className="p-4 pt-1 space-y-4 text-xs">
              {/* Presets */}
              <div>
                <span className="text-[11px] text-slate-400 block mb-2">Curated Presets</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {COLOR_PRESETS.map((preset) => {
                    const isCurrent =
                      config.foregroundColor.toLowerCase() === preset.fg.toLowerCase() &&
                      config.backgroundColor.toLowerCase() === preset.bg.toLowerCase() &&
                      !config.transparentBackground;
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() =>
                          onChange({
                            foregroundColor: preset.fg,
                            backgroundColor: preset.bg,
                            transparentBackground: false,
                          })
                        }
                        className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-[11px] transition-all ${
                          isCurrent
                            ? "border-cyan-500 bg-cyan-500/10 text-cyan-200"
                            : "border-white/[0.06] bg-white/[0.02] text-slate-300 hover:border-white/20"
                        }`}
                      >
                        <span
                          className="h-3 w-3 rounded-full shrink-0 border border-black/20"
                          style={{ backgroundColor: preset.fg }}
                        />
                        <span className="truncate">{preset.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Foreground */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 block">Foreground Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.foregroundColor}
                      onChange={(e) => onChange({ foregroundColor: e.target.value })}
                      className="h-8 w-8 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={config.foregroundColor}
                      onChange={(e) => onChange({ foregroundColor: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white font-mono uppercase focus:border-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Background */}
                <div className="space-y-1.5">
                  <label className="text-[11px] text-slate-400 block">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      disabled={config.transparentBackground}
                      value={config.backgroundColor}
                      onChange={(e) => onChange({ backgroundColor: e.target.value })}
                      className="h-8 w-8 rounded-lg border border-white/20 bg-transparent cursor-pointer p-0.5 disabled:opacity-30"
                    />
                    <input
                      type="text"
                      disabled={config.transparentBackground}
                      value={config.transparentBackground ? "Transparent" : config.backgroundColor}
                      onChange={(e) => onChange({ backgroundColor: e.target.value })}
                      className="w-full rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5 text-xs text-white font-mono uppercase focus:border-cyan-500 focus:outline-none disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>

              {/* Transparent Toggle */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={config.transparentBackground}
                  onChange={(e) => onChange({ transparentBackground: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-cyan-400 focus:ring-offset-0"
                />
                <span className="text-[11px] text-slate-300">Transparent Background (PNG / SVG only)</span>
              </label>
            </div>
          )}
        </div>

        {/* SECTION 2: STYLE & PRECISION */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection("style")}
            className="flex w-full items-center justify-between p-3.5 text-left text-xs font-medium text-slate-200 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <Sliders className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold">Style, Margin & Error Correction</span>
            </div>
            {openSection === "style" ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {openSection === "style" && (
            <div className="p-4 pt-1 space-y-4 text-xs">
              {/* Margin / Quiet Zone */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Quiet Zone (Margin)</span>
                  <span className="text-[11px] text-cyan-400 font-mono">{config.margin} modules</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[0, 1, 2, 4].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => onChange({ margin: m })}
                      className={`py-1.5 px-2 rounded-lg text-xs font-mono transition-colors ${
                        config.margin === m
                          ? "bg-cyan-500 text-white shadow-sm"
                          : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                      }`}
                    >
                      {m === 0 ? "None (0)" : m === 2 ? "Standard (2)" : `${m} mod`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Correction Level */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Error Correction (Tolerance)</span>
                  <span className="text-[11px] text-cyan-400 font-mono">Level {config.errorCorrection}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(
                    [
                      { level: "L", label: "Low (~7%)", desc: "Smallest" },
                      { level: "M", label: "Med (~15%)", desc: "Default" },
                      { level: "Q", label: "Quartile (~25%)", desc: "Logo Ready" },
                      { level: "H", label: "High (~30%)", desc: "Max Safety" },
                    ] as const
                  ).map((item) => (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => onChange({ errorCorrection: item.level })}
                      className={`py-1.5 px-2 rounded-lg text-left transition-colors ${
                        config.errorCorrection === item.level
                          ? "bg-cyan-500 text-white shadow-sm"
                          : "bg-white/[0.04] text-slate-300 hover:bg-white/[0.08]"
                      }`}
                    >
                      <div className="font-semibold text-[11px]">{item.level}</div>
                      <div className="text-[9px] opacity-80">{item.desc}</div>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Higher error correction allows the QR code to be scanned even if smudged, damaged, or covered by a center logo.
                </p>
              </div>

              {/* Preview Display Size */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Preview Canvas Size</span>
                  <span className="text-[11px] text-cyan-400 font-mono">{config.size}px</span>
                </div>
                <input
                  type="range"
                  min="240"
                  max="440"
                  step="20"
                  value={config.size}
                  onChange={(e) => onChange({ size: Number(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: CENTER LOGO */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection("logo")}
            className="flex w-full items-center justify-between p-3.5 text-left text-xs font-medium text-slate-200 hover:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400">
                <ImageIcon className="h-3.5 w-3.5" />
              </div>
              <span className="font-semibold">Center Brand Logo</span>
              {config.logoUrl && (
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full border border-cyan-500/30">
                  Active
                </span>
              )}
            </div>
            {openSection === "logo" ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {openSection === "logo" && (
            <div className="p-4 pt-1 space-y-4 text-xs">
              {!config.logoUrl ? (
                <label className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-white/10 rounded-xl hover:border-cyan-500/50 hover:bg-cyan-500/[0.02] transition-all cursor-pointer group">
                  <Upload className="h-6 w-6 text-slate-400 group-hover:text-cyan-400 mb-2 transition-colors" />
                  <span className="font-medium text-slate-200 text-xs">Click to upload logo image</span>
                  <span className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, SVG or WebP (max 2MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-white p-1 flex items-center justify-center overflow-hidden border border-white/20">
                        <img
                          src={config.logoUrl}
                          alt="Center Logo"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Logo Embedded</div>
                        <div className="text-[10px] text-slate-400">Scannable safety enabled</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onChange({ logoUrl: null })}
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Remove Logo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Logo Size */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Logo Scale Ratio</span>
                      <span className="text-[11px] text-cyan-400 font-mono">{config.logoSize}%</span>
                    </div>
                    <input
                      type="range"
                      min="16"
                      max="28"
                      step="2"
                      value={config.logoSize}
                      onChange={(e) => onChange({ logoSize: Number(e.target.value) })}
                      className="w-full accent-cyan-500 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-200 text-[11px]">
                    <ShieldCheck className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" />
                    <span>
                      Error correction is automatically upgraded so that scanners read the code seamlessly through the center logo.
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
