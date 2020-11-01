export const icxFormat = (amount, decimal) => {
    if (decimal) {
        return new Intl.NumberFormat('en-US',  { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(amount);
    }
    else {
        return new Intl.NumberFormat('en-US',  { maximumFractionDigits: 2}).format(amount); 
    }

}