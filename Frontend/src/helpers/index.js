export const icxFormat = (amount, decimal) => {
    if (decimal) {
        return new Intl.NumberFormat('en-US',  { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(amount);
    }
    else {
        return new Intl.NumberFormat('en-US',  { maximumFractionDigits: 2}).format(amount); 
    }

}

export const calculatePercentage = ({
    total,
    actual
}) => {
    return ((!total || parseInt(total) === 0) ? 0 : ((actual / total) * 100));
}