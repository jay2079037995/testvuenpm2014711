<template>
    <div class="content">
        <div class="slides_generate subcontent" @click="handleCreatePPTXClick()">
            <div class="slides_generate_icon subcontent_icon">
              <svg-icon icon="icon_ppt_generate" size="24"/>
            </div>
            <div class="subcontent_title">生成</div>
            <div class="subcontent_sub">根据文字或者idea prompt创建</div>
        </div>
        <div class="slides_upload subcontent" @click="handleCreateDocsClick()">
            <div class="slides_upload_icon subcontent_icon">
              <svg-icon icon="icon_doc_upload" size="24"/>
            </div>
            <div class="subcontent_title">通过文件上传</div>
            <div class="subcontent_sub">几秒内根据文件内容创建</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter} from 'vue-router'
const router = useRouter()

/**
 * 输入创建ppt
 */
const handleCreatePPTXClick = () => {
  // console.log('handleCreatePPTXClick', router.currentRoute.value.path)
  router.push('/SelectInput').catch(error => console.warn('SelectInput Navigation failed:', error))
}

/**
 * 上传创建ppt
 */
const handleCreateDocsClick = () => {
  // console.log('handleCreateDocsClick :', router.currentRoute.value.path)
  // router.push({ name: '/SelectFile', query: { pageState: 'done' } })
  //   .catch(error => {
  //     console.error('Navigation to /SelectFile failed:', error)
  //   })
  // router.push({ name: '/SelectFile', params: { pageState: 'select' } }).catch(error => console.warn('SelectFile Navigation failed:', error))
  router.push('/SelectFile').catch(error => console.warn('SelectFile Navigation failed:', error))
}
</script>

<style lang="scss" scoped>
.content {
  height: 270px;
  padding: 50px;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  background-color: #fff;
  gap: 40px;

  @include overflow-overlay();

  .subcontent {
    flex: 1;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    align-self: stretch;
    gap: 10px;
    cursor: pointer;

    .subcontent_icon {
      width: 43px;
      height: 43px;
      border-radius: 50%;
      padding: 10px;
    }

    .subcontent_title {
      color: #000;
      margin-top: 5px;
      font-size: 18px;
    }
    .subcontent_sub {
      color: #444746;
      font-size: 12px;
    }
  }

  .slides_generate {
    // background-color: #f1d9e9;
    background-image: url('@/assets/images/bg_slides_generate.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    .slides_generate_icon {
      background-color: #ff5c64;
    }
  }

  .slides_upload {
    // background-color: #d5edc5;
    background-image: url('@/assets/images/bg_slides_uplaod.png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;

    .slides_upload_icon {
      background-color: #8882cb;
    }
  }
}
</style>