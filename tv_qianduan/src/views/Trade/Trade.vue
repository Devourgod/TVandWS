<template>
  <div class="trade">
    <div class="header-wrapper">
      <!--头部组件传值-->
      <trade-header ref="tradeheader"
                    :allSymbolInfo="allSymbolInfo"
                    @changeSymbol="changeSymbolHandle"/>
                    
    </div>
    <div class="main">
      <div class="l-wrapper">
        <div class="top-wrapper">
          <div class="tv-wrapper">
            <!-- 给子组件传值 -->
            <trading-view ref="tradingview"
                          @setResolution="tvSetResolutionHandle"
                          :allSymbolInfo="allSymbolInfo"
                          :coin-symbol="coinSymbol"
                          :base-symbol="baseSymbol"/>
          </div>
        </div>
        <div class="bottom-wrapper" v-show="false">
          <!--我的订单-->sssssssssssssssssss
        </div>
      </div>
      <div class="r-wrapper" v-show="false">
        <div class="top-wrapper">
          <div class="list-wrapper">
            <div class="order-list-wrapper">
              <!--订单列表-->
            </div>
            <div class="done-list-wrapper">
              <!--成交订单-->
            </div>
          </div>
        </div>
        <div class="bottom-wrapper">
          <!--买卖-->
        </div>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  // import Stomp from 'stompjs'
  // import SockJS from 'sockjs-client'
  import io from 'socket.io-client'
  import {ERR_CODE_OK} from '@/config/base'
  import {getAllSymbolInfoApi, socketUrl} from '@/config/api'
  //解构2个接口（获取所有交易对信息接口，websocket接口）
  import TradeHeader from './components/TradeHeader/TradeHeader.vue'//引入子组件

  export default {
    name: 'trade',
    components: {
      TradeHeader,
      TradingView: () => import('./components/TradingView/TradingView.vue')//这里引入TV组件
    },
    data() {
      return {
        allSymbolInfo: {}, // 全部币种信息，分发给子组件
        baseSymbol: '', // 基础币种
        coinSymbol: '', // 计价币种
        price: '', // 当前价格
        usdRate: 0, // 当前交易币种对USD的汇率
        chp: 0 // 当前交易币种的涨跌幅
      }
    },
    created() {
      this.init()
    },
    methods: {//初始化数据 第一步 第二步 选择交易对
      async init() {
        await Promise.all([this.getAllSymbolInfo(), this.connectSocket()])
        //表示已经获取了配置信息，并且建立了连接
        this.$refs.tradeheader.init() // 传allSymbolInfo到 tradeheader之后它才能拉所有币种的行情，因为行情数据格式化要用到allSymbolInfo
       //调用tradeheader里的init方法
       this.socket.on('reconnect', num => {
          console.log(`自动重连了${num}次`)
          // 重连之后 重新拉数据
          this.$refs.tradingview.remove()//用子组件里面的消亡方法
          this.$refs.tradingview.init()//用子组件里的初始化所有数据方法
          this.subscribeKLine()
        })
      },

      // 切换周期，重新订阅k线 不同周期的K线
      tvSetResolutionHandle() {
        this.subscribeKLine()
      },

      // 获取一份所有币种的信息回来缓存, 传给需要用到的组件
      getAllSymbolInfo() {
        return new Promise((resolve, reject) => {
          this.$ajax.get(getAllSymbolInfoApi).then(res => {
            if (res.code === ERR_CODE_OK) {//如果拉取成功 状态码一致
              this.allSymbolInfo = res.data//把拉取的信息给 变量allSymbolInfo
              resolve()//调用resolve方法，Promise变为操作成功状态（fulfilled）
            } else {
              reject(new Error(res.code))//调用reject方法，Promise变为操作失败状态（然后可以用catch方法
            }
          }).catch(err => {
            reject(new Error(err))//用err接收res.code 失败状态码
          })
        })
      },
      // 数据的轮询在这里 肯定是异步的所以用promise
      // 开启连接
      connectSocket() {
        return new Promise((resolve, reject) => {
          this.socket = io(socketUrl)
          this.socket.on('connect', () => {//当socket是连接状态的时候
            resolve()//表示成功  
          })
        })
      },

      // 断开连接
      disConnectSocket() {
        return new Promise((resolve) => {
          this.socket.close()
          resolve()//表示成功 
        })
      },

      /**
       * 选中某个交易对，tradeHeader传来的选中事件，包括正常的人为点击，及代码初始化选中
       * 此时websockt已经连接 ，allSymbolInfo都已经取到
       */
      changeSymbolHandle(data) {//从子组件传来data  tradeHeader.vue组件 当子组件选了交易对时触发
        this.baseSymbol = data.baseSymbol//然后把子组件传来的给TV 改变K线
        this.coinSymbol = data.coinSymbol//然后把子组件传来的给TV 改变K线
        this.price = data.close
        // setTimeout 是保证让上面设置的值传到子组件里面
        setTimeout(() => {
          /**
           * 处理k线
           */
          this.$refs.tradingview.setSymbol()//第三步 调用子组件的方法 订阅更新 切换K线的方法

          this.subscribeKLine() // 订阅k线
        }, 20)
      },

      // 第四步 订阅k线 订阅就是更新最新数据 影响K线
      subscribeKLine() {
        const sendData = { //发送的数据 （商品和周期）
          symbol: this.symbol,//商品信息
          resolution: this.$refs.tradingview.getInterval() //发送的周期  调用子组件的方法 获取周期
        }
        this.socket.emit('subscribeKlineData', sendData)//订阅行数据，向服务端发送一个方法。后边是发送的数据
        if (this.socket._hadOnKlineNewData) {//如果有监听过了返回空 避免重复监听
          return
        }
        this.socket.on('klineNewData', data => {//服务端通过该方法，推新数据过来。用data来接收
          console.log('接收到k线新数据：', data)
          this.$refs.tradingview.realTimeCallback(data)//调用子组件tradingview里面的方法实时更新K线
        })
        this.socket._hadOnKlineNewData = true;
      }
    },

    beforeDestroy() {//消亡之后 断开连接
      this.disConnectSocket() // 断开连接
    },

    computed: {
      symbol: function () {
        return `${this.coinSymbol}/${this.baseSymbol}`
      }
    }
  }
