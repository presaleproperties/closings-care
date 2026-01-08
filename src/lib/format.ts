import { format, parseISO, isValid } from 'date-fns';

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatCurrencyFull(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '$0.00';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '—';
    return format(date, 'MMM d, yyyy');
  } catch {
    return '—';
  }
}

export function formatDateShort(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return '—';
    return format(date, 'MMM d');
  } catch {
    return '—';
  }
}

export function formatMonth(monthString: string): string {
  try {
    const date = parseISO(`${monthString}-01`);
    if (!isValid(date)) return monthString;
    return format(date, 'MMMM yyyy');
  } catch {
    return monthString;
  }
}

export function getCurrentMonth(): string {
  return format(new Date(), 'yyyy-MM');
}

export function getMonthRange(startOffset: number, count: number): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = startOffset; i < startOffset + count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
    months.push(format(date, 'yyyy-MM'));
  }
  return months;
}
