<template>
  <div class="process-viewer">
    <div v-if="isLoading" style="height: 100%; display: flex; align-items: center; justify-content: center;">
      <el-icon class="is-loading"><Loading /></el-icon>
      <span style="margin-left: 10px;">加载中...</span>
    </div>
    <div class="process-canvas" style="height: 100%;" ref="processCanvasRef" v-show="!isLoading" />
    <!-- 已完成节点悬浮弹窗 -->
    <el-dialog class="comment-dialog" :title="dlgTitle || '审批记录'" v-model="dialogVisible">
      <el-row>
        <el-table :data="taskCommentList" size="small" border>
          <el-table-column label="序号" header-align="center" align="center" type="index" width="55px" />
          <el-table-column label="候选办理" prop="candidate" width="150px" align="center"/>
          <el-table-column label="实际办理" prop="assigneeName" width="100px" align="center"/>
          <el-table-column label="处理时间" prop="createTime" width="140px" align="center"/>
          <el-table-column label="办结时间" prop="finishTime" width="140px" align="center" />
          <el-table-column label="耗时" prop="duration" width="100px" align="center"/>
          <el-table-column label="审批意见" align="center">
            <template #default="scope">
              {{scope.row.commentList&&scope.row.commentList[0]?scope.row.commentList[0].fullMessage:''}}
            </template>
          </el-table-column>
        </el-table>
      </el-row>
    </el-dialog>
    <div style="position: absolute; top: 0px; left: 0px; width: 100%;">
      <el-row type="flex" justify="end">
        <el-button-group key="scale-control" size="default">
          <el-button size="default" type="default" :plain="true" :disabled="defaultZoom <= 0.3" @click="processZoomOut()">
            <el-icon><ZoomOut /></el-icon>
          </el-button>
          <el-button size="default" type="default" style="width: 90px;">{{ Math.floor(defaultZoom * 10 * 10) + "%" }}</el-button>
          <el-button size="default" type="default" :plain="true" :disabled="defaultZoom >= 3.9" @click="processZoomIn()">
            <el-icon><ZoomIn /></el-icon>
          </el-button>
          <el-button size="default" type="default" @click="processReZoom()">
            <el-icon><FullScreen /></el-icon>
          </el-button>
          <slot />
        </el-button-group>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { ZoomOut, ZoomIn, FullScreen, Loading } from '@element-plus/icons-vue'
import BpmnViewer from 'bpmn-js/lib/Viewer'
import MoveCanvasModule from 'diagram-js/lib/navigation/movecanvas'
import 'bpmn-js/dist/assets/diagram-js.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css'
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css'
import './index.css'

const props = defineProps({
  xml: {
    type: String,
    default: ''
  },
  finishedInfo: {
    type: Object,
    default: null
  },
  // 所有节点审批记录
  allCommentList: {
    type: Array,
    default: () => []
  }
})

const dialogVisible = ref(false)
const dlgTitle = ref(undefined)
const defaultZoom = ref(1)
const isLoading = ref(false)
const bpmnViewer = ref(null)
const processCanvasRef = ref(null)
// 已完成流程元素
const processNodeInfo = ref(undefined)
// 当前任务id
const selectTaskId = ref(undefined)
// 任务节点审批记录
const taskCommentList = ref([])

// 监听xml变化
watch(() => props.xml, (newXml) => {
  if (newXml) {
    importXML(newXml)
  }
}, { immediate: true })

// 监听finishedInfo变化
watch(() => props.finishedInfo, (newInfo) => {
  if (newInfo) {
    setProcessStatus(newInfo)
  }
}, { immediate: true })

onMounted(() => {
  nextTick(() => {
    if (props.xml) {
      importXML(props.xml)
    }
    if (props.finishedInfo) {
      setProcessStatus(props.finishedInfo)
    }
  })
})

onUnmounted(() => {
  clearViewer()
})

const processReZoom = () => {
  defaultZoom.value = 1
  if (bpmnViewer.value) {
    bpmnViewer.value.get('canvas').zoom('fit-viewport', 'auto')
  }
}

