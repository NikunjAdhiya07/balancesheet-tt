"use client";

import { useEffect, useRef, useState } from "react";

export default function PrintFrame({ src }: { src: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.75);

  useEffect(() => {
    function computeScale() {
      const container = iframeRef.current?.parentElement;
      if (!container) return;
      const pageWidthPx = (210 / 25.4) * 96; // A4 width in px at 96dpi
      const available = container.clientWidth - 24;
      setScale(Math.min(1, available / pageWidthPx));
    }
    computeScale();
    window.addEventListener("resize", computeScale);
    return () => window.removeEventListener("resize", computeScale);
  }, []);

  const pageHeightPx = (297 / 25.4) * 96;
  const pageWidthPx = (210 / 25.4) * 96;

  return (
    <div className="flex justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-3">
      <div
        style={{
          width: pageWidthPx * scale,
          height: pageHeightPx * scale * 1.15,
          overflow: "hidden",
        }}
      >
        <iframe
          ref={iframeRef}
          src={src}
          title="Balance Sheet Preview"
          style={{
            width: pageWidthPx,
            height: pageHeightPx * 1.15,
            border: "none",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            background: "#fff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
          }}
        />
      </div>
    </div>
  );
}
