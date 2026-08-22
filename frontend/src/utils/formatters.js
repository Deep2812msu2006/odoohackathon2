export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  return `${formatDate(startDate)} - ${formatDate(endDate)} (${days} day${days > 1 ? 's' : ''})`;
};

export const getCategoryBadgeColor = (category) => {
  switch (category?.toLowerCase()) {
    case 'sightseeing':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'food':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 'adventure':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'culture':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'nightlife':
      return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    case 'relaxation':
      return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
    case 'shopping':
      return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};
