const { knowledgeSearch } = require('../knowledge-local');
const { formatEnhancedReply } = require('../enhanced-reply');

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { question } = req.body;
        if (!question || !question.trim()) {
            return res.json({ success: false, message: '问题不能为空' });
        }

        console.log(`[提问] ${question}`);
        const localResults = await knowledgeSearch(question);
        const answer = await formatEnhancedReply(question, localResults);

        res.json({
            success: true,
            question,
            answer,
            count: localResults.length,
            hasOnlineResults: localResults.length === 0,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[API错误]', error);
        res.status(500).json({ success: false, message: '服务器错误', error: error.message });
    }
};
