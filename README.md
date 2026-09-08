# Little Car Museum · 小小汽车馆

面向 3～8 岁儿童及家长的响应式汽车认知网站，让孩子通过旋转、缩放和切换视角观察汽车，认识汽车类型、颜色与外观部件。

> 当前阶段：TASK-002 核心类型与开发占位数据。首页仍为准备中页面，尚未开发车辆列表、3D、数据库或后台业务。

## 项目文档

- [需求文档](./需求文档.md)：产品范围、功能规格、数据模型、任务与上线标准。
- [AGENTS.md](./AGENTS.md)：大模型及开发者的实施、验证和交付规范。
- [素材授权说明](./assets-license/README.md)：素材引入与审核要求。

## 环境与启动

使用 nvm 管理 Node.js，仓库通过 `.nvmrc` 固定 **24.18.0**，初始化使用 npm **11.16.0**。依赖精确版本记录在 `package.json` 与 `package-lock.json`，安装使用 npm。

```bash
nvm install
nvm use
npm ci
cp .env.example .env.local
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。若当前终端没有 `nvm` 命令，请先按本机 nvm 安装方式加载 shell 配置。

当前页面无需数据库、对象存储或密钥即可运行；`.env.local` 的服务端配置保留空值即可。后续 TASK-007/009/011 接入数据库、认证和上传时再配置对应变量，不要填写虚构凭据。

## 开发与验证命令

| 命令                   | 用途                                    |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | 启动开发服务                            |
| `npm run lint`         | ESLint 检查，警告也视为失败             |
| `npm run typecheck`    | 生成 Next.js 路由类型并执行严格类型检查 |
| `npm run test`         | 一次性运行 Vitest 单元/组件测试         |
| `npm run test:watch`   | Vitest 监听模式                         |
| `npm run format:check` | 检查格式                                |
| `npm run format`       | 格式化；避免对无关已有文件批量修改      |
| `npm run build`        | 生成生产构建                            |
| `npm run start`        | 启动已构建的生产服务                    |
| `npm run test:e2e`     | 运行 Playwright 浏览器测试              |

首次运行 E2E 需要安装 Chromium，并先生成生产构建：

```bash
npx playwright install chromium
npm run build
npm run test:e2e
```

Linux CI 如缺少系统库，可使用 `npx playwright install --with-deps chromium`。E2E 自动在 `127.0.0.1:3100` 启停生产服务，运行前请保持端口空闲；每次修改源码后重新构建。

当前 Vitest 冒烟测试验证 TSX、路径别名、DOM 环境与可访问标题；Playwright 覆盖手机 390×844、平板 768×1024、桌面 1440×900，检查响应、标题、语言、运行时错误和横向溢出。三种配置均使用 Chromium，不代表 Safari、Firefox 或移动真机验证。测试报告、截图和构建缓存均不提交。

格式化忽略原始需求文档与已确认的 `AGENTS.md`，避免初始化时产生无关差异。

## 工具兼容性说明

当前 Next.js 16.3.4 的 React ESLint 规则在 ESLint 10 下存在运行时兼容问题，因此锁定 ESLint 9.39.5。该版本安装时会提示已停止支持；后续应在 Next.js 规则兼容后单独升级，不通过关闭规则或强制忽略依赖冲突绕过检查。

## 技术与目录

应用使用 Next.js App Router、React、TypeScript strict 和 Tailwind CSS（PostCSS）；ESLint 使用 Next.js 配置并与 Prettier 分工。页面使用系统字体，不依赖外部字体下载。初始化页暂时禁止搜索引擎收录，正式公开页面在后续 SEO 任务中调整。

```text
src/
  app/                 # 根布局与准备中页面；后续页面和 api/v1 按任务添加
  components/
    car/ brand/ layout/ three/ ui/
  lib/
    data/               # 明确标记的开发占位数据
    db/ storage/ validation/ three/ licenses/
  hooks/ stores/
  types/                # 内容、查看器、本地存储、统计和 API 契约
  styles/              # Tailwind 入口与全局基础样式
  tests/
    unit/              # Vitest 单元/组件测试
    e2e/               # Playwright 浏览器测试
prisma/                # 后续 TASK-007 建立 schema、迁移和 seed
public/
  images/ audio/ placeholders/
assets-license/        # 许可证与来源证据
```

预留目录通过 `.gitkeep` 纳入 Git，实际实现时按需替换；不提前添加业务路由、空组件或数据库模型。Three.js、React Three Fiber、Prisma 和存储依赖随对应任务接入。

## 环境变量

`.env.example` 提供变量名和非敏感默认值，真实环境文件由 `.gitignore` 排除：

- `NEXT_PUBLIC_SITE_URL`：站点地址。
- `DATABASE_URL`、`AUTH_SECRET`：后续数据库连接与会话密钥，仅服务端使用。
- `STORAGE_*`：后续对象存储配置，密钥不暴露到客户端。
- `MAX_*_SIZE_MB`：后续上传限制，低清/高清 GLB 为 20/50MB，图片 5MB，音频与许可证附件 10MB。
- `NEXT_PUBLIC_ANALYTICS_ENABLED=false`、`ERROR_MONITORING_DSN`：预留统计/错误监控设置；当前没有接入监控服务，儿童区域默认关闭上报。

本阶段未进行数据库迁移，也没有要求配置真实凭据。

## 开发计划与产品边界

TASK-002 已建立内容、查看器、本地存储、统计和 API 的类型契约，并提供 5 辆通用汽车开发数据。数据常量使用 `DEVELOPMENT_PLACEHOLDER_ONLY` 标识，所有车辆均为 `DRAFT`，不关联品牌或许可证，不计入 MVP 内容数量。

下一步为 TASK-003：汽车列表、分类筛选及页面状态。完整顺序和任务范围见需求文档第 35 章，不自动扩展到后续任务。

计划实现分类浏览、3D 观察及图片降级、本地收藏/最近浏览、名称语音和内容管理后台。MVP 上线至少需要 12 辆可展示汽车、6 个有已发布内容的分类，其中至少 8 辆支持 3D；完整上线条件以第 41 章为准，工程初始化不代表 MVP 完成。

- 以授权明确的通用模型为主，不冒充真实品牌量产车型。
- 正式发布前审核所有模型、图片、贴图、音频和 Logo 的许可，保留来源、署名与修改记录。
- 占位资源不计入正式上线内容；当前没有引入第三方视觉或音频素材。
- 不包含广告、支付、评论社区或儿童公开账号；收藏与最近浏览计划保存在浏览器本地。
- 不提交真实环境文件、密钥、测试登录状态或数据备份。

## 许可证

本仓库暂未指定代码许可证。第三方素材按各自许可证使用；家庭使用或非商业项目定位不替代素材授权审核，也不代表已获得汽车品牌授权。
