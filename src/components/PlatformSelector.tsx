import {
  Globe,
  Instagram,
  Youtube,
  Linkedin,
  Github,
  Twitter,
  MessageCircle,
  Send,
  Mail,
  Share2,
  Link2,
} from "lucide-react";
import { PLATFORMS } from "../data/platforms";
import type { PlatformType } from "../types";

interface PlatformSelectorProps {
  selected: PlatformType;
  onSelect: (type: PlatformType) => void;
}

const ICON_MAP: Record<string, any> = {
  Globe,
  Instagram,
  Youtube,
  Linkedin,
  Github,
  Twitter,
  MessageCircle,
  Send,
  Mail,
  Share2,
  Link2,
};

export function PlatformSelector({ selected, onSelect }: PlatformSelectorProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Target Platform / Format
        </label>
        <span className="text-[11px] text-cyan-400 font-mono">11 Presets</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-white/[0.07] backdrop-blur-md">
        {PLATFORMS.map((platform) => {
          const Icon = ICON_MAP[platform.iconName] || Link2;
          const isSelected = selected === platform.id;

          return (
            <button
              key={platform.id}
              id={`platform-btn-${platform.id}`}
              type="button"
              onClick={() => onSelect(platform.id)}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium transition-all text-left ${
                isSelected
                  ? "bg-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.35)]"
                  : "text-slate-300 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              <Icon className={`h-3.5 w-3.5 shrink-0 ${isSelected ? "text-white" : "text-cyan-400"}`} />
              <span className="truncate">{platform.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
