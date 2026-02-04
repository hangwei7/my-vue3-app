<template>
  <div class="top-right-btn" :style="style">
    <el-row>
      <el-tooltip class="item" effect="dark" :content="showSearch ? '隐藏搜索' : '显示搜索'" placement="top" v-if="search">
        <el-button size="small" circle @click="toggleSearch()">
          <el-icon><Search /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="刷新" placement="top">
        <el-button size="small" circle @click="refresh()">
          <el-icon><Refresh /></el-icon>
        </el-button>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="显隐列" placement="top" v-if="columns">
        <el-button size="small" circle @click="showColumn()">
          <el-icon><Menu /></el-icon>
        </el-button>
      </el-tooltip>
    </el-row>
    <el-dialog :title="title" v-model="open" append-to-body>
      <el-transfer
        :titles="['显示', '隐藏']"
        v-model="value"
        :data="columns"
        @change="dataChange"
      ></el-transfer>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search, Refresh, Menu } from '@element-plus/icons-vue'

const props = defineProps({
  showSearch: {
    type: Boolean,
    default: true,
  },
  columns: {
    type: Array,
  },
  search: {
    type: Boolean,
    default: true,
  },
  gutter: {
    type: Number,
    default: 10,
  },
})

const emit = defineEmits(['update:showSearch', 'queryTable'])

const value = ref([])
const title = ref("显示/隐藏")
const open = ref(false)

const style = computed(() => {
  const ret = {}
  if (props.gutter) {
    ret.marginRight = `${props.gutter / 2}px`
  }
  return ret
})

// 显隐列初始默认隐藏列
if (props.columns) {
  for (let item in props.columns) {
    if (props.columns[item].visible === false) {
      value.value.push(parseInt(item))
    }
  }
}

const toggleSearch = () => {
  emit("update:showSearch", !props.showSearch)
}

const refresh = () => {
  emit("queryTable")
}

const dataChange = (data) => {
  for (let item in props.columns) {
    const key = props.columns[item].key
    props.columns[item].visible = !data.includes(key)
  }
}

const showColumn = () => {
  open.value = true
}
</script>

<style scoped>
:deep(.el-transfer__button) {
  border-radius: 50%;
  padding: 12px;
  display: block;
  margin-left: 0px;
}
:deep(.el-transfer__button:first-child) {
  margin-bottom: 10px;
}
</style>
