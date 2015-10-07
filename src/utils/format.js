import numeral from 'numeral';

export default {
  assetPrecision: (precision) => {
    return Math.pow(10, precision);
  },

  assetAmount: (amount, asset) => {
    return amount / this.assetPrecision(asset.precision);
  },

  number: (number, decimals, trailingZeros = true) => {
    if (isNaN(number) || number === undefined || number === null) return '';
    let zeros = '.';
    for (let i = 0; i < decimals; i++) {
      zeros += '0';
    }
    let num = numeral(number).format('0,0' + zeros);
    if (num.indexOf('.') > 0 && !trailingZeros) {
      return num.replace(/0+$/, '').replace(/\.$/, '');
    }
    return num;
  },

  round: (number, asset) => {
    let precision = this.assetPrecision(asset.precision);
    return Math.round(number * precision) / precision;
  },

  asset: (amount, asset, noSymbol, trailingZeros = true) => {
    let symbol;
    let digits = 0;
    if (!asset) {
      return undefined;
    }

    symbol = asset.symbol;
    digits = asset.precision;
    let precision = this.assetPrecision(digits);

    return `${this.format_number(amount / precision, digits, trailingZeros)}${!noSymbol ? ' ' + symbol : ''}`;
  }
};
