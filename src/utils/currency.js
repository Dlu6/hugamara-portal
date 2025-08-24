// Currency utility functions for Ugandan Shilling (UGX)

export const formatUGX = (amount, options = {}) => {
  const defaultOptions = {
    style: "currency",
    currency: "UGX",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
    ...options,
  };

  try {
    return new Intl.NumberFormat("en-UG", defaultOptions).format(amount);
  } catch (error) {
    // Fallback formatting if Intl is not supported
    return `USh ${amount.toLocaleString()}`;
  }
};

export const formatUGXCompact = (amount) => {
  if (amount >= 1000000) {
    return `USh ${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `USh ${(amount / 1000).toFixed(1)}K`;
  } else {
    return `USh ${amount}`;
  }
};

export const getUGXSymbol = () => "USh";

export const getUGXCode = () => "UGX";
