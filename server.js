const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// 数据库路径
const DB_PATH = path.join(__dirname, 'db.json');

// 初始化数据库
if (!fs.existsSync(DB_PATH)) {
    const defaultData = {
        softwares: [
            { id: "1", name: "Creative Cloud", category: "Adobe系列", os: ["Windows","Mac"], version: "最新版", description: "Adobe Creative Cloud 桌面应用", icon: "fa-cloud-download-alt", url: "https://creativecloud.adobe.com/apps/download/creative-cloud", noVerify: true },
            { id: "2", name: "Photoshop", category: "Adobe系列", os: ["Windows","Mac"], version: "CS6-2026", description: "专业图像编辑", icon: "fa-image", url: "https://p0lcr45sc1m.feishu.cn/wiki/HHRRw8Cspib8CXk0xj9cHQQWnOc?from=from_copylink", noVerify: false },
            { id: "3", name: "Illustrator", category: "Adobe系列", os: ["Windows","Mac"], version: "CS6-2026", description: "矢量图形设计", icon: "fa-paint-brush", url: "https://p0lcr45sc1m.feishu.cn/docx/CTGEd8BkFowM8CxsM7McEm2Cnsf", noVerify: false },
            { id: "4", name: "Lightroom", category: "Adobe系列", os: ["Windows","Mac"], version: "CS6-2026", description: "摄影后期调色", icon: "fa-camera", url: "https://p0lcr45sc1m.feishu.cn/docx/RBrkdSt8OoEjCyxFo5UcnecJn8J?from=from_copylink", noVerify: false },
            { id: "5", name: "After Effects", category: "Adobe系列", os: ["Windows","Mac"], version: "CS6-2026", description: "视觉特效", icon: "fa-video", url: "https://p0lcr45sc1m.feishu.cn/docx/JNK7dEiZ2oN4UJxPSvUcyZbMnWg", noVerify: false },
            { id: "6", name: "Premiere Pro", category: "Adobe系列", os: ["Windows","Mac"], version: "CS6-2026", description: "专业视频剪辑", icon: "fa-film", url: "https://p0lcr45sc1m.feishu.cn/docx/OP8VdvI69ocLHDxIlfEcYBFJnzd", noVerify: false },
            { id: "7", name: "AutoCAD", category: "Autodesk系列", os: ["Windows","Mac"], version: "2025", description: "计算机辅助设计", icon: "fa-cube", url: "https://www.yuque.com/islandgg13/tdg1oz/lbt43ghrvznz0329?singleDoc#", noVerify: false },
            { id: "8", name: "3ds Max", category: "Autodesk系列", os: ["Windows"], version: "2025", description: "三维建模与渲染", icon: "fa-cubes", url: "https://v6fsd03qf7.feishu.cn/drive/folder/OXY9fBtWqlWSptdr059c0dvZnFg", noVerify: false },
            { id: "9", name: "Maya", category: "Autodesk系列", os: ["Windows","Mac"], version: "2026", description: "三维动画与特效", icon: "fa-shapes", url: "https://www.yuque.com/islandgg13/tdg1oz/wfkwhi?", noVerify: false },
            { id: "10", name: "Cinema 4D", category: "Cinema 4D", os: ["Windows","Mac"], version: "R19-2025", description: "三维建模与动画", icon: "fa-cube", url: "https://www.yuque.com/islandgg13/tdg1oz/vyh4pi?", noVerify: false },
            { id: "11", name: "草图大师", category: "草图大师", os: ["Windows","Mac"], version: "2015-2026", description: "建筑设计", icon: "fa-drafting-compass", url: "https://www.yuque.com/islandgg13/tdg1oz/sicdf3?", noVerify: false },
            { id: "12", name: "犀牛 Rhino (Win)", category: "犀牛软件", os: ["Windows"], version: "5.0-8.28", description: "工业设计", icon: "fa-ruler-combined", url: "https://www.yuque.com/islandgg13/tdg1oz/hxmtbq?", noVerify: false },
            { id: "13", name: "犀牛 Rhino (Mac)", category: "犀牛软件", os: ["Mac"], version: "5.0-8.21", description: "工业设计", icon: "fa-ruler-combined", url: "https://www.yuque.com/islandgg13/tdg1oz/hq0syy?", noVerify: false },
            { id: "14", name: "Adobe 插件全套", category: "插件工具", os: ["Windows","Mac"], version: "2026", description: "支持2026最新版软件，购买注册码请联系客服", icon: "fa-puzzle-piece", url: "https://pan.baidu.com/s/1TEp8VSfZcCNgV6DBVUJTvA?pwd=8888", noVerify: true }
        ]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData, null, 2));
}

function readDb() {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}
function writeDb(data) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

app.use(cors());
app.use(express.json());

// 显式提供静态页面路由（必须放在静态中间件之前）
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});
app.get('/download.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'download.html'));
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'download.html'));
});

// 静态文件中间件（用于提供其他资源，但已被上述路由覆盖）
app.use(express.static(path.join(__dirname, 'public')));

// 健康检查
app.get('/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

// API 路由
app.get('/api/softwares', (req, res) => {
    res.json(readDb().softwares);
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

// 启动服务器
app.listen(PORT, () => {
    console.log(`✅ 服务器运行在端口 ${PORT}`);
});
