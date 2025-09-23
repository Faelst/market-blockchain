export function formatEth(v?: number | string) {
  if (v == null) return '';
  const num = typeof v === 'string' ? Number(v) : v;
  if (Number.isNaN(num)) return String(v);
  return `${num.toFixed(3)} ETH`;
}