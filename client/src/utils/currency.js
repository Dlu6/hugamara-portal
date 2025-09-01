export const formatCurrency = (amount, currency = 'UGX') => {
  if (!amount && amount !== 0) return 'UGX 0';
  
  const numAmount = parseFloat(amount);
  
  if (currency === 'UGX') {
    return `UGX ${numAmount.toLocaleString('en-UG', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })}`;
  }
  
  return new Intl.NumberFormat('en-UG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(numAmount);
};

export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  return parseFloat(currencyString.replace(/[^\d.-]/g, '')) || 0;
};

// Alias for UGX formatting to support existing imports
export const formatUGX = (amount) => formatCurrency(amount, 'UGX');
