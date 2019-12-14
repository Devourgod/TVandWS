<template>
  <div class="trading-view">
    <ul class="tv-header">
      <!--1、中文：1分、15分、30分、1小时、4小时、日线、周线、月线-->
      <!--2、英文：1min、15min、30min、1hour、4hour、1day、1week、1mon-->
      <li class="tv-header-item" :class="{active: interval === '1'}" @click="setResolution('1')">1分</li>
      <li class="tv-header-item" :class="{active: interval === '15'}" @click="setResolution('15')">15分</li>
      <!--<li class="tv-header-item" :class="{active: interval === '30'}" @click="setResolution('30')">30分</li>-->
      <!--<li class="tv-header-item" :class="{active: interval === '60'}" @click="setResolution('60')">1小时</li>-->
      <!--<li class="tv-header-item" :class="{active: interval === '240'}" @click="setResolution('240')">4小时</li>-->
      <!--<li class="tv-header-item" :class="{active: interval === 'D'}" @click="setResolution('D')">日线</li>-->
      <!--<li class="tv-header-item" :class="{active: interval === 'W'}" @click="setResolution('W')">周线</li>-->
      <!--<li class="tv-header-item" :class="{active: interval === 'M'}" @click="setResolution('M')">月线</li>-->
    </ul>
    <div class="tv-chart" :id="containerId"></div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {getHistoryKLineApi} from '@/config/api'//引入历史K线接口
  import {ERR_CODE_OK} from '@/config/base'//成功状态码

  const TRADE_INTERVAL = 'TRADE_INTERVAL'
  const intervalList = ['1', '15', '30', '60', '240', 'D', 'W', 'M'] // 周期列表，和后端约定好

  export default {
    name: 'trading-view',
    props: {
      coinSymbol: {
        type: String
      },
      baseSymbol: {
        type: String
      },
      allSymbolInfo: {
        type: Object,
        required: true
      }
    },
    data() {
      let interval = '15' // 默认1分钟 只能是intervalList 中的一项
      const i = localStorage.getItem(TRADE_INTERVAL) || '' // 从本地拿，有就赋值
      if (i && intervalList.includes(i)) {
        interval = i
      }
      return {
        containerId: 'TVChartContainer',
        interval
      }
    },
    created() {
      this.tvWidget = null
      this.intradayMultipliers = ['1', '15', '30', '60', '240']
      this.onRealtimeCallback = null // tv实时更新回调函数 
    },
    methods: {
      getInterval() {
        return this.interval
      },
      // 最后一步 如果 设置周期 当切换1分钟周期的时候 会通过$emit告诉服务端 周期改变了，请推送相应周期的数据
      setResolution(interval) {//TV内置方法
        if (this.tvWidget) {
          this.interval = interval
          this.$nextTick(() => {
            this.tvWidget.chart().setResolution(interval, () => {
              console.log(`设置周期${interval}成功`, this.interval)
              localStorage.setItem(TRADE_INTERVAL, interval) // 存一份到本地
              this.$emit('setResolution', interval)
            })
          })
        }
      },
      init() {//初始化样式
        const locale = 'zh'//语言为中文
        const widgetOptions = {
          debug: process.env.NODE_ENV === 'development',
          symbol: this.symbol,//当前的交易对
          datafeed: this.datafeedCreate(),//数据地址 
          interval: this.interval,//默认显示时间分辨率
          container_id: this.containerId,//k线div容器id
          library_path: '/charting_library/',//文件夹的路径
          locale: locale,
          charts_storage_url: 'https://saveload.tradingview.com',//图表储存路径
          client_id: 'tradingview.com',//浏览器ID
          user_id: 'public_user_id',//用户id
          fullscreen: false,//显示图表是否占用窗口中所有可用的空间
          autosize: true,//是否全屏
          disabled_features: [
            'header_widget', // 是否显示整条顶部工具条
            'timeframes_toolbar', // 底部时间条
            'volume_force_overlay', // 交易量与k线柱子分离
             'widget_logo' // 隐藏tradindview logo
          ],
          enabled_features: ['hide_last_na_study_output'],//启用图表某个功能
          overrides: {
            'volumePaneSize': 'medium',
            'paneProperties.topMargin': 5,
            'paneProperties.bottomMargin': 5,
            'paneProperties.horzGridProperties.color': 'rgba(34, 39, 55, .6)', // 水平网格线
            'paneProperties.vertGridProperties.color': 'rgba(34, 39, 55, .6)', // 竖直网格线
            'scalesProperties.lineColor': '#505675',
            'paneProperties.legendProperties.showLegend': true, // 展开四条均线
            'paneProperties.legendProperties.showBarChange': false // 显示OHLC后面的涨跌幅
          },
          timezone: 'Asia/Shanghai',//时区
          theme: 'Dark',
          timeframe: '2M',//2个月
          has_no_volume: false,
          customFormatters: {
            timeFormatter: {
              format: function (date) {
                const format = a => (a < 10 ? `0${a}` : a)
                let h = format(date.getUTCHours())
                let m = format(date.getUTCMinutes())
                // let s = format(date.getUTCSeconds())
                return `${h}:${m}`
              }
            },
            dateFormatter: {
              format: function (date) {
                const format = a => (a < 10 ? `0${a}` : a)
                let Y = date.getUTCFullYear()
                let M = format(1 + date.getUTCMonth())
                let D = format(date.getUTCDate())
                return `${Y}-${M}-${D}`
              }
            }
          }
        }
        /* eslint-disable */
        this.tvWidget = new TradingView.widget(widgetOptions)
        this.tvWidget.onChartReady(() => {
          this.createStudy()
        })
      },

      // 创建数据源 设置数据类型
      datafeedCreate() {
        return {
          onReady: cb => {
            //TV---第一个方法
            const config = {
              supported_resolutions: intervalList
            }
            setTimeout(() => cb(config), 0)
          },
          resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
            //TV第3个方法--解析商品---   三个参数是商品名称，连接成功后商品所有信息，商品连接出错的回调函数
            let symbolStub = {//商品体系 API
              name: symbolName,
              // 'exchange-listed': ['HUOBI'], // 交易所名称
              type: 'bitcoin',//商品类型-数字货币
              session: '24x7',//交易周期24小时每周7天
              timezone: 'Asia/Shanghai',//时区
              ticker: symbolName,//商品名称
              minmov: 1,//最小波动
              pricescale: Math.pow(10, this.allSymbolInfo[this.symbol].baseCoinScale),//价格精度
              has_intraday: true,//是否显示日内分钟的数据
              has_daily: true,//是否显示以日为单位的数据
              has_weekly_and_monthly: true,//布尔值显示商品是否具有以W和M为单位的历史数据。如果它为false，则Charting Library将通过日单位的周期自行构建。
              intraday_multipliers: this.intradayMultipliers,//构建分辨率不同时间的K线
              supported_resolution: intervalList,//在这个商品的周期选择器中启用一个周期数组
              volume_precision: this.allSymbolInfo[this.symbol].coinScale,
              data_status: 'streaming'//数据状态码 streaming(实时)--endofday(已收盘)--pulsed(脉冲)delayed_streaming(延迟流动中)
            }
            setTimeout(function () {
              onSymbolResolvedCallback(symbolStub)// 0秒 传一次商品体系
            }, 0)
          },
          getBars: (symbolInfo, resolution, from, to, onHistoryCallback, onErrorCallback, firstDataRequest) => {
            //TV--第4个方法（获取K线） resolution 是 时间周期 
            let rs
            switch (resolution) {
              case 'D':
              case '1D':
                rs = 'D'
                break
              case 'W':
              case '1W':
                rs = 'W'
                break
              case 'M':
              case '1M':
                rs = 'M'
                break
              default:
                rs = resolution;//resolution 是 时间周期
                break
            }
            const data = {
              resolution: rs,//时间周期
              symbol: this.symbol,//商品信息
              from: from * 1000,//时间戳 最左边请求的K线时间
              to: to * 1000//时间戳 最右边请求的K线时间
            }
            //这里是TV需要渲染的K线数据 
            this.$ajax.get(getHistoryKLineApi, data).then(res => {
              if (res.code === ERR_CODE_OK) {
                let list = res.data
                if (list.length) {
                  let arr = list.map(item => {//K线上每一条柱子就是一个item
                    let time = Number(item[0])
                    if (['D', 'W', 'M'].includes(this.interval)) { // 如果是'D', 'W', 'M'就+8小时,因为我的这边后台是按照东八区时间进行数据划分的，如果你不是这样子就不用加8小时
                      time = time + 8 * 60 * 60 * 1000
                    }
                    return {
                      time,
                      open: Number(item[1]),
                      high: Number(item[2]),
                      low: Number(item[3]),
                      close: Number(item[4]),
                      volume: Number(item[5])
                    }
                  })

                  onHistoryCallback(arr, {//有数据之后调用该方法
                    noData: false
                  })
                } else {//否则就是没有数据
                  onHistoryCallback([], {
                    noData: true
                  })
                }
              } else {
                onHistoryCallback([], {
                  noData: true
                })
              }
            }).catch((e) => {
              onHistoryCallback([], {
                noData: true
              })
              console.log(e)
            })
          },
          subscribeBars: (symbolInfo, resolution, onRealtimeCallback, subscribeUID, onResetCacheNeededCallback) => {
            this.onRealtimeCallback = onRealtimeCallback // 挂到this上，方便父组件trade调 
            //该方法是TV里提供的 用来更新实时数据的方法
          },
          unsubscribeBars: (subscriberUID) => {
            console.log(`取消订阅：${subscriberUID}`)
          }
        }
      },

      // 创建指标，四条平均线
      createStudy() {
        const b = this.allSymbolInfo[this.symbol].baseCoinScale
        this.moving_average_5_id = this.tvWidget.chart().createStudy('Moving Average', false, false, [5, 'close', 0], null, {'Plot.color': 'rgb(150, 95, 196)', 'precision': b})
        this.moving_average_10_id = this.tvWidget.chart().createStudy('Moving Average', false, false, [10, 'close', 0], null, {'Plot.color': 'rgb(116,149,187)', 'precision': b})
        this.moving_average_30_id = this.tvWidget.chart().createStudy('Moving Average', false, false, [30, 'close', 0], null, {'plot.color': 'rgb(58,113,74)', 'precision': b})
        this.moving_average_60_id = this.tvWidget.chart().createStudy('Moving Average', false, false, [60, 'close', 0], null, {'plot.color': 'rgb(118,32,99)', 'precision': b})
      },

      // 覆盖四条均线指标的小数位
      movingAverageApplyOverrides() {
        const b = this.allSymbolInfo[this.symbol].baseCoinScale
        const arr = ['5', '10', '30', '60']
        arr.forEach(item => {
          try {
            // 某个指标有可能被删除
            this.tvWidget.chart().getStudyById(this[`moving_average_${item}_id`]).applyOverrides({
              'precision': b
            })
          } catch (e) {
            console.error(e)
          }
        })
      },

      // websocket接收到数据后 调用这个方法更新k线，至于怎么连接websocket你们商量
      /**
       *
       * @param data
       * {
       *     symbol: 'BTC/USDT', // 交易对
       *     resolution: '1', // 周期， intervalList中的一项
       *     time: '1569985228000' // 时间戳
       *     open: '3213.12345'
       *     high: '3213.12345'
       *     low: '3213.12345'
       *     close: '3213.12345'
       *     volume: '222'
       * }
       */
      realTimeCallback(data) {//第五步   把trade组件 服务端推来的新数据渲染到K线上
        if (typeof this.onRealtimeCallback === 'function') { //如果是一个函数
          if (data.symbol === this.symbol && data.resolution === this.interval) { // 判断周期是否是当前的周期
            let time = Number(data['time'])
            if (['D', 'W', 'M'].includes(data.resolution)) { // 如果是'D', 'W', 'M'就+8小时
              time = time + 8 * 60 * 60 * 1000
            }
            const barNew = {
              time,//交易时间
              open: Number(data['open']),//开盘价
              high: Number(data['high']),//最高点
              low: Number(data['low']),//最低点
              close: Number(data['close']),//收盘价
              volume: Number(data['volume'])//成交量
            }
            this.onRealtimeCallback(barNew)//把新的行情传进去 就会不断的更新K线了
            console.log('-----塞新数据到k线成功----')           
          }
        }
      },

      // 当点击交易对的时候就调用这个方法去设置交易对的K线 切换K线 
      setSymbol() {
        // 有实例就直接调用setSymbol(symbol, callback)
        if (this.tvWidget) {
          this.tvWidget.setSymbol(this.symbol, this.interval, () => {
            localStorage.setItem(TRADE_INTERVAL, this.interval) // 存一份到本地
            console.log(`重新设置symbol 为：${this.symbol}, 周期是${this.interval}`)

            this.movingAverageApplyOverrides() // 覆盖均线指标
          })
          return
        }
        this.init()//一开始都走初始化方法把所有的数据拉过来  配置里有实例tvWidget 
      },

      // 销毁tradingview
      remove() {
        this.tvWidget && this.tvWidget.remove()
        this.tvWidget = null
      }
    },
    computed: {
      // 表示当前交易对
      symbol: function () {
        return `${this.coinSymbol}/${this.baseSymbol}`
      }
    },
    beforeDestroy() {//生命周期函数当消亡之后
      // 销毁tradingview
      this.remove()//让tradingview 为空
    },
  }
</script>
<style scoped lang="stylus">
  @import "../../variables.styl";
  .trading-view {
    width: 100%;
    height: 100%;

    .tv-header {
      height: 30px;
      text-align: center;
      align-items: center;
      display: flex;
      width: 100%;
      padding-left: 53px;

      .tv-header-item {
        line-height: 30px;
        min-width: 50px;
        text-align: center;
        color: #fff;
        padding: 0 10px;
        border-top: 2px solid transparent;
        cursor: pointer;

        &.active {
          border-top-color: $theme-color;
          color: $theme-color;
          background-color: #101426;
        }
      }
    }

    .tv-chart {
      width: 100%;
      height: calc(100% - 30px);
    }
  }
</style>
