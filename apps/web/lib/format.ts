export function formatCurrency(value: number | string): string {
  const v = Number(value);
  if (isNaN(v)) return String(value);
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}K`;
  return `$${v.toFixed(0)}`;
}
