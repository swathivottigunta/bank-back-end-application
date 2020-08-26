const convertToCAD = (amount, currency) => {
  let convertedAmount = amount;
  if (currency === 'USD') convertedAmount = amount / 0.5;
  else if (currency === 'MXN') convertedAmount = amount / 10;

  return convertedAmount;
};

module.exports = convertToCAD;
