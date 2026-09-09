# 备份与恢复说明

数据库和对象存储需要分别备份。备份文件包含内容、管理员和授权记录，必须放在受限目录并加密，不能提交到仓库。

## PostgreSQL 备份

使用与生产数据库兼容的 `pg_dump`，建议每天一次完整备份并保留至少 14 天：

```bash
pg_dump --format=custom --no-owner --file=backups/little-car-museum-$(date +%F).dump "$DATABASE_URL"
```

同时记录迁移版本（`SELECT * FROM \"_prisma_migrations\"`），备份目录只允许备份账号读取。

## 对象存储备份

为生产桶开启版本控制或跨区域复制，至少覆盖 `assets/` 前缀。同步工具必须使用只读备份凭据；不要把 `STORAGE_SECRET_KEY` 写入脚本或日志。数据库中的 `AssetObject.storageKey` 与对象存储 key 必须保持一致。

## 恢复演练

1. 创建隔离的恢复数据库和临时对象存储桶，禁止接入公网。
2. 恢复数据库：

   ```bash
   createdb little_car_museum_restore
   pg_restore --no-owner --dbname little_car_museum_restore backups/little-car-museum-YYYY-MM-DD.dump
   ```

3. 将对应日期的 `assets/` 对象恢复到临时桶，使用临时 `DATABASE_URL` 和 `STORAGE_*` 启动应用。
4. 检查管理员登录、分类/汽车数量、许可证关联、一个 GLB/图片/音频下载以及公开页面回退图。
5. 对照备份校验和抽查 `AssetObject.checksumSha256`，确认对象内容未被替换。

恢复演练至少每季度完成一次，并记录日期、备份版本、恢复耗时和发现的问题。生产恢复前先暂停写入，恢复后重新运行 `npm run db:deploy` 并执行完整测试。
