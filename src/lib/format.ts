export function formatCurrency(amount: number): string {
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  const formatted = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(rounded));
  return `${rounded < 0 ? "-" : ""}₹ ${formatted}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
