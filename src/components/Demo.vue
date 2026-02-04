<template>
  <div>
    <h2>{{ message }}</h2>
    <button @click="updateMessage">更新消息</button>
    <!-- v-html 指令用于直接渲染 HTML：不像文本插值 {{}} 那样只显示纯文本，v-html 会解析并渲染 HTML 标签 -->
    <div v-html="renderedMarkdown"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';

const message = ref('Hello, Vue!');
const renderedMarkdown = ref('');

const markdown = `
# 标题
- 列表项1
- 列表项2

## 表格示例

| 姓名 | 年龄 | 城市 |
| ---- | ---- | ---- |
| 张三 | 25   | 北京 |
| 李四 | 30   | 上海 |
| 王五 | 28   | 广州 |

## 代码示例

JavaScript 代码块：

\`\`\`js
function greet(name) {
  console.log('Hello, ' + name + '!');
}

greet('World');
\`\`\`

Python 代码块：

\`\`\`python
def factorial(n):
    if n == 0:
        return 1
    else:
        return n * factorial(n-1)

print(factorial(5))
\`\`\`

CSS 代码块：

\`\`\`css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100vh;
  background-color: #f0f0f0;
}
\`\`\`

HTML 代码块：

\`\`\`html
<!DOCTYPE html>
<html>
<head>
  <title>示例页面</title>
</head>
<body>
  <h1>Hello World</h1>
</body>
</html>
\`\`\`
`;

marked.use({
  gfm: true,        // 启用 GitHub 风格（表格、删除线等）
  breaks: true,     // 换行符转为 <br>
  headerIds: true,  // 为标题添加 id 属性
  mangle: false,    // 不转义邮件地址（防止 XSS）
  highlight: function(code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  }
});

onMounted(() => {
  renderedMarkdown.value = marked.parse(markdown);
});

const updateMessage = () => {
  message.value = '消息已更新！';
};
</script>

<style scoped>
h2 {
  color: green;
}
</style>