const http = require('http');
const url = require('url');
const Model = require('./Model.js');
const { errorRes } = require('./helper.js');

const API = {
    // https://api.xxx.com/api/v1/trade/history?resolution=1&symbol=BTC%2FUSDT&from=1569985228000&to=1570077088000
    '/trade/history': Model.getHistoryList,
    '/trade/allSymbolInfo': Model.getAllSymbolInfo,
    '/trade/symbolThumb': Model.getSymbolThumb,
    '/trade/baseSymbolList': Model.getBaseSymbolList
}

const httpServer = http.createServer((req, res) => {
    const urlObj = url.parse(req.url, true);
    const query = urlObj.query;

    res.setHeader('access-control-allow-headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader('access-control-allow-methods', '*');
    res.setHeader('access-control-allow-origin', '*');

    let resData = errorRes();

    if (API[urlObj.pathname]) {
        resData = API[urlObj.pathname](query);
        res.setHeader('content-type', 'application/json;charset=UTF-8');
    } else {
        res.writeHeader(404);
    }

    res.end(JSON.stringify(resData));
});

httpServer.listen(3000, () => {
    console.log('服务启动了在3000端口');
});





const io = require('socket.io')(httpServer);

let clientArray = []; // 表示有几个客户端连接了

io.on('connection', socket => {
    console.log(`目前又有新的客户端连接了，连接id是${socket.id}`);
    clientArray.push(socket);
    console.log(`目前一共有${clientArray.length}个客户端连接`);

    let symbol, resolution; // 表示当前订阅的交易对和对应的周期

    socket.on('disconnect', () => {
        interval && clearInterval(interval)
        clientArray = clientArray.filter(item => item.id !== socket.id);
        console.log(`id是${socket.id}的客户端断开连接了`);
        console.log(`目前一共还有${clientArray.length}个客户端在连接中`);
    });

    socket.on('subscribeKlineData', data => {
        // 前端订阅新的k线
        console.log('订阅交易对：', data.symbol);
        console.log('订阅交易对的周期是：', data.resolution);
        symbol = data.symbol;
        resolution = data.resolution;
    });

    let i = 0
    const interval = setInterval(() => {

        let time_1 = Math.floor(+new Date() / 1000 / 60) * 60 * 1000
        let time_15 = Math.floor(+new Date() / 1000 / 60 / 15) * 60 * 1000 * 15

        const data = {
            symbol: symbol,
            resolution: resolution, // 周期， intervalList中的一项
            time: resolution === '1' ? time_1 : time_15 // 比如周期resolution是1分钟，那就返回当前utc时间当前分钟的整点的那个毫秒时间戳
        }

        if (symbol === 'BTC/USDT') { // 这里模拟 BTC/USDT推送
            data.open = '8113.12345'
            data.high = '8703.12345'
            data.low = '8013.12345'
            data.close = ['8213.12345', '8603.12345'][i]
            data.volume = '0.2'
        } else if (symbol === 'ETH/BTC') { // 这里模拟 ETH/BTC推送
            data.open = '0.021372'
            data.high = '0.021448'
            data.low = '0.021369'
            data.close = ['0.021389', '0.021689'][i]
            data.volume = '100.3415'
        } else if (symbol === 'ETH/USDT') { // 这里模拟 ETH/USDT推送
            data.open = '174.11'
            data.high = '175.34'
            data.low = '171.95'
            data.close = ['174.27', '174.87'][i]
            data.volume = '20.3415'
        }
        socket.emit('klineNewData', data);
        console.log(`${+new Date()}, 向客户端${socket.id}推送新的成交数据,当前symbol: ${symbol}, resolution: ${resolution}`);

        i = i === 0 ? 1 : 0;
    }, 5 * 1000);
});
