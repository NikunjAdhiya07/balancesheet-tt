"use client";

import { useEffect, useId, useRef, useState } from "react";

export default function TruncatedText({
  text,
  className = "",
  empty = "—",
}: {
  text: string | null | undefined;
  className?: string;
  empty?: string;
}) {
  const value = text?.trim() || "";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLButtonElement>(null);
  const tipId = useId();

  useEffect(() => {
    if (!open) return;

    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!value) {
    return <span className={className}>{empty}</span>;
  }

  return (
    <button
      ref={rootRef}
      type="button"
      className={`relative max-w-full cursor-pointer border-0 bg-transparent p-0 text-left ${className}`}
      title={value}
      aria-expanded={open}
      aria-describedby={open ? tipId : undefined}
      onClick={(e) => {
        e.stopPropagation();
        setOpen((v) => !v);
      }}
    >
      <span className="block truncate underline decoration-dotted decoration-slate-300 underline-offset-2">
        {value}
      </span>
      {open && (
        <span
          id={tipId}
          role="tooltip"
          className="absolute left-0 top-full z-30 mt-1 w-max max-w-[min(18rem,70vw)] rounded-md border border-slate-200 bg-slate-900 px-2.5 py-1.5 text-xs font-normal leading-snug text-white shadow-lg"
        >
          {value}
        </span>
      )}
    </button>
  );
}
