"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatCurrency } from "@/lib/format";

export default function OpeningBalanceEditor({
  year,
  openingCash,
  openingMain,
  openingSecretary,
}: {
  year: number;
  openingCash: number;
  openingMain: number;
  openingSecretary: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [cash, setCash] = useState(String(openingCash));
  const [main, setMain] = useState(String(openingMain));
  const [secretary, setSecretary] = useState(String(openingSecretary));
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await fetch(`/api/years/${year}/opening-balance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opening_cash: Number(cash) || 0,
          opening_main_account: Number(main) || 0,
          opening_secretary_account: Number(secretary) || 0,
        }),
      });
      router.refresh();
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-700">
            Opening Balance ({year})
          </h3>
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            Edit
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <Stat label="Cash" value={openingCash} />
          <Stat label="Main Account" value={openingMain} />
          <Stat label="Secretary Account" value={openingSecretary} />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-orange-200 bg-orange-50/40 p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-bold text-slate-700">
        Edit Opening Balance ({year})
      </h3>
      <div className="grid grid-cols-3 gap-2">
        <NumInput label="Cash" value={cash} onChange={setCash} />
        <NumInput label="Main Account" value={main} onChange={setMain} />
        <NumInput label="Secretary Account" value={secretary} onChange={setSecretary} />
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={() => setEditing(false)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-white"
        >
          Cancel
        </button>
        <button
          onClick={save}
          disabled={saving}
          className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-slate-50 p-2">
      <div className="text-[11px] uppercase text-slate-400">{label}</div>
      <div className="font-semibold text-slate-700">{formatCurrency(value)}</div>
    </div>
  );
}

function NumInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-500">
      {label}
      <input
        type="number"
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-orange-500 focus:outline-none"
      />
    </label>
  );
}
