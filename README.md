# 春节倒计时

一个基于 Next.js 的春节倒计时页面，支持：
- 自动计算下一次春节日期（农历正月初一）
- 动态背景图自动轮换（含本地兜底图）
- 音乐播放器
- 适配桌面端与移动端

## 技术栈

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- lunar-javascript

## 本地开发

```bash
npm install
npm run dev
```

默认访问：`http://localhost:3000`

## 构建与启动

```bash
npm run build
npm run start
```

## 代码结构

```text
app/                 # 页面入口、布局、全局样式
components/          # 倒计时、播放器、UI 组件
hooks/               # 自定义 Hook（设备类型判断）
utils/               # 业务工具（春节日期计算）
public/old/          # 旧版静态资源（含兜底背景图）
```

## 背景图机制

- 默认优先使用 `bing.img.run` 随机背景图
- 到切换时间前会提前预加载下一张
- 加载失败时回退到本地图片：`/old/img/bj.jpg`

## 部署

仓库包含 GitHub Actions 工作流：`.github/workflows/nextjs.yml`  
可用于部署到 GitHub Pages（按工作流中的分支触发）。

## License

[MIT](LICENSE)
