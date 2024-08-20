<template>
  <div>
    <button>我是测试按钮</button>
  </div>
</template>
<script>
export default {
  name: "pig-button", //组件名
};
</script>
<style scoped>
button {
  width: 100px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}
</style>