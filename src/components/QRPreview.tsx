import { useEffect, useRef, useState } from "react";
import {
  Download,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Layers,
  Sparkles,
  QrCode,
  FileCode,
  CheckCircle2,
} from "lucide-react";
import confetti from "canvas-confetti";
import type { QRConfig } from "../types";
import {
  generateHighResPngBlob,
  generateQRSvgString,
  renderQRToCanvas,
  downloadFile,
} from "../lib/qr";

interface QRPreviewProps {
  config: QRConfig;
  isValidUrl: boolean;
  onRecordDownload?: () => void;
  onNotify: (msg: string, type?: "success" | "info" | "error") => void;
}

export function QRPreview({
  config,
  isValidUrl,
  onRecordDownload,
  onNotify,
}: QRPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportResolution, setExportResolution] = useState<number>(1024); // 512, 1024, 2048

  // Render QR to canvas whenever config changes and URL is valid
  useEffect(() => {
    if (!canvasRef.current || !config.computedUrl || !isValidUrl) return;

    let isMounted = true;
    renderQRToCanvas(canvasRef.current, config.computedUrl, {
      foregroundColor: config.foregroundColor,
      backgroundColor: config.transparentBackground ? "transparent" : config.backgroundColor,
      margin: config.margin,
      errorCorrection: config.errorCorrection,
      size: config.size,
      logoUrl: config.logoUrl,
      logoSize: config.logoSize,
    }).catch((err) => {
      if (isMounted) {
        console.error("QR render error:", err);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [config, isValidUrl]);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#06b6d4", "#3b82f6", "#10b981", "#ffffff"],
      });
    } catch {
      // ignore
    }
  };

  // Download High-Res PNG
  const handleDownloadPng = async () => {
    if (!isValidUrl || !config.computedUrl) {
      onNotify("Please enter a valid link first.", "error");
      return;
    }

    try {
      setIsExporting(true);
      const blob = await generateHighResPngBlob(
        config.computedUrl,
        {
          foregroundColor: config.foregroundColor,
          backgroundColor: config.transparentBackground ? "transparent" : config.backgroundColor,
          margin: config.margin,
          errorCorrection: config.errorCorrection,
          logoUrl: config.logoUrl,
          logoSize: config.logoSize,
        },
        exportResolution
      );

      const filename = `qrly-${config.type}-${Date.now()}.png`;
      downloadFile(blob, filename);
      triggerCelebration();
      onNotify(`QR code downloaded successfully (${exportResolution}×${exportResolution} PNG)`, "success");
      if (onRecordDownload) onRecordDownload();
    } catch (err) {
      console.error(err);
      onNotify("Failed to export PNG. Please try again.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Download Vector SVG
  const handleDownloadSvg = async () => {
    if (!isValidUrl || !config.computedUrl) {
      onNotify("Please enter a valid link first.", "error");
      return;
    }

    try {
      setIsExporting(true);
      const svgString = await generateQRSvgString(config.computedUrl, {
        foregroundColor: config.foregroundColor,
        backgroundColor: config.transparentBackground ? "transparent" : config.backgroundColor,
        margin: config.margin,
        errorCorrection: config.errorCorrection,
        logoUrl: config.logoUrl,
        logoSize: config.logoSize,
      });

      const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
      const filename = `qrly-${config.type}-${Date.now()}.svg`;
      downloadFile(blob, filename);
      triggerCelebration();
      onNotify("Vector SVG downloaded successfully (lossless print-ready)", "success");
      if (onRecordDownload) onRecordDownload();
    } catch (err) {
      console.error(err);
      onNotify("Failed to export SVG. Please try again.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Copy URL
  const handleCopyUrl = async () => {
    if (!config.computedUrl) return;
    try {
      await navigator.clipboard.writeText(config.computedUrl);
      setCopiedLink(true);
      onNotify("Link copied to clipboard", "success");
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      onNotify("Unable to copy to clipboard", "error");
    }
  };

  // Copy Image to Clipboard
  const handleCopyImage = async () => {
    if (!isValidUrl || !config.computedUrl) return;
    try {
      const blob = await generateHighResPngBlob(
        config.computedUrl,
        {
          foregroundColor: config.foregroundColor,
          backgroundColor: config.transparentBackground ? "transparent" : config.backgroundColor,
          margin: config.margin,
          errorCorrection: config.errorCorrection,
          logoUrl: config.logoUrl,
          logoSize: config.logoSize,
        },
        1024
      );

      if (navigator.clipboard && "write" in navigator.clipboard) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "image/png": blob,
          }),
        ]);
        setCopiedImage(true);
        onNotify("QR image copied to clipboard!", "success");
        setTimeout(() => setCopiedImage(false), 2000);
      } else {
        onNotify("Direct image copy not supported in this browser. Use Download.", "info");
      }
    } catch (e) {
      console.warn(e);
      onNotify("Could not copy image. Try downloading PNG.", "error");
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl border border-white/[0.08] bg-[#0c101b]/80 backdrop-blur-xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Live QR Preview
          </span>
        </div>
        {isValidUrl && (
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            Ready to Scan
          </span>
        )}
      </div>

      {/* Main Solid Card Stage for high scannability */}
      <div className="flex-1 flex flex-col items-center justify-center py-6 min-h-[340px]">
        {/*
          CRITICAL REQUIREMENT:
          "The QR preview itself must always have a clean, solid background so the QR code remains highly scannable.
          Do not apply animated background effects directly behind the QR modules."
        */}
        <div
          id="qr-preview-card"
          className="relative flex items-center justify-center p-6 rounded-2xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-200 transition-all duration-300 group"
          style={{
            backgroundColor: config.transparentBackground ? "transparent" : config.backgroundColor,
            backgroundImage: config.transparentBackground
              ? "radial-gradient(#cbd5e1 1px, transparent 1px)"
              : undefined,
            backgroundSize: config.transparentBackground ? "12px 12px" : undefined,
          }}
        >
          {isValidUrl ? (
            <div className="relative">
              <canvas
                ref={canvasRef}
                style={{
                  width: `${config.size}px`,
                  maxWidth: "100%",
                  height: "auto",
                  aspectRatio: "1/1",
                  display: "block",
                }}
                className="rounded-lg"
              />

              {/* Subtle hover scan beam */}
              <div className="absolute inset-0 pointer-events-none rounded-lg overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-[scan_2.5s_ease-in-out_infinite]" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-8 w-64 h-64 border-2 border-dashed border-slate-300 rounded-xl">
              <QrCode className="h-14 w-14 text-slate-300 mb-3" />
              <div className="text-xs font-semibold text-slate-600">No Link Entered</div>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[180px]">
                Type a URL or handle on the left to see the instant live preview.
              </p>
            </div>
          )}
        </div>

        {/* Scan label */}
        <div className="mt-4 text-center">
          <p className="text-xs font-medium text-slate-300">Scan to open</p>
          {isValidUrl ? (
            <a
              href={config.computedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-1 text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline max-w-[280px] sm:max-w-xs truncate font-mono"
            >
              <span className="truncate">{config.computedUrl}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          ) : (
            <span className="text-[11px] text-slate-500 font-mono">Waiting for link input...</span>
          )}
        </div>
      </div>

      {/* Resolution selection bar */}
      <div className="pt-3 pb-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
        <span className="text-slate-400 text-[11px]">PNG Export Scale:</span>
        <div className="flex items-center gap-1 bg-white/[0.04] p-0.5 rounded-lg border border-white/[0.06]">
          {[
            { res: 512, label: "512px (Web)" },
            { res: 1024, label: "1024px (HD)" },
            { res: 2048, label: "2048px (Print)" },
          ].map((item) => (
            <button
              key={item.res}
              type="button"
              onClick={() => setExportResolution(item.res)}
              className={`px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
                exportResolution === item.res
                  ? "bg-cyan-500 text-white font-semibold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Download Action Buttons */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Download PNG */}
          <button
            id="download-png-btn"
            type="button"
            disabled={!isValidUrl || isExporting}
            onClick={handleDownloadPng}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <Download className="h-4 w-4" />
            <span>{isExporting ? "Exporting..." : `Download PNG`}</span>
          </button>

          {/* Download SVG */}
          <button
            id="download-svg-btn"
            type="button"
            disabled={!isValidUrl || isExporting}
            onClick={handleDownloadSvg}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] text-white font-semibold text-xs sm:text-sm border border-white/10 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            <FileCode className="h-4 w-4 text-cyan-400" />
            <span>Download SVG</span>
          </button>
        </div>

        {/* Quick Utility Actions */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            type="button"
            disabled={!isValidUrl}
            onClick={handleCopyUrl}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied Link!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>

          <button
            type="button"
            disabled={!isValidUrl}
            onClick={handleCopyImage}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-medium text-slate-300 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {copiedImage ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Image Copied!</span>
              </>
            ) : (
              <>
                <Layers className="h-3.5 w-3.5" />
                <span>Copy Image</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