const processZoomIn = (zoomStep = 0.1) => {
  let newZoom = Math.floor(defaultZoom.value * 100 + zoomStep * 100) / 100
  if (newZoom > 4) {
    throw new Error('[Process Designer Warn ]: The zoom ratio cannot be greater than 4')
  }
  defaultZoom.value = newZoom
  if (bpmnViewer.value) {
    bpmnViewer.value.get('canvas').zoom(defaultZoom.value)
  }
}

const processZoomOut = (zoomStep = 0.1) => {
  let newZoom = Math.floor(defaultZoom.value * 100 - zoomStep * 100) / 100
  if (newZoom < 0.2) {
    throw new Error('[Process Designer Warn ]: The zoom ratio cannot be less than 0.2')
  }
  defaultZoom.value = newZoom
  if (bpmnViewer.value) {
    bpmnViewer.value.get('canvas').zoom(defaultZoom.value)
  }
}

// 流程图预览清空
const clearViewer = () => {
  if (processCanvasRef.value) {
    processCanvasRef.value.innerHTML = ''
  }
  if (bpmnViewer.value) {
    bpmnViewer.value.destroy()
  }
  bpmnViewer.value = null
}

// 添加自定义箭头
const addCustomDefs = () => {
  if (!bpmnViewer.value) return
  const canvas = bpmnViewer.value.get('canvas')
  const svg = canvas._svg
  if (!svg) return
  
  // 创建成功状态的箭头定义
  const successDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
  const successMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
  successMarker.setAttribute('id', 'sequenceflow-end-white-success')
  successMarker.setAttribute('viewBox', '0 0 20 20')
  successMarker.setAttribute('refX', '11')
  successMarker.setAttribute('refY', '10')
  successMarker.setAttribute('markerWidth', '10')
  successMarker.setAttribute('markerHeight', '10')
  successMarker.setAttribute('orient', 'auto')
  const successPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  successPath.setAttribute('class', 'success-arrow')
  successPath.setAttribute('d', 'M 1 5 L 11 10 L 1 15 Z')
  successPath.setAttribute('style', 'stroke-width: 1px; stroke-linecap: round; stroke-dasharray: 10000, 1;')
  successMarker.appendChild(successPath)
  successDefs.appendChild(successMarker)
  
  // 创建成功状态的条件表达式标记
  const successConditionalMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
  successConditionalMarker.setAttribute('id', 'conditional-flow-marker-white-success')
  successConditionalMarker.setAttribute('viewBox', '0 0 20 20')
  successConditionalMarker.setAttribute('refX', '-1')
  successConditionalMarker.setAttribute('refY', '10')
  successConditionalMarker.setAttribute('markerWidth', '10')
  successConditionalMarker.setAttribute('markerHeight', '10')
  successConditionalMarker.setAttribute('orient', 'auto')
  const successConditionalPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  successConditionalPath.setAttribute('class', 'success-conditional')
  successConditionalPath.setAttribute('d', 'M 0 10 L 8 6 L 16 10 L 8 14 Z')
  successConditionalPath.setAttribute('style', 'stroke-width: 1px; stroke-linecap: round; stroke-dasharray: 10000, 1;')
  successConditionalMarker.appendChild(successConditionalPath)
  successDefs.appendChild(successConditionalMarker)
  
  // 创建失败状态的箭头定义
  const failDefs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
  const failMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
  failMarker.setAttribute('id', 'sequenceflow-end-white-fail')
  failMarker.setAttribute('viewBox', '0 0 20 20')
  failMarker.setAttribute('refX', '11')
  failMarker.setAttribute('refY', '10')
  failMarker.setAttribute('markerWidth', '10')
  failMarker.setAttribute('markerHeight', '10')
  failMarker.setAttribute('orient', 'auto')
  const failPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  failPath.setAttribute('class', 'fail-arrow')
  failPath.setAttribute('d', 'M 1 5 L 11 10 L 1 15 Z')
  failPath.setAttribute('style', 'stroke-width: 1px; stroke-linecap: round; stroke-dasharray: 10000, 1;')
  failMarker.appendChild(failPath)
  failDefs.appendChild(failMarker)
  
  // 创建失败状态的条件表达式标记
  const failConditionalMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker')
  failConditionalMarker.setAttribute('id', 'conditional-flow-marker-white-fail')
  failConditionalMarker.setAttribute('viewBox', '0 0 20 20')
  failConditionalMarker.setAttribute('refX', '-1')
  failConditionalMarker.setAttribute('refY', '10')
  failConditionalMarker.setAttribute('markerWidth', '10')
  failConditionalMarker.setAttribute('markerHeight', '10')
  failConditionalMarker.setAttribute('orient', 'auto')
  const failConditionalPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  failConditionalPath.setAttribute('class', 'fail-conditional')
  failConditionalPath.setAttribute('d', 'M 0 10 L 8 6 L 16 10 L 8 14 Z')
  failConditionalPath.setAttribute('style', 'stroke-width: 1px; stroke-linecap: round; stroke-dasharray: 10000, 1;')
  failConditionalMarker.appendChild(failConditionalPath)
  failDefs.appendChild(failConditionalMarker)
  
  svg.appendChild(successDefs)
  svg.appendChild(failDefs)
}

