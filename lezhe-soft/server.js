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
            { id: "1", name: "Creative Cloud", category: "Adobe系列", os: ["Windows","Mac"], version: "最新版", description: "Adobe Creative Cloud 桌面应用，管理所有Adobe软件订阅。", icon: "fa-cloud-download-alt", url: "https://creativecloud.adobe.com/apps/download/creative-cloud", noVerify: true },
            { id: "2", name: "Photoshop", category: "Adobe系列", os: ["Windows","Mac"], version: "CS6-2026", description: "专业图像编辑与设计。", icon: "fa-image", url: "https://p0lcr45sc1m.feishu.cn/wiki/HHRRw8Cspib8CXk0xj9cHQQWnOc?from=from_copylink", noVerify: false },
            { id: "3", name: "Illustrator", category: "Adobe系列", os: ["Windows","Mac"], version: "CS6-2026", description: "矢量图形设计。", icon: "fa-paint-brush", url: "https://p0lcr45sc1m.feishu.cn/docx/CTGEd8BkFowM8CxsM7McEm2Cnsf", noVerify: false },
            { id: "4", name: "Lightroom", category: "Adobe系列", os: ["Windows","Mac"], version: "CS6-2026", description: "摄影后期调色与管理。", icon: "fa-camera", url: "https://p0lcr45sc1m.feishu.cn/docx/RBrkdSt8OoEjCyxFo5UcnecJn8J?from=from_copylink", noVerify: false },
            { id: "5", name: "After Effects", category: "Adobe系列", os: ["Windows","Mac"], version: "CS6-2026", description: "视觉特效与动态图形。", icon: "fa-video", url: "https://p0lcr45sc1m.feishu.cn/docx/JNK7dEiZ2oN4UJxPSvUcyZbMnWg", noVerify: false },
            { id: "6", name: "Premiere Pro", category: "Adobe系列", os: ["Windows","Mac"], version: "CS6-2026", description: "专业视频剪辑。", icon: "fa-film", url: "https://p0lcr45sc1m.feishu.cn/docx/OP8VdvI69ocLHDxIlfEcYBFJnzd", noVerify: false },
            { id: "7", name: "AutoCAD", category: "Autodesk系列", os: ["Windows","Mac"], version: "2025", description: "计算机辅助设计。", icon: "fa-cube", url: "https://www.yuque.com/islandgg13/tdg1oz/lbt43ghrvznz0329?singleDoc#", noVerify: false },
            { id: "8", name: "3ds Max", category: "Autodesk系列", os: ["Windows"], version: "2025", description: "专业三维建模与渲染。", icon: "fa-cubes", url: "https://v6fsd03qf7.feishu.cn/drive/folder/OXY9fBtWqlWSptdr059c0dvZnFg", noVerify: false },
            { id: "9", name: "Maya", category: "Autodesk系列", os: ["Windows","Mac"], version: "2026", description: "三维动画与特效。", icon: "fa-shapes", url: "https://www.yuque.com/islandgg13/tdg1oz/wfkwhi?", noVerify: false },
            { id: "10", name: "Cinema 4D", category: "Cinema 4D", os: ["Windows","Mac"], version: "R19-2025", description: "三维建模与动画。", icon: "fa-cube", url: "https://www.yuque.com/islandgg13/tdg1oz/vyh4pi?", noVerify: false },
            { id: "11", name: "草图大师", category: "草图大师", os: ["Windows","Mac"], version: "2015-2026", description: "建筑设计、室内设计。", icon: "fa-drafting-compass", url: "https://www.yuque.com/islandgg13/tdg1oz/sicdf3?", noVerify: false },
            { id: "12", name: "犀牛 Rhino (Win)", category: "犀牛软件", os: ["Windows"], version: "5.0-8.28", description: "工业与建筑设计。", icon: "fa-ruler-combined", url: "https://www.yuque.com/islandgg13/tdg1oz/hxmtbq?", noVerify: false },
            { id: "13", name: "犀牛 Rhino (Mac)", category: "犀牛软件", os: ["Mac"], version: "5.0-8.21", description: "工业与建筑设计（Mac版）。", icon: "fa-ruler-combined", url: "https://www.yuque.com/islandgg13/tdg1oz/hq0syy?", noVerify: false },
            { id: "14", name: "Adobe 插件全套", category: "插件工具", os: ["Windows","Mac"], version: "2026", description: "支持2026最新版软件，购买注册码请联系客服。", icon: "fa-puzzle-piece", url: "https://pan.baidu.com/s/1TEp8VSfZcCNgV6DBVUJTvA?pwd=8888", noVerify: true }
        ];
        await db.write();
    }
    await db.write();
}
initDb();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 显式提供 admin.html
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// 显式提供 download.html（可选，但推荐）
app.get('/download.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'download.html'));
});

// 获取所有软件
app.get('/api/softwares', async (req, res) => {
    await db.read();
    res.json(db.data.softwares);
});

// 验证口令
app.post('/api/verify', (req, res) => {
    const { password } = req.body;
    res.json({ valid: password === 'Win_Mac_123' });
});

// 后台管理 API（简单密码保护）
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

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'download.html')));
app.listen(PORT, () => console.log(`✅ 运行在 http://localhost:${PORT}`));
