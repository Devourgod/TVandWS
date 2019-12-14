import {Decimal} from 'decimal.js-light'

/**
 * @description 科学计数法转为string
 * @param {string, number, Decimal} param
 */
export const scientificNumToString = (param) => {
  if (param === '' || param === null || isNaN(param)) return ''
  let strParam = String(param)
  let flag = /e/.test(strParam)
  if (!flag) return param

  // 指数符号 true: 正，false: 负
  let sysbol = true
  if (/e-/.test(strParam)) {
    sysbol = false
  }
  // 指数
  let index = Number(strParam.match(/\d+$/)[0])
  // 基数
  let basis = strParam.match(/^[\d.]+/)[0].replace(/\./, '')

  if (sysbol) {
    return basis.padEnd(index + 1, 0)
  } else {
    return basis.padStart(index + basis.length, 0).replace(/^0/, '0.')
  }
}

/**
 * 加法
 * @param num1
 * @param num2
 * @return {String}
 */
export const plus = (num1, num2) => {
  return scientificNumToString(new Decimal(num1).plus(new Decimal(num2)).toNumber())
}

/**
 * 减法
 * @param num1
 * @param num2
 * @return {String}
 */
export const sub = (num1, num2) => {
  return scientificNumToString(new Decimal(num1).sub(new Decimal(num2)).toNumber())
}

/**
 * 乘法
 * @param num1
 * @param num2
 * @return {String}
 */
export const mul = (num1, num2) => {
  return scientificNumToString(new Decimal(num1).mul(new Decimal(num2)).toNumber())
}

/**
 * 除法
 * @param num1
 * @param num2
 * @return {String}
 */
export const div = (num1, num2) => {
  return scientificNumToString(new Decimal(num1).div(new Decimal(num2)).toNumber())
}

/**
 * 四舍五入，默认是保留两位小数
 * example: 3.255 => 3.26; 3 => 3.00
 * @param num
 * @param roundRange
 * @return {string}
 */
export const round = (num, roundRange = 2) => {
  return new Decimal(scientificNumToString(num)).toFixed(roundRange)
}

/**
 * 两个数比较大小，x是否大于y
 * @param x
 * @param y
 * @return {boolean}
 */
export const isGreater = (x, y) => {
  const res = new Decimal(x).comparedTo(new Decimal(y))
  return res === 1 // 1表示 x 大于 y
}

/**
 * 两个数比较大小，x是否小于y
 * @param x
 * @param y
 * @return {boolean}
 */
export const isLess = (x, y) => {
  const res = new Decimal(x).comparedTo(new Decimal(y))
  return res === -1 // -1表示 x 小于 y
}

/**
 * 截取fixedNum位小数或者补齐小数点后面的0够fixedNum位 (2.2, 4) => 2.2000, (2.3364, 2) => 2.33
 * @param num
 * @param fixedNum
 * @return {string}
 */
export const toFixed = (num, fixedNum) => {
  return new Decimal(num).toFixed(fixedNum, Decimal.ROUND_DOWN)
}
