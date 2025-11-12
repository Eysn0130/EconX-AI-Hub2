# 经智AI智能体工作平台（Vite + React 版本）

本项目使用 [Vite](https://vitejs.dev) 与 React 重新构建原有的经智AI智能体工作平台，保持了原始界面的排版与样式布局，并在单页应用架构下提供多个业务模块。

## 项目结构

```
├── index.html            # Vite 入口文件
├── package.json
├── src
│   ├── App.jsx           # 路由配置
│   ├── main.jsx          # 应用入口
│   ├── components        # 公共组件（顶部导航、侧边栏等）
│   ├── context           # 全局上下文
│   ├── data              # 导航、卡片配置
│   ├── hooks             # 自定义 Hook
│   ├── pages             # 各业务页面
│   └── styles            # 样式文件
└── vite.config.js
```

## 可用脚本

- `npm install` 安装依赖（首次需要外网环境）
- `npm run dev` 启动开发服务器
- `npm run build` 生产构建
- `npm run preview` 预览生产构建结果

## 访问说明

- 主页：`/`
- 模块页面：`/general-ai`、`/finance-case` 等（详见 `src/data/iframePages.js`）
- 统计分析：`/stats`
- 登录页：`/login`、`/login2`
- 浏览器安装指南：`/chrome-installer`

系统支持携带 `policeid` 查询参数，页面间跳转会自动保留该参数。
