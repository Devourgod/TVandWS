const baseUrl = 'http://localhost:3000';
const socketUrl = `${baseUrl}`;
const getHistoryKLineApi = `${baseUrl}/trade/history`;//获取历史数据，在trading-view组件getBars要用到
//一进视图就要拉历史K线出来先
const getBaseSymbolApi = `${baseUrl}/trade/baseSymbolList`;//在tradeHeader组件getBars用到
//市场行情接口 
const getSymbolThumbApi = `${baseUrl}/trade/symbolThumb`;//在tradeHeader组件getBars用到
//市场接口
const getAllSymbolInfoApi = `${baseUrl}/trade/allSymbolInfo`;//获取所有商品的配置信息
//所有商品（交易对）配置信息
export {
  socketUrl,
  getHistoryKLineApi,
  getBaseSymbolApi,
  getSymbolThumbApi,
  getAllSymbolInfoApi
}
