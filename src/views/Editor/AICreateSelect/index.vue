<template>
  <div class="create-dialog">
      <div class="top_style">
          <div class="top_left" @click="handleBackClick()">
              <svg-icon icon="back" size="14"/>
              <div class="left_text">返回</div>
          </div>
          <div class="top_title">{{ dynamicTitle }}</div>
          <svg-icon class="close_icon" icon="close" size="18" @click="handleCloseClick()"/>
      </div>
      <div class="top_line"></div>
      <!-- <router-view></router-view> -->
      <div class="content">
        <!-- <p v-if="showLinks">
          <router-link to="/" @click="handleCreateDocsClick()">创建文稿</router-link>
          <router-link to="/SelectInput" @click="handleCreatePPTXClick()">示例二</router-link>
        </p> -->
        <router-view :key="reloadKey"></router-view>
      </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter, RouterView} from 'vue-router'
import { useMainStore } from '@/store'
const mainStore = useMainStore()
const router = useRouter()
const reloadKey = ref(Math.floor(Math.random() * 10000))
const dynamicTitle = ref('创建文稿')
const updateTitle = (newTitle: string) => {
  dynamicTitle.value = newTitle
}

// 封装导航守卫逻辑到单独的函数
const setupRouteGuards = () => {
  const beforeRouteUpdateHandler = (to: { path: string; }, from: any) => {
    console.log('onBeforeRouteUpdate to:%o, from:%o', to, from)
    if (to.path === '/') {
      updateTitle('创建文稿')
    }
    else if (to.path === '/SelectInput' || to.path === '/InputGenerateOutline') {
      updateTitle('创建演示文档')
    }
    else if (to.path === '/SelectFile' || to.path === '/FileGenerateOutline') {
      updateTitle('导入文件生成PPT')
    }
    else {
      updateTitle('Other')
    }
  }

  const beforeRouteLeaveHandler = (to: any, from: any) => {
    console.log('onBeforeRouteLeave to:%o, from:%o', to, from)
  }

  // router.clearRoutes()
  router.beforeEach(beforeRouteUpdateHandler)
  router.beforeEach(beforeRouteLeaveHandler)
  const currentPath = router.currentRoute.value.path
  if (currentPath !== '/') {
    // router.push('/')
    router.replace('/')
    // router.resolve({
    //   path: '/'
    // })
  }
}

onMounted(() => {
  setupRouteGuards() // 在组件挂载时设置导航守卫
})

const handleBackClick = () => {
  const currentPath = router.currentRoute.value.path
  if (currentPath === '/') {
    handleCloseClick()
  }
  else {
    // router.go(-1)
    router.back()
  }
}

const handleCloseClick = () => {
  mainStore.setCreateDocumentState(false)
  mainStore.setCreateNewPPTXState(false)
}

</script>

<style lang="scss" scoped>
.create-dialog {
  margin: -20px;
}

.top_style {
  display: flex;
  align-items: center;
  height: 45px;
  position: relative;
  margin-top: 35px;

  .top_left {
    display: flex;
    align-items: center;
    margin-left: 35px;
    gap: 5px;
    background-color: #fff;
    border-radius: 5px;
    padding: 5px 10px;
    cursor: pointer;

    .left_text {
      color: 000;
      margin-left: 2px;
      font-size: 18px;
    }

    &:active {
      background-color: #0009;
    }

    &:hover {
      background-color: #0001;
    }
  }

  .top_title {
    flex-grow: 1;
    text-align: center;
    margin-left: auto;
    margin-right: 130px;
    color: 000;
    font-size: 19px;
    font-weight: 500;
  }

  .close_icon {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    cursor: pointer;
    border-radius: 50%;
    padding: 8px;
    margin-right: 40px;

    &:active {
      color: #0009;
      background-color: #0009;
    }

    &:hover {
      color: #0009;
      background-color: #0001;
    }
  }
}

.top_line {
  width: calc(100% - 100px);
  height: 1px;
  background-color: #f9f9f9;
  margin-top: 10px !important;
  margin-left: 50px !important;
  margin-right: 50px !important;
}

.content {
  width: 100%;
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  background-color: #fff;
}
</style>