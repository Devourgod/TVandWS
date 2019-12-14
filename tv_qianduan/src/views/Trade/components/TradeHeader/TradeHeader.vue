<template>
  <div class="trade-header clearfix">
    <!-- 该组件负责行情数据格式 -->
    <div class="fl">
  
      <div class="flex-wrapper">
        <img class="logo" src="~@/assets/logo.png" @click="$router.push('/')"/>
        <div class="line"></div>
        
        <!-- 鼠标移到过去就打开选择列表 把布尔值传过去 -->
        <div class="info-item market-wrapper"
             @mouseenter="showSymbolListHandle(true)"
             @mouseleave="showSymbolListHandle(false)">
          <div class="name">市场</div>
          <div class="value current">
            <span>{{selectSymbolItem.symbol}}</span>           
            <i class="el-icon-caret-bottom"></i></div>
          <transition name="slide-up">
            <div class="list-wrapper" v-show="showFlag">
              <div class="tab-wrapper">
                <div class="tab-item"
                     :class="{active: item === baseSymbol}"
                     v-for="item in baseSymbolList"
                     @click="selectBaseSymbol(item)"
                     :key="item">{{item}}
                </div>
              </div>
              <div class="input-wrapper">
                <input v-model="keyword" />
              </div>
              <div class="item-wrapper coin-header">
                <span class="item">交易对</span>
                <span class="item">最新价</span>
                <span class="item">24H涨幅</span>
              </div>
              <ul class="coin-list">
                <!-- 交易对列表样式 切换交易市场 -->
                <li class="item-wrapper animate"
                    v-for="item in showSymbolList"
                    @click="selectSymbol(item)"
                    :key="item.symbol">
                  <span class="item">{{item.symbol}}</span>
                
                  <span class="item">{{item.close}}</span>
                  
                  <span class="item" :class="getChpClass(item.chp)">{{getChpText(item.chp)}}</span>
                </li>
              </ul>
            </div>
          </transition>
        </div>
        <div class="line"></div>
        <div class="info-item">
          <div class="name">价格</div>
          <div class="value"><span :class="getChpClass(selectSymbolItem.chp)">{{selectSymbolItem.close}}</span> {{selectSymbolItem.baseSymbol}}</div>
        </div>
        <div class="info-item">
          <div class="name">24H涨幅</div>
          <div class="value" :class="getChpClass(selectSymbolItem.chp)">{{getChpText(selectSymbolItem.chp)}}
          </div>
        </div>
        <div class="info-item">
          <div class="name">24H最高</div>
          <div class="value">{{selectSymbolItem.high}}</div>
        </div>
        <div class="info-item">
          <div class="name">24H最低</div>
          <div class="value">{{selectSymbolItem.low}}</div>
        </div>
        <div class="info-item">
          <div class="name">24H成交量</div>
          <div class="value">{{selectSymbolItem.volume}} {{selectSymbolItem.coinSymbol}}</div>         
        </div>
        <button :style="{'margin-left':'30px'}" @click="text">测数据</button>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import {getBaseSymbolApi, getSymbolThumbApi} from '@/config/api'
  import {ERR_CODE_OK} from '@/config/base'
  import {mul, toFixed} from '@/common/js/compute'

  const LAST_TRADE_SYMBOL = 'LAST_TRADE_SYMBOL' // 上次选中的交易对的key
  export default {
    name: 'trade-header',
    props: {
      allSymbolInfo: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        keyword: '', // 搜索币种的字符串
        baseSymbol: '', // 选中的基础币种
        baseSymbolList: [], // 基础币种列表
        symbolThumb: [], // 全部币种信息列表
        showSymbolList: [], // 展示的币种信息列表
        showFlag: false, // 默认不显示币种列表
        selectSymbolItem: {
          symbol: '',
          baseSymbol: '',
          coinSymbol: '',
          change: 0,
          chp: 0,
          close: 0,
          high: 0,
          low: 0,
          open: 0,
          volume: 0,
          usdRate: 0
        }
      }
    },
    methods: {
      //用来打印数据 这是第二步 
      text () {
        console.log(this.symbolThumb)
      },
      // init初始化数据,依赖父组件传来的allSymbolInfo,这个方法等父组件来调用
      async init() {
        await Promise.all([this.getBaseSymbol(), this.getSymbolThumb()])
        //请求两个接口 一个是市场接口 一个是行情接口
        this.initSymbol()//然后开始选择币种
      },

      // 初始化选中某个币种，只能让父组件调用，好控制流程
      initSymbol() {
        // 1 看$route.params是否有值，有就取值，2 没有就默认取BTC/USDT 3,没有BTC/USDT就取第一个
        if (this.hadSetSymbol()) {
          return
        }
        this.selectBaseSymbol(this.baseSymbolList.find(item => item === 'USDT') || this.baseSymbolList[0]) // 选中基础币种
        const item = this.showSymbolList.find(item => item.coinSymbol === 'BTC')
        if (this.baseSymbol === 'USDT' && item) {
          this.selectSymbolItem = item
        } else {
          this.selectSymbolItem = this.showSymbolList[0]
        }
        const data = {...this.selectSymbolItem}
        this.$emit('changeSymbol', data)//选择完了之后告诉 父组件changeSymbol方法 表示选择默认交易对
      },

      // 是否已经设置了通过params传来的symbol或者上次选择的symbol
      hadSetSymbol() {
        const paramsSymbol = this.$route.params.symbol || localStorage.getItem(LAST_TRADE_SYMBOL) || ''
        if (paramsSymbol) {
          const arr = paramsSymbol.split('_')
          const baseSymbol = arr[1]
          const coinSymbol = arr[0]
          const item = this.symbolThumb.find(item => item.symbol === `${coinSymbol}/${baseSymbol}`)
          if (item) {
            this.selectBaseSymbol(baseSymbol)
            this.selectSymbolItem = item
            const data = {...item}
            this.$emit('changeSymbol', data)
            return true
          }
          return false
        }
        return false
      },

      // 获取对应的类名
      getChpClass(chp) {
        if (chp > 0) {
          return 'up'
        }
        if (chp < 0) {
          return 'down'
        }
        return ''
      },

      // 获取对应的文案 转化成百分比 24小时涨幅
      getChpText(chp) {
        const res = toFixed(mul(chp, 100), 2)
        if (chp > 0) {
          return `+${res}%`
        }
        if (chp < 0) {
          return `${res}%`
        }
        return '0.00%'
      },

      // 获取基础币种
      getBaseSymbol() {
        return new Promise(resolve => {
          this.$ajax.get(getBaseSymbolApi).then(res => {
            if (res.code === ERR_CODE_OK) {
              this.baseSymbolList = res.data // 设置基础币种列表,此时没有选中基础币种
              resolve()
            }
          }).catch(err => {
            console.log(err)
          })
        })
      },

      // 获取全部币种涨跌幅相关信息
      getSymbolThumb() {
        return new Promise(resolve => {
          this.$ajax.get(getSymbolThumbApi).then(res => {
            if (res.code === ERR_CODE_OK) {
              this.symbolThumb = res.data.map(item => {
                let baseCoinScale = this.allSymbolInfo[item.symbol].baseCoinScale
                return {
                  ...item,
                  close: toFixed(item.close, baseCoinScale),
                  high: toFixed(item.high, baseCoinScale),
                  low: toFixed(item.low, baseCoinScale)
                }
              }) // 设置全部币种
              resolve()//表示成功
            }
          }).catch(err => {
            console.log(err)
          })
        })
      },

      // 设置展示出来的币种列表
      setShowSymbolList() {
        if (this.baseSymbol) {
          if (this.keyword) {
            let v = this.keyword.toUpperCase()
            this.showSymbolList = this.symbolThumb.filter(item => String(item.coinSymbol).includes(v) && item.baseSymbol === this.baseSymbol)
            return
          }
          this.showSymbolList = this.symbolThumb.filter(item => item.baseSymbol === this.baseSymbol)
        } else {
          this.showSymbolList = []
        }
      },

      // 选中基础币种
      selectBaseSymbol(baseSymbol) {
        this.baseSymbol = baseSymbol // 设置基础币种
        this.setShowSymbolList() // 设置对应的币种列表显示
      },

      // 控制币种列表的显示与隐藏
      showSymbolListHandle(flag) {
        this.showFlag = flag
        //这里传进来的时候一个布尔值
      },

      // 选中某个交易对
      selectSymbol(item) {
        this.selectSymbolItem = item
        const data = {...item}
        const symbol = `${data.coinSymbol}_${data.baseSymbol}`
        localStorage.setItem(LAST_TRADE_SYMBOL, symbol) // 设置格式类似 ETH_BTC， 为了与params传来的格式一致
        this.$router.replace({name: this.$route.name, params: {symbol}})
        this.$emit('changeSymbol', data) // 派发事件通知有新选中的交易对
        this.showFlag = false
      }
    },
    watch: {
      keyword: function (val) {
        this.$tid && clearTimeout(this.$tid)
        this.$tid = setTimeout(() => {
          this.setShowSymbolList()
        }, 200)
      }
    }
  }
