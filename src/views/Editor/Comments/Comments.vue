<template>
  <dev 
    class="comments-wrap"
    v-click-outside="handleOutside"
  >
    <div class="user-wrap">
      <div class="img-wrap">
        <img src="/icons/comments/default-user.svg" alt="...">
      </div>
      <div class="user-info">
        <div class="name">freediep</div>
        <div class="status-wrap">
          <span class="status">解决</span>
          <span class="date">今天 22:21</span>
        </div>
      </div>
      <div class="btn-wrap">
        <a class="btn">
          <img src="/icons/comments/smail.svg"/>
        </a>
        <a class="btn">
          <img src="/icons/comments/add.svg"/>
        </a>
        <a class="btn" @click="handleMore">
          <img src="/icons/comments/more.svg"/>
        </a>
      </div>
    </div>
    <!-- 评论信息 -->
    <div class="comments-info">
      <span>请举证验证</span>
    </div>
    <!-- 回复 -->
    <div class="reply-wrap">
      <span>{{ $t('comments.reply') }}</span>
    </div>
    <!-- status 弹框-->
    <div 
      class="status-modal"
      v-show="showModal"
    >
      <ul>
        <li>
          <span><img src="/icons/comments/edit.svg"></span>
          <span class="text">编辑</span>
        </li>
        <li>
          <span><img src="/icons/comments/finash.svg"></span>
          <span class="text">解决</span>
        </li>
        <li>
          <span><img src="/icons/comments/del.svg"></span>
          <span class="text">删除</span>
        </li>
      </ul>
    </div>
  </dev>
</template>
<script lang="ts" setup>

const props = defineProps<{
  showModal: boolean
}>()

const emit = defineEmits<{
  (event: 'switchModal', payload: boolean): void
}>()

const handleMore = () => {
  emit('switchModal', !props.showModal)
}

const handleOutside = () => {
  emit('switchModal', false)
}

</script>
<style lang="scss" scoped>
.comments-wrap {
  width: 100%;
  // margin-top: 16px;
  overflow: hidden;
  position: relative;
}


.user-wrap {
  width: 100%;
  height: 46px;
  display: flex;
  align-items: center;
  margin-top: 16px;
  .img-wrap {
    width: 30px;
    height: 30px;
    background-color: #e6e6e6;
    border-radius: 50%;
    overflow: hidden;
    margin: 8px;
    img {
      max-width: 100%;
      max-height: 100%;
    }
  }
  .user-info {
    flex: 1;
    min-width: 88px;
    .name {
      line-height: 20px;
      font-size: 14px;
      color: #202124;
    }
    .status-wrap {
      .status {
        font-size: 12px;
        color: #2aba8a;
      }
      .date {
        font-size: 12px;
        color: #ddd;
        margin-left: 4px;
      }
    }
  }
  .btn-wrap {
    width: 86px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: right;
    .btn {
      width: 28px;
      height: 28px;
      font-size: 16px;
      text-align: center;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      &:hover {
        background-color: #edf2fa;
      }
    }
  }
}
.comments-info {
  width: 100%;
  height: 28px;
  line-height: 28px;
  margin-top: 8px;
  span {
    color: #202124;
    font-size: 14px;
  }
}
.reply-wrap {
  width: 100%;
  height: 40px;
  line-height: 40px;
  margin-top: 8px;
  span {
    color: #202124;
    font-size: 12px;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    &:hover {
      background-color: #edf2fa;
    }
  }
}

.status-modal {
  width: 128px;
  // height: 136px;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 12px 16px -4px rgba(16, 24, 40, 0.2);
  background-color: #fff;
  font-size: 14px;
  position: absolute;
  right: 0;
  top: 40px;
  ul {
    li {
      width: 100%;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: start;
      span {
        cursor: pointer;
      }
      img {
        max-width: 24px;
        max-height: 24px;
      }
      .text {
        text-indent: 16px;
      }
    }
  }
}
</style>