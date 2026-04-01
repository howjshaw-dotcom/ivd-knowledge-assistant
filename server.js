const express = require('express');
const cors = require('cors');
const { knowledgeSearch } = require('./knowledge-local');
const { formatEnhancedReply } = require('./enhanced-reply');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // 托管静态文件

// API路由：提问接口
app.post('/api/ask', async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || question.trim().length === 0) {
            return res.json({
                success: false,
                message: '问题不能为空'
            });
        }

        console.log(`[提问] ${question}`);

        // 1. 先搜索本地知识库
        const localResults = await knowledgeSearch(question);

        // 2. 格式化回复（本地有结果则用本地，无结果则自动网络搜索）
        const answer = await formatEnhancedReply(question, localResults);

        res.json({
            success: true,
            question,
            answer,
            count: localResults.length,
            hasOnlineResults: localResults.length === 0, // 标记是否使用了网络搜索
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('[API错误]', error);
        res.json({
            success: false,
            message: '服务器错误，请稍后重试',
            error: error.message
        });
    }
});

// 健康检查接口
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        time: new Date().toISOString(),
        version: '1.0.0'
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`\n🚀 IVD知识助手服务器已启动`);
    console.log(`📍 本地访问：http://localhost:${PORT}`);
    console.log(`🔗 局域网访问：http://192.168.1.xxx:${PORT} (替换为您的IP)`);
    console.log(`📚 知识库：全自动间接免疫荧光分析仪故障库`);
    console.log(`⏰ 时间：${new Date().toLocaleString()}\n`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n👋 服务器正在关闭...');
    process.exit(0);
});