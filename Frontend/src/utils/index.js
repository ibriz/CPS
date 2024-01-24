export function findFutureMonth(numMonths) {
  const currentMonth = new Date().getMonth();
  // console.log(currentMonth);
  const futureMonthIndex = (Number(currentMonth) + Number(numMonths)) %12;
  // console.log(futureMonthIndex);

  // Array of month names
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const futureMonth = monthNames[futureMonthIndex];
  return futureMonth;
}
