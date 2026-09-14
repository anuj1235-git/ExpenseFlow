export const currencySymbols= {
  INR:'₹',
  USD:'$',
  EUR:'€',
  GBP:'£'
}
;
export function formatCurrency(value,
currency='INR') {
  return new Intl.NumberFormat(currency==='INR'?'en-IN':'en-US',
  {
    style:'currency',
    currency,
    maximumFractionDigits:0
  }
).format(Number(value)||0)
}
