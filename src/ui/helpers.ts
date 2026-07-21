/** Format utility functions for the MediGo UI. */

/** Formats a numeric value into Indian Rupees (₹) currency format. */
export function formatRupees(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0, // usually integers or clinical invoices, let's keep clean
  }).format(amount);
}

/** Formats a date string or Date object into 'dd MMM yyyy' Indian format (e.g. 21 Jul 2026). */
export function formatIndianDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "—";
  
  const day = d.getDate();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  return `${day} ${month} ${year}`;
}
