# Little Car Museum · 小小汽车馆

面向 3～8 岁儿童及家长的响应式汽车认知网站，让孩子通过旋转、缩放和切换视角观察汽车，认识汽车类型、颜色与外观部件。

> 当前阶段：TASK-008 公共 API。已接入 `/api/v1` 分类、品牌、汽车、随机汽车、搜索和公开许可证接口；接口只返回已发布内容。

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

TASK-004 原型页位于 [/prototype/viewer](http://localhost:3000/prototype/viewer)，使用 `public/models/placeholder-car.glb`。GLB 由 `scripts/generate-placeholder-glb.mjs` 生成，后续可替换为已审核的模型文件。

TASK-005 详情页路由为 `/cars/[slug]`。开发环境可打开 `/cars/placeholder-red-lightning-sports-car` 预览占位数据；生产构建会隐藏草稿车辆。

TASK-006 页面为 `/favorites` 和 `/history`。记录只保存在当前浏览器，不收集儿童身份信息；内容列表以当前可访问车辆为准清洗失效记录。

TASK-007 已建立 PostgreSQL + Prisma 数据模型、首个迁移和幂等开发 Seed。TASK-008 的公共接口位于 `/api/v1`，数据库未配置时前台占位页面仍可独立运行。

前台占位页面无需数据库即可运行；执行 Prisma 校验、生成、迁移或 Seed 前，需要在 Prisma CLI 使用的 `.env` 中配置真实的 `DATABASE_URL`（Next.js 页面仍可使用 `.env.local`）。`.env.example` 只提供占位连接串，不包含真实凭据。

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
| `npm run db:validate`  | 校验 Prisma schema（不连接数据库）      |
| `npm run db:generate`  | 生成 Prisma Client                      |
| `npm run db:migrate`   | 创建并应用本地开发迁移                  |
| `npm run db:deploy`    | 应用已有生产迁移                        |
| `npm run db:seed`      | 写入开发环境占位 Seed                   |

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

## 公共 API

API 统一使用 `/api/v1` 前缀，成功响应为 `{ "success": true, "data": ... }`，失败响应为 `{ "success": false, "error": { "code", "message", "requestId" } }`。分类、品牌和汽车接口只返回 `PUBLISHED` 内容；公开许可证接口只返回审核通过且允许公开展示的记录。

| 方法 | 路径                      | 说明                                                                                              |
| ---- | ------------------------- | ------------------------------------------------------------------------------------------------- |
| GET  | `/api/v1/categories`      | 已发布汽车使用的启用分类                                                                          |
| GET  | `/api/v1/brands`          | 有已发布汽车的品牌                                                                                |
| GET  | `/api/v1/brands/:slug`    | 品牌详情                                                                                          |
| GET  | `/api/v1/vehicles`        | 汽车列表，支持 `category`、`brand`、`displayType`、`keyword`、`isHot`、`page`、`pageSize`、`sort` |
| GET  | `/api/v1/vehicles/random` | 随机返回一辆已发布汽车                                                                            |
| GET  | `/api/v1/vehicles/:slug`  | 汽车详情及颜色、热点、素材许可证                                                                  |
| GET  | `/api/v1/search?q=`       | 按关键词搜索汽车，返回分页列表                                                                    |
| GET  | `/api/v1/licenses/public` | 公开展示的许可证列表                                                                              |

参数错误返回 `VALIDATION_ERROR`，找不到内容返回 `NOT_FOUND`，服务端异常返回 `INTERNAL_ERROR`；错误响应不会暴露技术堆栈。

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
prisma/                # PostgreSQL schema、迁移和开发 Seed
public/
  images/ audio/ placeholders/
assets-license/        # 许可证与来源证据
```

预留目录通过 `.gitkeep` 纳入 Git，实际实现时按需替换；不提前添加无关业务路由或空组件。TASK-004 已接入 Three.js、React Three Fiber 和 drei；TASK-007 已接入 Prisma，数据库访问入口位于 `src/lib/db/prisma.ts`。

## 环境变量

`.env.example` 提供变量名和非敏感默认值，真实环境文件由 `.gitignore` 排除：

- `NEXT_PUBLIC_SITE_URL`：站点地址。
- `DATABASE_URL`：PostgreSQL 连接串，仅服务端使用；请替换 `.env.example` 中的 `USER` 与 `PASSWORD` 占位符。
- `AUTH_SECRET`：后续管理员会话密钥，仅服务端使用。
- `STORAGE_*`：后续对象存储配置，密钥不暴露到客户端。
- `MAX_*_SIZE_MB`：后续上传限制，低清/高清 GLB 为 20/50MB，图片 5MB，音频与许可证附件 10MB。
- `NEXT_PUBLIC_ANALYTICS_ENABLED=false`、`ERROR_MONITORING_DSN`：预留统计/错误监控设置；当前没有接入监控服务，儿童区域默认关闭上报。

迁移文件已提交到 `prisma/migrations`，但仓库不包含真实数据库凭据或数据库备份。

## 开发计划与产品边界

TASK-003 已提供 `/cars` 汽车展厅、分类筛选、响应式汽车卡片和完整页面状态。TASK-004 新增 `/prototype/viewer` 独立观察台，支持模型加载与图片降级。TASK-005 新增 `/cars/[slug]` 详情页，包含查看器、收藏、热点和素材信息。TASK-006 新增 `/favorites` 与 `/history` 本地记录页。由于占位车辆均为草稿，它们只会在 `next dev` 中显示；生产构建默认进入空状态，避免公开未发布内容。

下一步为 TASK-009：开发管理员认证。完整顺序和任务范围见需求文档第 35 章。

计划实现分类浏览、3D 观察及图片降级、本地收藏/最近浏览、名称语音和内容管理后台。MVP 上线至少需要 12 辆可展示汽车、6 个有已发布内容的分类，其中至少 8 辆支持 3D；完整上线条件以第 41 章为准，工程初始化不代表 MVP 完成。

- 以授权明确的通用模型为主，不冒充真实品牌量产车型。
- 正式发布前审核所有模型、图片、贴图、音频和 Logo 的许可，保留来源、署名与修改记录。
- 占位资源不计入正式上线内容；当前没有引入第三方视觉或音频素材。
- 不包含广告、支付、评论社区或儿童公开账号；收藏与最近浏览计划保存在浏览器本地。
- 不提交真实环境文件、密钥、测试登录状态或数据备份。

## 许可证

本仓库暂未指定代码许可证。第三方素材按各自许可证使用；家庭使用或非商业项目定位不替代素材授权审核，也不代表已获得汽车品牌授权。
