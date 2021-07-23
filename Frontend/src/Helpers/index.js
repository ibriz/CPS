export const icxFormat = (amount, decimal) => {
  if (decimal) {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(amount);
  } else {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(
      amount,
    );
  }
};

export const calculatePercentage = ({ total, actual }) => {
  return !total || parseInt(total) === 0 ? 0 : (actual / total) * 100;
};

export const formatDescription = desc => {
  let description = desc
    ?.slice()
    ?.replace(
      /<figure class="media"><oembed url="(.*?)"><\/oembed><\/figure>(<p>&nbsp;<\/p>)*/g,
      `<p><a href="$1" target="_blank">$1</a></p>`,
    );
  description = description
    ?.slice()
    ?.replace(
      /<p>(https*:\/\/.*?)<\/p>/g,
      `<p><a href="$1" target="_blank">$1</a></p>`,
    );
  return description;
};
