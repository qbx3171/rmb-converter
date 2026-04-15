const express = require('express');
const cors = require('cors');
const { Low, JSONFile } = require('lowdb');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const adapter = new JSONFile(path.join(__dirname, 'db.json'));
const db = new Low(adapter);

async function initDb() {
    await db.read();
    db.data ||= { softwares: [] };
    if (db.data.softwares.length === 0) {
        db.data.softwares = [
            { id: "1", name: "Creative Cloud", category: "Adobe系列", os: ["Windows","Mac"], version: "最新版", description: "Adobe Creative Cloud 桌面应用", icon: "fa-cloud-download-alt", url: "https://creativecloud.adobe.com/apps/download/creative-cloud", noVerify: true },
            { id: "2", name: "Photoshop", category: "Adobe系列", os: ["Windows","Mac"], version: "CS6-2026", description: "专业图像编辑", icon: "fa-image", url: "https://p0lcr45sc1m.feishu.cn/wiki/HHRRw8Cspib8CXk0xj9cHQQWnOc?from=from_copylink", noVerify: false },
            // 其他软件数据请根据需要保留，这里省略以简洁，你可以保留之前完整列表
        ];
        await db.write();
    }
}
initDb();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 重要：先定义静态文件中间件，但指定一个前缀路径（可选）
// 为了确保 /admin.html 和 /download.html 能直接访问，我们使用显式路由

// 显式处理 /admin.html
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 显式处理 /download.html
app.get('/download.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'download.html'));
});

// 根路径指向 download.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'download.html'));
});

// 然后才是静态文件中间件（用于提供其他静态资源，如图片、css等）
app.use(express.static(path.join(__dirname, 'public')));

// API 路由
app.get('/api/softwares', async (req, res) => {
    await db.read();
    res.json(db.data.softwares);
});

app.post('/api/verify', (req, res) => {
    const { password } = req.body;
    res.json({ valid: password === 'Win_Mac_123' });
});

const ADMIN_PASSWORD = 'admin123';
function auth(req, res, next) {
    if (req.headers['admin-token'] === ADMIN_PASSWORD) next();
    else res.status(401).json({ error: '未授权' });
}

app.get('/api/admin/softwares', auth, async (req, res) => {
    await db.read();
    res.json(db.data.softwares);
});
app.post('/api/admin/softwares', auth, async (req, res) => {
    const { name, category, os, version, description, icon, url, noVerify } = req.body;
    if (!name || !category || !url) return res.status(400).json({ error: '缺少字段' });
    const newSoftware = { id: uuidv4(), name, category, os: os || ['Windows','Mac'], version: version || '', description: description || '', icon: icon || 'fa-download', url, noVerify: noVerify || false };
    await db.read();
    db.data.softwares.push(newSoftware);
    await db.write();
    res.json(newSoftware);
});
app.put('/api/admin/softwares/:id', auth, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    await db.read();
    const index = db.data.softwares.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ error: '不存在' });
    db.data.softwares[index] = { ...db.data.softwares[index], ...updates };
    await db.write();
    res.json(db.data.softwares[index]);
});
app.delete('/api/admin/softwares/:id', auth, async (req, res) => {
    const { id } = req.params;
    await db.read();
    db.data.softwares = db.data.softwares.filter(s => s.id !== id);
    await db.write();
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`✅ 运行在 http://localhost:${PORT}`));
