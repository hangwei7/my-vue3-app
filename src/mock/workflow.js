// Mock数据服务
const mockData = {
  // 流程分类
  categoryList: [
    { categoryId: 1, categoryName: '办公流程', code: 'office', remark: '办公相关流程' },
    { categoryId: 2, categoryName: '人事流程', code: 'hr', remark: '人事相关流程' },
    { categoryId: 3, categoryName: '财务流程', code: 'finance', remark: '财务相关流程' }
  ],
  // 流程部署
  deployList: [
    { 
      deploymentId: '1', 
      processKey: 'leave_process', 
      processName: '请假流程', 
      category: 'hr',
      categoryName: '人事流程',
      version: 1,
      suspended: false,
      deploymentTime: '2024-01-01 10:00:00',
      definitionId: 'def1'
    },
    { 
      deploymentId: '2', 
      processKey: 'expense_process', 
      processName: '报销流程', 
      category: 'finance',
      categoryName: '财务流程',
      version: 1,
      suspended: false,
      deploymentTime: '2024-01-02 10:00:00',
      definitionId: 'def2'
    }
  ],
  // 流程表单
  formList: [
    { formId: 1, formName: '请假表单', content: '{}', remark: '请假申请表单' },
    { formId: 2, formName: '报销表单', content: '{}', remark: '费用报销表单' }
  ],
  // 流程模型
  modelList: [
    {
      modelId: 1,
      modelKey: 'leave_process',
      modelName: '请假流程',
      category: 'hr',
      categoryName: '人事流程',
      version: 1,
      description: '员工请假流程',
      createTime: '2024-01-01 10:00:00'
    }
  ],
  // 流程定义（发起流程）
  processList: [
    {
      definitionId: 'def1',
      deploymentId: '1',
      processKey: 'leave_process',
      processName: '请假流程',
      category: 'hr',
      categoryName: '人事流程',
      version: 1,
      suspended: false,
      deploymentTime: '2024-01-01 10:00:00'
    }
  ],
  // 待办任务
  todoList: [
    {
      taskId: 'task1',
      procInsId: 'proc1',
      procDefName: '请假流程',
      taskName: '部门经理审批',
      procDefVersion: 1,
      startUserName: '张三',
      createTime: '2024-01-15 10:00:00'
    }
  ],
  // 我发起的流程
  ownProcessList: [
    {
      procInsId: 'proc1',
      procDefId: 'def1',
      procDefName: '请假流程',
      category: 'hr',
      taskName: '部门经理审批',
      procDefVersion: 1,
      processStatus: '1',
      createTime: '2024-01-15 09:00:00',
      duration: '1天2小时',
      deployId: '1'
    }
  ],
  // 已办任务
  finishedList: [
    {
      taskId: 'task2',
      procInsId: 'proc2',
      procDefName: '报销流程',
      taskName: '财务审批',
      startUserName: '李四',
      createTime: '2024-01-14 10:00:00',
      finishTime: '2024-01-14 14:00:00',
      duration: '4小时'
    }
  ],
  // 待签任务
  claimList: [
    {
      taskId: 'task3',
      procDefName: '请假流程',
      taskName: '人事审批',
      procDefVersion: 1,
      startUserName: '王五',
      createTime: '2024-01-16 10:00:00'
    }
  ]
}

// 生成分页响应
function createPageResponse(list, queryParams) {
  const { pageNum = 1, pageSize = 10 } = queryParams || {}
  const start = (pageNum - 1) * pageSize
  const end = start + pageSize
  return {
    code: 200,
    msg: '操作成功',
    rows: list.slice(start, end),
    total: list.length
  }
}

