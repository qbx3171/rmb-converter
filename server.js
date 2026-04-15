const path = require('path');
// 如果存在 Railway Volume 目录，则使用它，否则使用当前目录
const dataDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || __dirname;
const dbPath = path.join(dataDir, 'db.json');
const adapter = new JSONFile(dbPath);
