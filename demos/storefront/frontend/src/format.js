export function formatPrice(paise) {
  return `₹${(paise / 100).toFixed(2)}`;
}
