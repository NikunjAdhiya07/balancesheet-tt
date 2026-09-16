import { formatCurrency } from "@/lib/format";

export default function StatCard({
  label,
  value,
  tone = "slate",
  sub,
}: {
  label: string;
  value: number;
  tone?: "orange" | "green" | "slate" | "red" | "blue";
  sub?: string;
}) {
  const tones: Record<string, string> = {
    orange: "from-orange-500 to-orange-600",
    green: "from-green-600 to-green-700",
    slate: "from-slate-700 to-slate-800",
    red: "from-red-600 to-red-700",
    blue: "from-blue-600 to-blue-700",
  };
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className={`h-1.5 w-full bg-gradient-to-r ${tones[tone]}`} />
      <div className="p-4">
        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {label}
        </div>
        <div className="mt-1 text-2xl font-bold text-slate-800">
          {formatCurrency(value)}
        </div>
        {sub && <div className="mt-1 text-xs text-slate-400">{sub}</div>}
      </div>
    </div>
  );
}