</script>
<style scoped lang="stylus">
  @import "../../variables.styl";
  .trade-header {
    height: 70px;
    padding: 15px 60px;
    background: #06090F;
    @media screen and (max-width: $screen-max-width) {
      padding: 15px 30px;
    }
    .up {
      color: $up-color;
    }
    .down {
      color: $down-color;
    }
    .flex-wrapper {
      display: flex;
      align-items: center;
    }
    .logo {
      display: block;
      width: 40px;
      margin-right: 30px;
      cursor: pointer;
    }
    .info-item {
      display: inline-block;
      color: #fff;
      & + .info-item {
        margin-left: 30px;
        @media screen and (max-width: $screen-max-width) {
          margin-left: 20px;
        }
      }
      .name {
        font-size: 14px;
        margin-bottom: 10px;
        color: #6E6E6E;
        @media screen and (max-width: $screen-max-width) {
          font-size: 12px;
        }
      }
      .value {
        font-size: 16px;
        @media screen and (max-width: $screen-max-width) {
          font-size: 14px;
        }
      }
    }
    .market-wrapper {
      position: relative;
      &:after {
        position: absolute;
        content: '';
        bottom: -18px;
        left: 0;
        width: 100%;
        height: 18px;
      }
      .current {
        width: 130px;
        font-weight: bold;
        cursor: pointer;
        @media screen and (max-width: $screen-max-width) {
          width: 120px;
        }
      }
      .list-wrapper {
        position: absolute;
        top: 53px;
        left: 0;
        width: 320px;
        height: 400px;
        background: #202844;
        box-shadow: 0 1px 6px rgba(0, 0, 0, 0.45);
        /*box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .04);*/
        .input-wrapper {
          padding: 15px 30px;
          input{
            display: block;
            width: 100%;
            height 24px;
            line-height: 14px;
            padding: 5px 12px;
            outline: none;
            background #fff;
          }
        }
        .coin-list {
          height: 240px;
          overflow-y: auto;
          .item-wrapper {
            cursor: pointer;
            &.active,
            &:hover {
              background-color: #414f80;
            }
            .item {
              color: #D5D5D5;
              padding: 10px 0;
              &.up {
                color: $up-color;
              }
              &.down {
                color: $down-color;
              }
            }
          }
        }
        .item-wrapper {
          padding: 0 30px;
          font-weight: bold;
          font-size: 0;
          .item {
            display: inline-block;
            vertical-align: top;
            padding: 7px 0;
            width: 30%;
            font-size: 12px;
            &:first-child {
              width: 40%;
            }
            &:last-child {
              text-align: right;
            }
          }
        }
        .coin-header {
        }
      }
    }
    .tab-wrapper {
      flex: 0 0 32px;
      height: 32px;
      display: flex;
      background: #0C0F1D;
      color: #fff;
      .tab-item {
        padding: 0 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-top: 2px solid #0C0F1D;
        &.active {
          background: #202844;
          border-top-color: $theme-color;
        }
      }
    }
    .line {
      margin: 0 30px;
      height: 40px;
      width: 1px;
      background: $border-color;
      @media screen and (max-width: $screen-max-width) {
        margin: 0 25px;
      }
    }
    .right-wrapper {
      display: flex;
      align-items: center;
      .nav {
        display: flex;
        height: 100%;
        align-items: center;
        .icon {
          color: #40444a;
        }
        .nav-item {
          display: inline-block;
          padding: 10px 20px;
          color: #fff;
          &.bold {
            font-weight: bold;
          }
          &.router-link-exact-active,
          &:hover {
            color: $theme-color;
          }
        }
        .login {
          display: inline-block;
          margin-left: 20px;
          margin-right: 20px;
          padding: 8px 15px;
          border: 1px solid #40444a;
          border-radius: 4px;
        }
      }
      .locale-wrapper {
        display: inline-block;
        vertical-align: top;
        margin-left: 30px;
      }
    }
  }
</style>
