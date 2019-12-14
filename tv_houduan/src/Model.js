const { errorRes, successRes } = require('./helper.js');
const Model = {
    'BTC/USDT_1': require('./BTC_USDT/1.js'),
    'BTC/USDT_15': require('./BTC_USDT/15.js'),
    'ETH/USDT_1': require('./ETH_USDT/1.js'),
    'ETH/USDT_15': require('./ETH_USDT/15.js'),
    'ETH/BTC_1': require('./ETH_BTC/1.js'),
    'ETH/BTC_15': require('./ETH_BTC/15.js')
} // 模拟数据库数据或者缓存数据

/**
 * 获取币种历史数据,下面例子
 * @example [symbol:'BTC/USDT', resolution: 1, from:1569985228000, to:1570077088000]
 *
 * @param {
 * symbo,
 *  resolution,
 *  from,
 *  to}
 */
const getHistoryList = ({ symbol, resolution, from, to }) => {
    console.log(`请求币种${symbol}`);
    console.log(`请求周期${resolution}`);
    console.log(`请求时间段${from} - ${to}`); // 这里根据前端要求的时间给对应的时间段的数据，我这里没做判断就直接给了一个写死的数据
    return Model[`${symbol}_${resolution}`] ? successRes(Model[`${symbol}_${resolution}`]) : errorRes()
}

/**
 * 获取所有币种基本配置信息
 */
const getAllSymbolInfo = (query) => {
    return successRes({
        'ETH/BTC': {
            symbol: 'ETH/BTC', // 交易对
            coinSymbol: 'ETH', // 交易币种
            baseSymbol: 'BTC', // 基本币种
            coinScale: 4, // 表示交易币种保留4位小数位
            baseCoinScale: 6 // 表示基本币种保留6位小数位
        },
        'BTC/USDT': {
            symbol: 'BTC/USDT', // 交易对
            coinSymbol: 'BTC', // 交易币种
            baseSymbol: 'USDT', // 基本币种
            coinScale: 6, // 表示交易币种保留4位小数位
            baseCoinScale: 2 // 表示基本币种保留6位小数位
        },
        'ETH/USDT': {
            symbol: 'ETH/USDT', // 交易对
            coinSymbol: 'ETH', // 交易币种
            baseSymbol: 'USDT', // 基本币种
            coinScale: 4, // 表示交易币种保留4位小数位
            baseCoinScale: 2 // 表示基本币种保留6位小数位
        }
    })
}

/**
 * 获取基础币种列表，就是市场
 */
const getBaseSymbolList = (query) => {
    return successRes(['USDT', 'BTC'])
}

/**
 * 获取交易对缩略行情列表
 */
const getSymbolThumb = (query) => {
    return successRes(
        [{
            "symbol": "BTC/USDT",
            "baseSymbol": "USDT",
            "coinSymbol": "BTC",
            "open": "8237.46",
            "high": "8394.94",
            "low": "8176.57",
            "close": "8275.23",
            "chp": "0.0046",
            "change": "37.77",
            "volume": "216",
            "usdRate": "8275.23"
        }, {
            "symbol": "ETH/BTC",
            "baseSymbol": "BTC",
            "coinSymbol": "ETH",
            "open": "0.021339",
            "high": "0.021717",
            "low": "0.021291",
            "close": "0.021454",
            "chp": "0.0054",
            "change": "0.000115",
            "volume": "10923",
            "usdRate": "177.53678442"
        }, {
            "symbol": "ETH/USDT",
            "baseSymbol": "USDT",
            "coinSymbol": "ETH",
            "open": "175.45",
            "high": "181.13",
            "low": "174.93",
            "close": "177.54",
            "chp": "0.012",
            "change": "2.09",
            "volume": "10837",
            "usdRate": "177.54"
        }]
    )
}

module.exports = {
    getHistoryList,
    getAllSymbolInfo,
    getBaseSymbolList,
    getSymbolThumb
}

