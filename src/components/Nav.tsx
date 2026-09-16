"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/income", label: "Income" },
  { href: "/expense", label: "Expense" },
  { href: "/transactions", label: "Transactions" },
  { href: "/balance-sheet", label: "Balance Sheet" },
];

export default function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const year = Number(searchParams.get("year")) || new Date().getFullYear();

  const [years, setYears] = useState<number[]>([year]);
  const [adding, setAdding] = useState(false);
  const [newYear, setNewYear] = useState("");

  useEffect(() => {
    fetch("/api/years")
      .then((r) => r.json())
      .then((data: { years: number[] }) => {
        if (data.years?.length) setYears(data.years);
      })
      .catch(() => {});
  }, []);

  function withYear(href: string, y: number) {
    return `${href}?year=${y}`;
  }

  function changeYear(y: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", String(y));
    router.push(`${pathname}?${params.toString()}`);
  }

  async function addYear() {
    const y = Number(newYear);
    if (!Number.isInteger(y) || y < 2000 || y > 2200) return;
    await fetch("/api/years", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year: y }),
    });
    setYears((prev) => Array.from(new Set([...prev, y])).sort((a, b) => a - b));
    setAdding(false);
    setNewYear("");
    changeYear(y);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-orange-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-orange-500 via-white to-green-600 text-xs font-bold text-slate-800 shadow ring-1 ring-slate-300">
            TT
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold text-slate-800">
              Table Tennis Players of Surendranagar
            </div>
            <div className="text-[11px] text-slate-500">
              Income &amp; Expense Manager
            </div>
          </div>
        </div>

        <nav className="ml-auto flex flex-wrap items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={withYear(item.href, year)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-orange-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-orange-50 hover:text-orange-700"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Year:</span>
          <select
            value={year}
            onChange={(e) => changeYear(Number(e.target.value))}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-semibold text-slate-700 focus:border-orange-500 focus:outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          {adding ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                type="number"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                placeholder="2029"
                className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-orange-500 focus:outline-none"
              />
              <button
                onClick={addYear}
                className="rounded-md bg-green-600 px-2 py-1 text-xs font-semibold text-white hover:bg-green-700"
              >
                Add
              </button>
              <button
                onClick={() => setAdding(false)}
                className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="rounded-md border border-dashed border-orange-400 px-2 py-1 text-xs font-medium text-orange-700 hover:bg-orange-50"
            >
              + Year
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