// 模拟API延迟
function delay(ms = 300) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const workflowMock = {
  // 流程分类API
  '/workflow/category/list': async (id, method, query) => {
    await delay()
    let list = [...mockData.categoryList]
    if (query && query.categoryName) {
      list = list.filter(item => item.categoryName.includes(query.categoryName))
    }
    if (query && query.code) {
      list = list.filter(item => item.code.includes(query.code))
    }
    return createPageResponse(list, query || {})
  },
  '/workflow/category/listAll': async (id, method, query) => {
    await delay()
    return {
      code: 200,
      msg: '操作成功',
      data: mockData.categoryList
    }
  },
  '/workflow/category/:id': async (id, method, data) => {
    await delay()
    if (method === 'GET') {
      const item = mockData.categoryList.find(c => c.categoryId == id)
      return { code: 200, msg: '操作成功', data: item }
    } else if (method === 'PUT') {
      const index = mockData.categoryList.findIndex(c => c.categoryId == data.categoryId)
      if (index >= 0) {
        mockData.categoryList[index] = { ...mockData.categoryList[index], ...data }
      }
      return { code: 200, msg: '修改成功' }
    } else if (method === 'DELETE') {
      mockData.categoryList = mockData.categoryList.filter(c => c.categoryId != id)
      return { code: 200, msg: '删除成功' }
    } else if (method === 'POST') {
      const newId = Math.max(...mockData.categoryList.map(c => c.categoryId)) + 1
      mockData.categoryList.push({ ...data, categoryId: newId })
      return { code: 200, msg: '新增成功' }
    }
  },
  
  // 流程部署API
  '/workflow/deploy/list': async (id, method, query) => {
    await delay()
    let list = [...mockData.deployList]
    if (query && query.processKey) {
      list = list.filter(item => item.processKey.includes(query.processKey))
    }
    if (query && query.processName) {
      list = list.filter(item => item.processName.includes(query.processName))
    }
    if (query && query.category) {
      list = list.filter(item => item.category === query.category)
    }
    return createPageResponse(list, query || {})
  },
  '/workflow/deploy/publishList': async (id, method, query) => {
    await delay()
    let list = mockData.deployList.filter(item => item.processKey === (query && query.processKey))
    return createPageResponse(list, query || {})
  },
  '/workflow/deploy/bpmnXml/:id': async (id, method, data) => {
    await delay()
    // 返回一个有效的BPMN XML示例
    const bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn2:process id="Process_1" isExecutable="true">
    <bpmn2:startEvent id="StartEvent_1" name="开始">
      <bpmn2:outgoing>Flow_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:userTask id="UserTask_1" name="用户任务">
      <bpmn2:incoming>Flow_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_2</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:endEvent id="EndEvent_1" name="结束">
      <bpmn2:incoming>Flow_2</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="UserTask_1" />
    <bpmn2:sequenceFlow id="Flow_2" sourceRef="UserTask_1" targetRef="EndEvent_1" />
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="99" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_UserTask_2" bpmnElement="UserTask_1">
        <dc:Bounds x="270" y="77" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_EndEvent_2" bpmnElement="EndEvent_1">
        <dc:Bounds x="432" y="99" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="BPMNEdge_Flow_1" bpmnElement="Flow_1">
        <di:waypoint x="215" y="117" />
        <di:waypoint x="270" y="117" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BPMNEdge_Flow_2" bpmnElement="Flow_2">
        <di:waypoint x="370" y="117" />
        <di:waypoint x="432" y="117" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`
    return {
      code: 200,
      msg: '操作成功',
      data: bpmnXml
    }
  },
  '/workflow/deploy/changeState': async (id, method, params) => {
    await delay()
    // 更新部署列表中的状态
    if (params && params.definitionId) {
      const deploy = mockData.deployList.find(d => d.definitionId === params.definitionId)
      if (deploy) {
        deploy.suspended = params.state === 'suspended'
      }
    }
    return { code: 200, msg: '操作成功' }
  },
  '/workflow/deploy/:id': async (id, method, data) => {
    await delay()
    if (method === 'DELETE') {
      mockData.deployList = mockData.deployList.filter(d => d.deploymentId != id)
      return { code: 200, msg: '删除成功' }
    }
  },
  
  // 流程表单API
  '/workflow/form/list': async (id, method, query) => {
    await delay()
    let list = [...mockData.formList]
    if (query && query.formName) {
      list = list.filter(item => item.formName.includes(query.formName))
    }
    return createPageResponse(list, query || {})
  },
  '/workflow/form/:id': async (id, method, data) => {
    await delay()
    if (method === 'GET') {
      const item = mockData.formList.find(f => f.formId == id)
      return { code: 200, msg: '操作成功', data: item }
    } else if (method === 'PUT') {
      const index = mockData.formList.findIndex(f => f.formId == data.formId)
      if (index >= 0) {
        mockData.formList[index] = { ...mockData.formList[index], ...data }
      }
      return { code: 200, msg: '修改成功' }
    } else if (method === 'DELETE') {
      mockData.formList = mockData.formList.filter(f => f.formId != id)
      return { code: 200, msg: '删除成功' }
    } else if (method === 'POST') {
      const newId = Math.max(...mockData.formList.map(f => f.formId)) + 1
      mockData.formList.push({ ...data, formId: newId })
      return { code: 200, msg: '新增成功' }
    }
  },
  
  // 流程模型API
  '/workflow/model/list': async (id, method, query) => {
    await delay()
    let list = [...mockData.modelList]
    if (query && query.modelKey) {
      list = list.filter(item => item.modelKey.includes(query.modelKey))
    }
    if (query && query.modelName) {
      list = list.filter(item => item.modelName.includes(query.modelName))
    }
    if (query && query.category) {
      list = list.filter(item => item.category === query.category)
    }
    return createPageResponse(list, query || {})
  },
  '/workflow/model/historyList': async (id, method, query) => {
    await delay()
    let list = mockData.modelList.filter(item => item.modelKey === (query && query.modelKey))
    return createPageResponse(list, query || {})
  },
  '/workflow/model/bpmnXml/:id': async (id, method, data) => {
    await delay()
    // 返回一个有效的BPMN XML示例
    const bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn2:process id="Process_1" isExecutable="true">
    <bpmn2:startEvent id="StartEvent_1" name="开始">
      <bpmn2:outgoing>Flow_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:userTask id="UserTask_1" name="用户任务">
      <bpmn2:incoming>Flow_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_2</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:endEvent id="EndEvent_1" name="结束">
      <bpmn2:incoming>Flow_2</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="UserTask_1" />
    <bpmn2:sequenceFlow id="Flow_2" sourceRef="UserTask_1" targetRef="EndEvent_1" />
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="99" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_UserTask_2" bpmnElement="UserTask_1">
        <dc:Bounds x="270" y="77" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_EndEvent_2" bpmnElement="EndEvent_1">
        <dc:Bounds x="432" y="99" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="BPMNEdge_Flow_1" bpmnElement="Flow_1">
        <di:waypoint x="215" y="117" />
        <di:waypoint x="270" y="117" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BPMNEdge_Flow_2" bpmnElement="Flow_2">
        <di:waypoint x="370" y="117" />
        <di:waypoint x="432" y="117" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`
    return {
      code: 200,
      msg: '操作成功',
      data: bpmnXml
    }
  },
  '/workflow/model/:id': async (id, method, data) => {
    await delay()
    if (method === 'GET') {
      const item = mockData.modelList.find(m => m.modelId == id)
      return { code: 200, msg: '操作成功', data: item }
    } else if (method === 'PUT') {
      const index = mockData.modelList.findIndex(m => m.modelId == data.modelId)
      if (index >= 0) {
        mockData.modelList[index] = { ...mockData.modelList[index], ...data }
      }
      return { code: 200, msg: '修改成功' }
    } else if (method === 'DELETE') {
      mockData.modelList = mockData.modelList.filter(m => m.modelId != id)
      return { code: 200, msg: '删除成功' }
    } else if (method === 'POST') {
      const newId = Math.max(...mockData.modelList.map(m => m.modelId), 0) + 1
      mockData.modelList.push({ ...data, modelId: newId, version: 1, createTime: new Date().toLocaleString() })
      return { code: 200, msg: '新增成功' }
    }
  },
  '/workflow/model/save': async (id, method, data) => {
    await delay()
    return { code: 200, msg: '保存成功' }
  },
  '/workflow/model/latest': async (id, method, params) => {
    await delay()
    return { code: 200, msg: '操作成功' }
  },
  '/workflow/model/deploy': async (id, method, params) => {
    await delay()
    return { code: 200, msg: '部署成功' }
  },
  
  // 流程定义API
  '/workflow/process/list': async (id, method, query) => {
    await delay()
    let list = [...mockData.processList]
    if (query && query.processKey) {
      list = list.filter(item => item.processKey.includes(query.processKey))
    }
    if (query && query.processName) {
      list = list.filter(item => item.processName.includes(query.processName))
    }
    if (query && query.category) {
      list = list.filter(item => item.category === query.category)
    }
    return createPageResponse(list, query || {})
  },
  '/workflow/process/bpmnXml/:id': async (id, method, data) => {
    await delay()
    // 返回一个有效的BPMN XML示例
    const bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn2:process id="Process_1" isExecutable="true">
    <bpmn2:startEvent id="StartEvent_1" name="开始">
      <bpmn2:outgoing>Flow_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:userTask id="UserTask_1" name="用户任务">
      <bpmn2:incoming>Flow_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_2</bpmn2:outgoing>
    </bpmn2:userTask>
    <bpmn2:endEvent id="EndEvent_1" name="结束">
      <bpmn2:incoming>Flow_2</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="UserTask_1" />
    <bpmn2:sequenceFlow id="Flow_2" sourceRef="UserTask_1" targetRef="EndEvent_1" />
  </bpmn2:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="179" y="99" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_UserTask_2" bpmnElement="UserTask_1">
        <dc:Bounds x="270" y="77" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="_BPMNShape_EndEvent_2" bpmnElement="EndEvent_1">
        <dc:Bounds x="432" y="99" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="BPMNEdge_Flow_1" bpmnElement="Flow_1">
        <di:waypoint x="215" y="117" />
        <di:waypoint x="270" y="117" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="BPMNEdge_Flow_2" bpmnElement="Flow_2">
        <di:waypoint x="370" y="117" />
        <di:waypoint x="432" y="117" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`
    return {
      code: 200,
      msg: '操作成功',
      data: bpmnXml
    }
  },
  '/workflow/process/todoList': async (id, method, query) => {
    await delay()
    let list = [...mockData.todoList]
    if (query && query.processName) {
      list = list.filter(item => item.procDefName.includes(query.processName))
    }
    return createPageResponse(list, query || {})
  },
  '/workflow/process/ownList': async (id, method, query) => {
    await delay()
    let list = [...mockData.ownProcessList]
    if (query && query.processKey) {
      list = list.filter(item => item.procDefName.includes(query.processKey))
    }
    if (query && query.processName) {
      list = list.filter(item => item.procDefName.includes(query.processName))
    }
    if (query && query.category) {
      list = list.filter(item => item.category === query.category)
    }
    return createPageResponse(list, query || {})
  },
  '/workflow/process/finishedList': async (id, method, query) => {
    await delay()
    let list = [...mockData.finishedList]
    if (query && query.processName) {
      list = list.filter(item => item.procDefName.includes(query.processName))
    }
    return createPageResponse(list, query || {})
  },
  '/workflow/process/claimList': async (id, method, query) => {
    await delay()
    let list = [...mockData.claimList]
    if (query && query.processName) {
      list = list.filter(item => item.procDefName.includes(query.processName))
    }
    return createPageResponse(list, query || {})
  },
  '/workflow/task/stopProcess': async (id, method, data) => {
    await delay()
    return { code: 200, msg: '取消成功' }
  },
  '/workflow/process/instance/:id': async (id, method, data) => {
    await delay()
    if (method === 'DELETE') {
      mockData.ownProcessList = mockData.ownProcessList.filter(p => p.procInsId != id)
      return { code: 200, msg: '删除成功' }
    }
  },
  '/workflow/task/claim': async (id, method, data) => {
    await delay()
    return { code: 200, msg: '签收成功' }
  }
}

// 请求拦截器
export function setupMockInterceptor(axiosInstance) {
  axiosInstance.interceptors.request.use(config => {
    const url = config.url
    const method = config.method.toUpperCase()
    
    // 查找匹配的mock处理器
    for (const pattern in workflowMock) {
      const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '([^/]+)') + '$')
      const match = url.match(regex)
      
      if (match) {
        const params = match.slice(1)
        const handler = workflowMock[pattern]
        
        // 返回Promise以模拟异步请求
        return Promise.resolve({
          ...config,
          adapter: () => {
            return handler(params[0] || null, method, config.data || config.params)
              .then(response => ({
                data: response,
                status: 200,
                statusText: 'OK',
                headers: {},
                config
              }))
          }
        })
      }
    }
    
    return config
  })
}
