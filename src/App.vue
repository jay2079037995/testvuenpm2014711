<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <pig-button></pig-button>
  </div>
</template>
 
<script>
import PigButton from './package/pig-button/index.vue'
 
export default {
  name: 'App',
  components: {
    PigButton
  }
}
</script>
 
<style>
#app {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
</style>