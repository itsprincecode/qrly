import { Sparkles, ShieldCheck, Zap, Download } from "lucide-react";
import { QRGenerator } from "../components/QRGenerator";
import type { PlatformType } from "../types";

interface HomeProps {
  onNotify: (msg: string, type?: "success" | "info" | "error") => void;
  onHistoryUpdated: () => void;
  initialUrl?: string;
  initialType?: PlatformType;
}

export function Home({
  onNotify,
  onHistoryUpdated,
  initialUrl,
  initialType,
}: HomeProps) {
  return (
    <div className="relative z-10 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-xs font-mono tracking-wide shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Fast • Free • Customizable</span>
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
          Create QR Codes. <br />
          <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">
            Share Anything.
          </span>
        </h1>

        {/* Short Description */}
        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          Generate clean, customizable QR codes for websites, social profiles, and links — instantly.
        </p>

        {/* Value Micro-Pills */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5 text-cyan-400" />
            <span>Instant Client Rendering</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5 text-cyan-400" />
            <span>2048px PNG &amp; Vector SVG</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            <span>100% Private (No Redirects)</span>
          </div>
        </div>
      </div>

      {/* Main QR Generator Dashboard */}
      <QRGenerator
        onNotify={onNotify}
        onHistoryUpdated={onHistoryUpdated}
        initialUrl={initialUrl}
        initialType={initialType}
      />
    </div>
  );
}
