"use client";

import { useEffect, useRef, useState } from "react";

const A4_WIDTH_PX = (210 / 25.4) * 96;
const A4_HEIGHT_PX = (297 / 25.4) * 96;

export default function PrintFrame({ src }: { src: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0.75);
  const [contentHeight, setContentHeight] = useState(A4_HEIGHT_PX);

  useEffect(() => {
    function computeScale() {
      const frame = iframeRef.current;
      const shell = frame?.closest("[data-print-shell]") as HTMLElement | null;
      if (!shell) return;
      const available = shell.clientWidth - 24;
      setScale(Math.min(1, available / A4_WIDTH_PX));
    }
    computeScale();
    window.addEventListener("resize", computeScale);
    return () => window.removeEventListener("resize", computeScale);
  }, []);

  function handleLoad() {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!doc?.body) return;

    doc.documentElement.style.overflow = "hidden";
    doc.body.style.overflow = "hidden";
    doc.body.style.margin = "0";

    const page = doc.querySelector("[data-balance-sheet]") as HTMLElement | null;
    const height = Math.max(
      page?.scrollHeight ?? 0,
      doc.documentElement.scrollHeight,
      doc.body.scrollHeight,
      A4_HEIGHT_PX
    );
    setContentHeight(height + 8);
  }

  return (
    <div
      data-print-shell
      className="flex max-h-[80vh] justify-center overflow-auto rounded-xl border border-slate-200 bg-slate-100 p-3"
    >
      <div
        style={{
          width: A4_WIDTH_PX * scale,
          height: contentHeight * scale,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <iframe
          ref={iframeRef}
          src={src}
          title="Balance Sheet Preview"
          scrolling="no"
          onLoad={handleLoad}
          style={{
            width: A4_WIDTH_PX,
            height: contentHeight,
            border: "none",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            background: "#fff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
            pointerEvents: "none",
          }}
        />
      </div>
    </div>
  );
}
