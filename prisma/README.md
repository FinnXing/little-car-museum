# Prisma 数据库

本目录维护 PostgreSQL 数据模型、迁移和开发环境 Seed。Seed 只写入明确标记为 `DRAFT` 的通用占位汽车，不会形成公开内容，也不替代正式素材授权审核。

## 首次初始化

1. 准备 PostgreSQL，并在 `.env` 中设置 `DATABASE_URL`（或在命令前临时导出该变量）。
2. 执行 `npm run db:migrate` 创建本地迁移并应用到数据库。
3. 执行 `npm run db:seed` 写入开发占位分类和汽车。
4. 设置 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD` 环境变量后执行 `npm run admin:create` 创建或重置管理员；不会提供公众注册接口。
5. 代码生成可单独执行 `npm run db:generate`。

没有 PostgreSQL 时仍可运行 `npm run db:validate` 和 `npm run db:generate` 检查 schema；这两个命令不连接数据库。
