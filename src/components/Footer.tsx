import { Heart, QrCode, Github, ExternalLink } from "lucide-react";
import { developer, BRAND } from "../data/developer";

interface FooterProps {
  onOpenAbout: () => void;
}

export function Footer({ onOpenAbout }: FooterProps) {
  return (
    <footer className="w-full border-t border-white/[0.06] bg-[#05070c]/90 py-8 px-4 sm:px-6 lg:px-8 mt-20 relative z-10 text-xs text-slate-400">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Brand & Mission */}
        <div className="flex items-center gap-2">
          <QrCode className="h-4 w-4 text-cyan-400" />
          <span className="font-semibold text-white">{BRAND.name}</span>
          <span>— Precision client-side QR studio. Free &amp; Private.</span>
        </div>

        {/* Creator & Links */}
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenAbout}
            className="text-slate-300 hover:text-cyan-400 transition-colors"
          >
            About &amp; Developer
          </button>
          <a
            href={developer.github}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-slate-300 hover:text-cyan-400 transition-colors"
          >
            <Github className="h-3.5 w-3.5" />
            <span>GitHub</span>
          </a>
          <span className="text-slate-600">•</span>
          <span className="text-slate-500 font-mono">v{BRAND.version}</span>
        </div>
      </div>
    </footer>
  );
}
