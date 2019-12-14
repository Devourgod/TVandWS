<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <div class="text-center link">
      <router-link to="/trade/BTC_USDT">去交易对 BTC/USDT</router-link>
    </div>
    <div class="text-center link">
      <router-link to="/trade/ETH_USDT">去交易对 ETH/USDT</router-link>
    </div>
    <div class="text-center link">
      <router-link to="/trade/ETH_BTC">去交易对 ETH/BTC</router-link>
    </div>
  </div>
</template>

<script>
  // @ is an alias to /src

  export default {
    name: 'home'
  }
</script>
<style scoped lang="stylus">
  .link
    margin-top 20px

    a
      font-weight bold
      color #2c3e50
      &.router-link-exact-active
        color #42b983
</style>