</script>
<style scoped lang="stylus">
  @import "./variables.styl";
  .trade {
    height: 100vh;
    min-height: 655px;
    max-height: 1080px;
    overflow-x: auto;
    background: #000;
    display: flex;
    flex-direction: column;

    .header-wrapper {
      flex: 0 0 70px;
      height: 70px;
      position: relative;
      z-index: 10;
    }

    .main {
      flex: 1 1 auto;
      width: 100%;
      min-width: 1200px;
      min-height: calc(100% - 70px);
      margin: 0 auto;
      display: flex;

      .l-wrapper {
        flex: 1 1 auto;
        display: flex;
        flex-direction: column;
      }

      .r-wrapper {
        flex: 0 0 600px;
        width: 600px;
        display: flex;
        flex-direction: column;
        border-left: 1px solid $border-color;
        @media screen and (max-width: $screen-max-width) {
          flex: 0 0 520px;
          width: 520px;
        }
      }

      .top-wrapper {
        flex: 1 1 auto;
        background: #131625;
        border-top: 1px solid $border-color;
        border-bottom: 1px solid $border-color;
        position: relative;
      }

      .bottom-wrapper {
        flex: 0 0 360px;
        height: 360px;
        background: #131625;
        @media screen and (max-width: $screen-max-width) {
          flex: 0 0 300px;
          height: 300px;
        }
      }

      .tv-wrapper {
        position: absolute;
        width: 100%;
        height: 100%;
      }

      .list-wrapper {
        display: flex;
        position: absolute;
        width: 100%;
        height: 100%;

        .order-list-wrapper,
        .done-list-wrapper {
          flex: 1;
          overflow: hidden;
          background: #131625;
        }

        .done-list-wrapper {
          border-left: 1px solid $border-color;
        }
      }
    }
  }
</style>
