import { useState, useEffect, useCallback } from "react";
import { StructureFlowCollection } from "@designcodeio/threeui";
import "@designcodeio/threeui/style.css";

import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ToastContainer } from "./components/Toast";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { History } from "./pages/History";
import { fetchRecentQRCodes } from "./lib/supabase";
import type { PlatformType, ToastNotification } from "./types";

export default function App() {
  const [currentTab, setCurrentTab] = useState<"generator" | "history" | "about">("generator");
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [historyCount, setHistoryCount] = useState<number>(0);
  const [reopenData, setReopenData] = useState<{ url: string; type: PlatformType } | null>(null);

  const addToast = useCallback(
    (message: string, type: "success" | "info" | "error" = "info") => {
      const id = "toast-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
      const newToast: ToastNotification = { id, message, type };
      setToasts((prev) => [...prev.slice(-3), newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshHistoryCount = useCallback(async () => {
    try {
      const list = await fetchRecentQRCodes();
      setHistoryCount(list.length);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    refreshHistoryCount();
  }, [refreshHistoryCount]);

  const handleOpenInGenerator = (url: string, type: PlatformType) => {
    setReopenData({ url, type });
    setCurrentTab("generator");
    addToast("Loaded QR settings into generator", "info");
  };

  return (
    <div className="min-h-screen bg-[#05070c] text-slate-100 flex flex-col relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 
        THREEUI VISUAL BACKGROUND SPECIFICATION:
        Variant: Dot Matrix ("dot-matrix")
        Props: speed=1.00, gridScale=60, mouseAmount=0.040, pulseSpeed=0.40, hue=0, radius=0.150, opacity=0.35
      */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <StructureFlowCollection
          variant="dot-matrix"
          speed={1.0}
          gridScale={60}
          mouseAmount={0.04}
          pulseSpeed={0.4}
          hue={0}
          radius={0.15}
          opacity={0.35}
        />
        {/* Subtle radial & linear scrim to ensure pristine text readability and high contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#05070c]/70 via-[#05070c]/40 to-[#05070c]/90 pointer-events-none" />
      </div>

      {/* Primary Application Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        historyCount={historyCount}
      />

      {/* Main View Port */}
      <main className="flex-1 flex flex-col relative z-10">
        {currentTab === "generator" && (
          <Home
            onNotify={addToast}
            onHistoryUpdated={refreshHistoryCount}
            initialUrl={reopenData?.url}
            initialType={reopenData?.type}
          />
        )}

        {currentTab === "history" && (
          <History
            onOpenInGenerator={handleOpenInGenerator}
            onNotify={addToast}
            onHistoryCountChange={setHistoryCount}
          />
        )}

        {currentTab === "about" && <About onNotify={addToast} />}
      </main>

      {/* Application Footer */}
      <Footer onOpenAbout={() => setCurrentTab("about")} />

      {/* Toast Notification Stack */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
