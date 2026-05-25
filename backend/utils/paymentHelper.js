export const calcPaymentStatus = (total, advance) => {
  if (advance <= 0) return 'Pending';
  if (advance >= total) return 'Paid';
  return 'Partial';
};

export const calcRemaining = (total, advance) => Math.max(0, total - advance);
