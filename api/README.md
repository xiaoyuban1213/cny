# Bing 壁纸仓库 & API

自建 Bing 每日壁纸方案：一次性从 Bing 官方 API 拉取历史壁纸，上传到自己的对象存储
（S3 / 腾讯云 COS，5G 空间足够），再由 EdgeOne Pages Function 提供随机壁纸接口，
彻底摆脱第三方免费 API 的不稳定。

> 为什么不放 GitHub 仓库/EO？壁纸文件大（几十张 × 几百 KB ~ 几 MB），会拖慢
> 仓库克隆和每次 EO 部署；对象存储 + CDN 才是大文件该去的地方。

## 目录结构

```
api/
├── download.js        # 下载脚本（一次性运行）
├── wallpapers.json    # 壁纸清单（download.js 生成）
└── wallpapers/        # 下载的壁纸图片（已 gitignore，上传对象存储用）

functions/
└── api/
    └── bg.js          # EdgeOne Pages Function：GET /api/bg 随机壁纸
```

## 使用步骤

### 1. 下载壁纸（一次性）

```bash
node api/download.js              # 默认 1920x1080，7 个市场 x 最近 7 天，去重
node api/download.js --uhd        # 下载 UHD 4K（体积大，空间够可开）
node api/download.js --days 3     # 只拉最近 3 天
```

产物：
- `api/wallpapers/YYYYMMDD.jpg`：壁纸图片（同一天多张时加 `-2/-3` 后缀）
- `api/wallpapers.json`：清单

### 2. 上传到对象存储

把 `api/wallpapers/` 上传到你的 S3 / 腾讯云 COS / 雨云对象存储，建议开启 CDN 加速。

雨云 S3 示例（或用控制台网页上传）：

```bash
# 使用 s3cmd 或 aws cli，示例（S3 兼容）：
aws s3 sync api/wallpapers/ s3://api-yuban/wallpapers/ --endpoint-url https://cn-nb1.rains3.com
```

> ⚠️ **必须开启公共读！**
> 壁纸会被网页 <img> 直接加载，桶必须是**公共读**（允许匿名 GetObject）。
> 当前桶 `api-yuban` 未开公共访问，直接访问会返回 **403**，背景图无法显示。
> 请在雨云控制台 → 存储桶 → 权限管理中，为桶（或至少 `wallpapers/` 前缀）添加
> 公共读策略（匿名读取），例如设置 Bucket Policy 允许 `s3:GetObject` 对 `*` 开放。

### 3. 配置 EdgeOne Pages 环境变量

在 EdgeOne Pages 项目 → 项目设置 → 环境变量 中配置：

| 变量 | 值（示例） |
|------|------|
| `WALLPAPER_BASE_URL` | `https://api-yuban.cn-nb1.rains3.com/wallpapers`（壁纸所在文件夹，**含** `/wallpapers`） |
| `WALLPAPER_NAMES` | 壁纸文件名（逗号分隔），不配置时用 `bg.js` 内嵌默认清单 |

`WALLPAPER_NAMES` 可复制 `api/wallpapers.json` 中所有 `file` 字段。

### 4. 部署后使用

```
GET /api/bg            # 302 跳转到随机壁纸（前端 <img> 直接可用）
GET /api/bg?json=1     # {"url":"https://.../20260813.jpg","title":"...","date":"20260813"}
GET /api/bg?list=1     # 壁纸清单
```

前端背景图源填入：`https://你的站点/api/bg`

## 说明

- 数据源 Bing 官方 API：`https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN`
- 多市场（`mkt`）可拿到不同壁纸，脚本按图片 URL 去重；单市场约回溯 7 天
- 无需定时更新，以后想补充新图再跑一次脚本 + 增量上传即可
- `functions/` 目录是 EdgeOne Pages Functions 的固定约定（兼容 Cloudflare Pages
  Functions 格式），EO 从 GitHub 拉取部署时自动识别
