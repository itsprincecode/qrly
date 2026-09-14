import { QrCode, History, Info, Sparkles, Database, CheckCircle2, ExternalLink } from "lucide-react";
import { isSupabaseConfigured } from "../lib/supabase";

interface NavbarProps {
  currentTab: "generator" | "history" | "about";
  onSelectTab: (tab: "generator" | "history" | "about") => void;
  historyCount: number;
}

export function Navbar({ currentTab, onSelectTab, historyCount }: NavbarProps) {
  const isCloudConnected = isSupabaseConfigured();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#05070c]/80 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            id="nav-brand-logo-btn"
            onClick={() => onSelectTab("generator")}
            className="group flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-lg p-1"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-transform group-hover:scale-105">
              <QrCode className="h-5 w-5 text-cyan-400" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                  QRly
                </span>
                <span className="rounded-full bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 font-mono">Modern QR Studio</p>
            </div>
          </button>
        </div>

        {/* Center Nav Navigation */}
        <nav className="flex items-center gap-1 sm:gap-2 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06] backdrop-blur-md">
          <button
            id="nav-tab-generator"
            onClick={() => onSelectTab("generator")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              currentTab === "generator"
                ? "bg-cyan-500 text-white shadow-[0_0_14px_rgba(6,182,212,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Generator</span>
          </button>

          <button
            id="nav-tab-history"
            onClick={() => onSelectTab("history")}
            className={`relative flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              currentTab === "history"
                ? "bg-cyan-500 text-white shadow-[0_0_14px_rgba(6,182,212,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <History className="h-3.5 w-3.5" />
            <span>History</span>
            {historyCount > 0 && (
              <span
                className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  currentTab === "history"
                    ? "bg-white/25 text-white"
                    : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                }`}
              >
                {historyCount}
              </span>
            )}
          </button>

          <button
            id="nav-tab-about"
            onClick={() => onSelectTab("about")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all ${
              currentTab === "about"
                ? "bg-cyan-500 text-white shadow-[0_0_14px_rgba(6,182,212,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
            }`}
          >
            <Info className="h-3.5 w-3.5" />
            <span>About</span>
          </button>
        </nav>

        {/* Right Status Indicator */}
        <div className="hidden sm:flex items-center gap-3">
          <div
            title={
              isCloudConnected
                ? "Connected to Supabase cloud storage"
                : "Operating in Client Local Engine (offline ready, add Supabase keys to sync)"
            }
            className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono border bg-white/[0.03] border-white/[0.08]"
          >
            {isCloudConnected ? (
              <>
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]"></span>
                <span className="text-slate-300 text-[11px]">Supabase Synced</span>
              </>
            ) : (
              <>
                <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                <span className="text-slate-400 text-[11px]">Client Engine</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
