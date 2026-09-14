import {
  Code2,
  Cpu,
  Database,
  ExternalLink,
  Github,
  Globe,
  Instagram,
  Linkedin,
  Mail,
  Shield,
  Sparkles,
  Zap,
  CheckCircle2,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import { developer, BRAND, BRAND_NAME_SUGGESTIONS } from "../data/developer";
import { isSupabaseConfigured } from "../lib/supabase";

interface AboutProps {
  onNotify: (msg: string, type?: "success" | "info" | "error") => void;
}

export function About({ onNotify }: AboutProps) {
  const [copiedSql, setCopiedSql] = useState(false);
  const isCloudConnected = isSupabaseConfigured();

  const handleCopySql = async () => {
    const sql = `CREATE TABLE IF NOT EXISTS public.qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    type TEXT NOT NULL DEFAULT 'website',
    original_url TEXT NOT NULL,
    display_name TEXT NOT NULL DEFAULT 'QR Code',
    foreground_color TEXT NOT NULL DEFAULT '#000000',
    background_color TEXT NOT NULL DEFAULT '#ffffff',
    size INTEGER NOT NULL DEFAULT 512,
    margin INTEGER NOT NULL DEFAULT 2,
    error_correction TEXT NOT NULL DEFAULT 'M',
    has_logo BOOLEAN NOT NULL DEFAULT false,
    created_by TEXT DEFAULT 'anonymous',
    download_count INTEGER NOT NULL DEFAULT 0
);
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert" ON public.qr_codes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Allow public read" ON public.qr_codes FOR SELECT TO anon, authenticated USING (true);`;

    try {
      await navigator.clipboard.writeText(sql);
      setCopiedSql(true);
      onNotify("Supabase SQL copied to clipboard", "success");
      setTimeout(() => setCopiedSql(false), 2500);
    } catch {
      onNotify("Failed to copy SQL", "error");
    }
  };

  return (
    <div className="relative z-10 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          About {BRAND.name}
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          A modern, high-precision utility for creating professional,
          customizable QR codes without redirects or tracking.
        </p>
      </div>

      {/* 1. What QRly Does & Core Features */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c101b]/80 backdrop-blur-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.06]">
          <Sparkles className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
            Core Highlights
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <Zap className="h-4 w-4 text-cyan-400" />
              <span>Direct Link Encoding</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Encodes the exact URL or handle directly into the QR code matrix.
              No intermediary redirect servers or vendor lock-in.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <Shield className="h-4 w-4 text-cyan-400" />
              <span>Full Privacy Guarantee</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              QR codes are rendered 100% client-side in your browser. Your links
              and logos are never tracked or sold.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <span>High Resolution Exports</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Export up to 2048×2048px ultra-sharp PNG or lossless vector SVG
              ready for Figma, packaging, print banners, and business cards.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-200">
              <CheckCircle2 className="h-4 w-4 text-cyan-400" />
              <span>Fault-Tolerant Center Logos</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Embed custom brand logos with automatic error correction
              adjustments (Quartile / High) to ensure optical scannability.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Developer Profile (Section 9 Placeholder Config) */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c101b]/80 backdrop-blur-xl p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Code2 className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Developer Profile
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Configurable in /src/data/developer.ts
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white">
                {developer.name}
              </span>
              <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                {developer.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              {developer.bio}
            </p>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap items-center gap-2">
            {developer.website && (
              <a
                href={developer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-300 hover:text-white border border-white/[0.06] transition-colors"
                title="Website"
              >
                <Globe className="h-3.5 w-3.5 text-cyan-400" />
                <span>Portfolio</span>
              </a>
            )}

            {developer.github && (
              <a
                href={developer.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-300 hover:text-white border border-white/[0.06] transition-colors"
                title="GitHub"
              >
                <Github className="h-3.5 w-3.5" />
                <span>GitHub</span>
              </a>
            )}

            {developer.linkedin && (
              <a
                href={developer.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-300 hover:text-white border border-white/[0.06] transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="h-3.5 w-3.5 text-blue-400" />
                <span>LinkedIn</span>
              </a>
            )}

            {developer.instagram && (
              <a
                href={developer.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-300 hover:text-white border border-white/[0.06] transition-colors"
                title="Instagram"
              >
                <Instagram className="h-3.5 w-3.5 text-pink-400" />
                <span>Instagram</span>
              </a>
            )}

            {developer.email && (
              <a
                href={`mailto:${developer.email}`}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-slate-300 hover:text-white border border-white/[0.06] transition-colors"
                title="Email"
              >
                <Mail className="h-3.5 w-3.5 text-emerald-400" />
                <span>Email</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* 3. Tech Stack & Architecture */}
      {/* <div className="rounded-2xl border border-white/[0.08] bg-[#0c101b]/80 backdrop-blur-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/[0.06]">
          <Cpu className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
            Technology Stack
          </h2>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          {[
            "React 19",
            "TypeScript",
            "Vite 6",
            "Tailwind CSS v4",
            "Three.js & WebGL Shaders (ThreeUI Dot Matrix)",
            "qrcode Engine",
            "Supabase Database",
            "Lucide React Icons",
            "Canvas Confetti",
          ].map((tech) => (
            <span
              key={tech}
              className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-slate-300 font-mono text-[11px]"
            >
              {tech}
            </span>
          ))}
        </div>
      </div> */}

      {/* 4. Supabase Cloud Connection & Schema */}
      {/* <div className="rounded-2xl border border-white/[0.08] bg-[#0c101b]/80 backdrop-blur-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <Database className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              Database Sync (Supabase)
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span
              className={`h-2 w-2 rounded-full ${
                isCloudConnected
                  ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
                  : "bg-cyan-400"
              }`}
            />
            <span className="text-slate-400 text-[11px]">
              {isCloudConnected ? "Cloud Sync Active" : "Local Engine Ready"}
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          QRly is designed offline-first: QR generation occurs directly in the
          browser with zero external dependencies. To sync QR creation history
          and download metrics across devices, add your Supabase credentials in{" "}
          <code className="bg-white/10 px-1 py-0.5 rounded text-cyan-300 font-mono text-[11px]">
            VITE_SUPABASE_URL
          </code>{" "}
          and{" "}
          <code className="bg-white/10 px-1 py-0.5 rounded text-cyan-300 font-mono text-[11px]">
            VITE_SUPABASE_ANON_KEY
          </code>
          .
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>SQL Schema (Run in Supabase SQL Editor):</span>
            <button
              onClick={handleCopySql}
              className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {copiedSql ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              <span>{copiedSql ? "Copied SQL!" : "Copy SQL Script"}</span>
            </button>
          </div>
          <pre className="p-3.5 rounded-xl bg-black/60 border border-white/[0.06] text-[11px] text-slate-300 font-mono overflow-x-auto max-h-48 leading-relaxed">
            {`CREATE TABLE IF NOT EXISTS public.qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    type TEXT NOT NULL DEFAULT 'website',
    original_url TEXT NOT NULL,
    display_name TEXT NOT NULL DEFAULT 'QR Code',
    foreground_color TEXT NOT NULL DEFAULT '#000000',
    background_color TEXT NOT NULL DEFAULT '#ffffff',
    size INTEGER NOT NULL DEFAULT 512,
    margin INTEGER NOT NULL DEFAULT 2,
    error_correction TEXT NOT NULL DEFAULT 'M',
    has_logo BOOLEAN NOT NULL DEFAULT false,
    created_by TEXT DEFAULT 'anonymous',
    download_count INTEGER NOT NULL DEFAULT 0
);
-- Complete file available in /supabase-schema.sql`}
          </pre>
        </div>
      </div> */}

      {/* 5. Modern Brand Name Suggestions */}
      {/* <div className="rounded-2xl border border-white/[0.08] bg-[#0c101b]/80 backdrop-blur-xl p-6 shadow-xl space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Suggested Alternative Brand Names
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          {BRAND_NAME_SUGGESTIONS.map((item) => (
            <div
              key={item.name}
              className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]"
            >
              <span className="font-bold text-white block">{item.name}</span>
              <span className="text-[10px] text-slate-400">{item.vibe}</span>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}
