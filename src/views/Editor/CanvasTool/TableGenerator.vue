<template>
  <div class="table-generator">
    <div class="title">
      <div class="lef">{{ $t('canvasTool.table') }} {{endCell.length ? `${endCell[0]} x ${endCell[1]}` : ''}}</div>
      <div class="right" @click="isCustom = !isCustom">{{ isCustom ? $t('back') : $t('custom')}}</div>
    </div>
    <table 
      @mouseleave="endCell = []" 
      @click="handleClickTable()" 
      v-if="!isCustom"
    >
      <tbody>
        <tr v-for="row in 10" :key="row">
          <td 
            @mouseenter="endCell = [row, col]"
            v-for="col in 10" :key="col"
          >
            <div 
              class="cell" 
              :class="{ 'active': endCell.length && row <= endCell[0] && col <= endCell[1] }"
            ></div>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="custom" v-else>
      <div class="row">
        <div class="label" style="width: 25%;">{{ $t('canvasTool.tableRow') }}</div>
        <NumberInput
          :min="1"
          :max="24"
          v-model:value="customRow"
          style="width: 75%;"
        />
      </div>
      <div class="row">
        <div class="label" style="width: 25%;">{{ $t('canvasTool.tableCol') }}</div>
        <NumberInput
          :min="1"
          :max="20"
          v-model:value="customCol"
          style="width: 75%;"
        />
      </div>
      <div class="btns">
        <Button class="btn" @click="close()">{{ $t('cancel') }}</Button>
        <Button class="btn" type="primary" @click="insertCustomTable()">{{ $t('sure') }}</Button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import message from '@/utils/message'
import Button from '@/components/Button.vue'
import NumberInput from '@/components/NumberInput.vue'
import i18n from '@/assets/locales/index'

interface InsertData {
  row: number
  col: number
}

const emit = defineEmits<{
  (event: 'insert', payload: InsertData): void
  (event: 'close'): void
}>()

const endCell = ref<number[]>([])
const customRow = ref(3)
const customCol = ref(3)
const isCustom = ref(false)

const handleClickTable = () => {
  if (!endCell.value.length) return
  const [row, col] = endCell.value
  emit('insert', { row, col })
}

const insertCustomTable = () => {
  if (customRow.value < 1 || customRow.value > 20) return message.warning(i18n.global.t('toast.table'))
  if (customCol.value < 1 || customCol.value > 20) return message.warning(i18n.global.t('toast.table'))
  emit('insert', { row: customRow.value, col: customCol.value })
  isCustom.value = false
}

const close = () => {
  emit('close')
  isCustom.value = false
}
</script>

<style lang="scss" scoped>
.table-generator {
  width: 100%;
  margin-top: -12px;
}
.title {
  height: 28px;
  line-height: 28px;
  background-color: #ddd;
  margin: 0 -12px 12px -12px;
  padding: 0 14px;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  user-select: none;
  color: $textColor;

  .right {
    cursor: pointer;

    &:hover {
      color: $themeColor;
    }
  }
}
table {
  border-collapse: separate;
}
td {
  width: 23px;
  height: 23px;
  line-height: 23px;
  border: 2px solid #fff;
  background-color: #f7f7f7;
}
.cell {
  width: 100%;
  height: 100%;
  border: 1px solid #dcdcdc;

  &.active {
    background-color: rgba($color: $themeColor, $alpha: .1);
    border-color: $themeColor;
  }
}

.custom {
  width: 230px;

  .row {
    display: flex;
    align-items: center;

    & + .row {
      margin-top: 10px;
    }
  }
}

.btns {
  margin-top: 10px;
  text-align: right;

  .btn {
    margin-left: 10px;
  }
}
</style>