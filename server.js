const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

const DB_PATH = path.join(__dirname, 'db.json');

function initDb() {
    if (!fs.existsSync(DB_PATH)) {
        const defaultData = {
            softwares: [
                { id: "1", name: "Creative Cloud", category: "Adobe系列", os: ["Windows","Mac"], version: "最新版", description: "Adobe Creative Cloud 桌面应用", icon: "fa-cloud-download-alt", url: "https://creativecloud.adobe.com/apps/download/creative-cloud", noVerify: true },
                { id: "2", name: "Photoshop", category: "Adobe系列", os: ["Windows","Mac"], version: "CS6-2026", description: "专业图像编辑", icon: "fa-image", url: "https://p0lcr45sc1m.feishu.cn/wiki/HHRRw8Cspib8CXk0xj9cHQQWnOc?from=from_copylink", noVerify: false }
                // 其他软件数据可以后续在管理后台添加，或手动补全
            ]
        };
        fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
    }
}
initDb();

function readDb() { return JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
function writeDb(data) { fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2)); }

app.use(cors());
app.use(express.json());

// 显式路由（必须在静态中间件之前）
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
app.get('/download.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'download.html'));
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'download.html'));
});

// 静态文件中间件
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.get('/api/softwares', (req, res) => {
    res.json(readDb().softwares);
});
app.post('/api/verify', (req, res) => {
    res.json({ valid: req.body.password === 'Win_Mac_123' });
});

const ADMIN_PASSWORD = 'admin123';
function auth(req, res, next) {
    if (req.headers['admin-token'] === ADMIN_PASSWORD) next();
    else res.status(401).json({ error: '未授权' });
}

app.get('/api/admin/softwares', auth, (req, res) => {
    res.json(readDb().softwares);
});
app.post('/api/admin/softwares', auth, (req, res) => {
    const { name, category, os, version, description, icon, url, noVerify } = req.body;
    if (!name || !category || !url) return res.status(400).json({ error: '缺少字段' });
    const newSoftware = { id: uuidv4(), name, category, os: os || ['Windows','Mac'], version: version || '', description: description || '', icon: icon || 'fa-download', url, noVerify: noVerify || false };
    const db = readDb();
    db.softwares.push(newSoftware);
    writeDb(db);
    res.json(newSoftware);
});
app.put('/api/admin/softwares/:id', auth, (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const db = readDb();
    const index = db.softwares.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ error: '不存在' });
    db.softwares[index] = { ...db.softwares[index], ...updates };
    writeDb(db);
    res.json(db.softwares[index]);
});
app.delete('/api/admin/softwares/:id', auth, (req, res) => {
    const { id } = req.params;
    const db = readDb();
    db.softwares = db.softwares.filter(s => s.id !== id);
    writeDb(db);
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`✅ 运行在 http://localhost:${PORT}`));
