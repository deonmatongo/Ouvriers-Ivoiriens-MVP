export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('fr-CI', {
    day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(date));
}

export function formatCurrency(amount: number, currency = 'XOF') {
  return new Intl.NumberFormat('fr-CI', {
    style: 'currency', currency,
  }).format(amount);
}
