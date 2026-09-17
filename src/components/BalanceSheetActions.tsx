"use client";

import { useState } from "react";

export default function BalanceSheetActions({ year }: { year: number }) {
  const [loading, setLoading] = useState<"pdf" | "word" | null>(null);

  async function download(kind: "pdf" | "word") {
    setLoading(kind);
    try {
      const res = await fetch(`/api/export/${kind}?year=${year}`);
      if (!res.ok) {
        let detail = "Export failed";
        try {
          const data = (await res.json()) as { error?: string };
          if (data.error) detail = data.error;
        } catch {
          /* ignore non-JSON error bodies */
        }
        throw new Error(detail);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Tiranga-Balance-Sheet-${year}.${kind === "pdf" ? "pdf" : "docx"}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Export failed. Please try again.";
      alert(message);
    } finally {
      setLoading(null);
    }
  }

  function printNow() {
    window.open(`/print/balance-sheet?year=${year}&autoprint=1`, "_blank");
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => download("pdf")}
        disabled={loading !== null}
        className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-orange-700 disabled:opacity-60"
      >
        {loading === "pdf" ? "Generating PDF..." : "Export PDF"}
      </button>
      <button
        onClick={() => download("word")}
        disabled={loading !== null}
        className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-800 disabled:opacity-60"
      >
        {loading === "word" ? "Generating Word..." : "Export Word"}
      </button>
      <button
        onClick={printNow}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
      >
        Print
      </button>
    </div>
  );
}