// 任务悬浮弹窗
const onSelectElement = (element) => {
  selectTaskId.value = undefined
  dlgTitle.value = undefined

  if (processNodeInfo.value == null || processNodeInfo.value.finishedTaskSet == null) return

  if (element == null || processNodeInfo.value.finishedTaskSet.indexOf(element.id) === -1) {
    return
  }

  selectTaskId.value = element.id
  dlgTitle.value = element.businessObject ? element.businessObject.name : undefined
  // 计算当前悬浮任务审批记录，如果记录为空不显示弹窗
  taskCommentList.value = (props.allCommentList || []).filter(item => {
    return item.activityId === selectTaskId.value
  })
  dialogVisible.value = true
}

// 显示流程图
const importXML = async (xml) => {
  clearViewer()
  if (xml != null && xml !== '') {
    try {
      bpmnViewer.value = new BpmnViewer({
        additionalModules: [
          // 移动整个画布
          MoveCanvasModule
        ],
        container: processCanvasRef.value,
      })
      // 任务节点悬浮事件
      bpmnViewer.value.on('element.click', ({ element }) => {
        onSelectElement(element)
      })

      isLoading.value = true
      await bpmnViewer.value.importXML(xml)
      addCustomDefs()
      // 自动适应视图
      bpmnViewer.value.get('canvas').zoom('fit-viewport', 'auto')
    } catch (e) {
      console.error('Failed to import XML:', e)
      ElMessage.error('流程图加载失败: ' + (e.message || '未知错误'))
      clearViewer()
    } finally {
      isLoading.value = false
      if (processNodeInfo.value) {
        setProcessStatus(processNodeInfo.value)
      }
    }
  }
}

// 设置流程图元素状态
const setProcessStatus = (info) => {
  processNodeInfo.value = info
  if (isLoading.value || processNodeInfo.value == null || bpmnViewer.value == null) return
  let { finishedTaskSet, rejectedTaskSet, unfinishedTaskSet, finishedSequenceFlowSet } = processNodeInfo.value
  const canvas = bpmnViewer.value.get('canvas')
  const elementRegistry = bpmnViewer.value.get('elementRegistry')
  if (Array.isArray(finishedSequenceFlowSet)) {
    finishedSequenceFlowSet.forEach(item => {
      if (item != null) {
        canvas.addMarker(item, 'success')
        let element = elementRegistry.get(item)
        const conditionExpression = element.businessObject.conditionExpression
        if (conditionExpression) {
          canvas.addMarker(item, 'condition-expression')
        }
      }
    })
  }
  if (Array.isArray(finishedTaskSet)) {
    finishedTaskSet.forEach(item => canvas.addMarker(item, 'success'))
  }
  if (Array.isArray(unfinishedTaskSet)) {
    unfinishedTaskSet.forEach(item => canvas.addMarker(item, 'primary'))
  }
  if (Array.isArray(rejectedTaskSet)) {
    rejectedTaskSet.forEach(item => {
      if (item != null) {
        let element = elementRegistry.get(item)
        if (element.type.includes('Task')) {
          canvas.addMarker(item, 'danger')
        } else {
          canvas.addMarker(item, 'warning')
        }
      }
    })
  }
}
</script>

<style scoped>
</style>
