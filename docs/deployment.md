# 部署说明

生产环境需要 Node.js 24.18.x、PostgreSQL、HTTPS 和一个禁止匿名写入的 S3 兼容对象存储。不要把 `.env`、管理员密码、数据库备份或素材原始文件提交到 Git。

## 首次部署

1. 在服务器配置 `DATABASE_URL`、至少 32 个字符的 `AUTH_SECRET`、`NEXT_PUBLIC_SITE_URL` 和对象存储变量。生产建议使用 `STORAGE_DRIVER=s3`，并设置 `STORAGE_ENDPOINT`、`STORAGE_REGION`、`STORAGE_BUCKET`、`STORAGE_ACCESS_KEY`、`STORAGE_SECRET_KEY`、`STORAGE_PUBLIC_BASE_URL`。
2. 安装并构建：

   ```bash
   nvm use
   npm ci
   npm run db:deploy
   npm run admin:create
   npm run build
   npm run start -- --hostname 127.0.0.1 --port 3000
   ```

3. 在反向代理终止 HTTPS，只将公开站点和受保护后台转发到 Next.js；数据库和对象存储只允许服务器网络访问。
4. 首次上线后用管理员账号访问 `/admin/assets` 上传一份测试文件，确认扩展名、MIME、文件头、大小校验和对象存储读取都正常，再删除测试记录或保持为未发布素材。

## 更新发布

先执行 `npm ci`、`npm run db:deploy` 和 `npm run build`，通过检查后再重启进程。迁移只向前执行，回滚应用版本前先确认数据库 schema 兼容。对象存储桶关闭匿名写入，公开读取只通过 CDN 或明确配置的公开前缀提供。

## 发布前检查

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`（若 Turbopack 受环境限制，使用 `npx next build --webpack`）
- `npm run test:e2e`
- 确认 `/admin` 未登录时跳转到 `/admin/login`，`/api/v1/admin/*` 未登录时返回 401。
- 确认 `/robots.txt` 禁止 `/admin` 和 `/api/`，`/sitemap.xml` 只包含公开页面和已发布汽车。
