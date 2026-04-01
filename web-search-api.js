/**
 * 网络搜索API封装
 * 支持多种搜索API：DuckDuckGo、Google Custom Search、Bing Search
 */

const https = require('https');

/**
 * 执行网络搜索
 * @param {string} query - 搜索关键词
 * @returns {Promise<Array>} 搜索结果数组
 */
async function miaodaWebSearch(query) {
    console.log(`[网络搜索] 关键词: "${query}"`);

    // 首先尝试 DuckDuckGo（免费无需API密钥）
    let results = await duckDuckGoSearch(query);

    // 如果 DuckDuckGo 结果不足，尝试 Google Custom Search
    if (results.length < 2 && process.env.GOOGLE_API_KEY && process.env.GOOGLE_CX) {
        console.log('[网络搜索] DuckDuckGo结果不足，尝试Google搜索...');
        results = await googleCustomSearch(query, process.env.GOOGLE_API_KEY, process.env.GOOGLE_CX);
    }

    // 如果仍然没有结果，使用模拟数据
    if (results.length === 0) {
        console.log('[网络搜索] 无结果，使用IVD行业通用信息');
        results = getIVDGeneralInfo(query);
    }

    console.log(`[网络搜索] 共找到 ${results.length} 条结果`);
    return results;
}

/**
 * DuckDuckGo Instant Answer API（免费）
 */
async function duckDuckGoSearch(query) {
    return new Promise((resolve) => {
        const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;

        https.get(url, (res) => {
            let data = '';

            res.on('data', chunk => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(data);

                    const results = [];

                    // 提取RelatedTopics
                    if (json.RelatedTopics) {
                        json.RelatedTopics.forEach(topic => {
                            if (topic.Text && topic.FirstURL) {
                                results.push({
                                    title: topic.Text.split(' - ')[0] || topic.Text,
                                    snippet: topic.Text,
                                    url: topic.FirstURL
                                });
                            }
                        });
                    }

                    // 提取AbstractText（百科摘要）
                    if (json.AbstractText) {
                        results.unshift({
                            title: json.AbstractSource || 'Wikipedia/ encyclopedia',
                            snippet: json.AbstractText,
                            url: json.AbstractURL || ''
                        });
                    }

                    resolve(results.slice(0, 10)); // 最多返回10条结果

                } catch (e) {
                    console.error('[DuckDuckGo解析失败]', e.message);
                    resolve([]);
                }
            });

        }).on('error', (e) => {
            console.error('[DuckDuckGo请求失败]', e.message);
            resolve([]);
        });
    });
}

/**
 * IVD行业通用信息（当搜索API不可用时的后备）
 */
function getIVDGeneralInfo(query) {
    const keywords = query.toLowerCase();

    const info = [];

    // 根据关键词提供相关的IVD行业通用信息
    if (keywords.includes('加样') || keywords.includes('针')) {
        info.push({
            title: '加样针/加样臂常见问题处理',
            snippet: '加样针常见问题包括：1) 堵孔-检查针是否弯曲或污染；2) 漏液-检查密封圈是否完好；3) 干涉-检查机械结构间隙；4) 歪斜-检查安装同心度。建议定期保养和校准。',
            url: ''
        });
    }

    if (keywords.includes('泵') || keywords.includes('漏液')) {
        info.push({
            title: '泵类模块故障处理',
            snippet: '隔膜泵/蠕动泵常见问题：1) 漏液-检查管路连接和密封；2) 流量不足-检查泵管老化情况；3) 异响-检查泵头螺丝松动。建议使用原厂配件。',
            url: ''
        });
    }

    if (keywords.includes('抓手') || keywords.includes('夹')) {
        info.push({
            title: '抓手/夹具模块维护',
            snippet: '抓手模块常见问题：1) 抓取不稳-检查传感器和位置；2) 动作延迟-检查气缸和电磁阀；3) 干涉-检查PCB与电机间距。',
            url: ''
        });
    }

    if (keywords.includes('试剂') || keywords.includes('仓')) {
        info.push({
            title: '试剂仓模块维护',
            snippet: '试剂仓常见问题：1) 温度异常-检查温控模块；2) 试剂识别错误-检查条码扫描器；3) 门关不上-检查机械结构和传感器。',
            url: ''
        });
    }

    if (keywords.includes('干涉') || keywords.includes('装配')) {
        info.push({
            title: '结构干涉问题处理',
            snippet: '结构干涉处理原则：1) 确认干涉点位置；2) 测量实际间隙；3) 评估是否需要改图；4) 临时处理（打磨/垫片）+ 永久方案（图纸修改）。',
            url: ''
        });
    }

    // 如果没有匹配的信息，提供通用建议
    if (info.length === 0) {
        info.push({
            title: 'IVD仪器故障排查建议',
            snippet: '针对IVD仪器故障，建议：1) 记录故障现象和发生条件；2) 查看设备日志和报警代码；3) 检查相关机械、电气部件；4) 咨询厂家技术支持；5) 查阅设备维护手册。',
            url: ''
        });
    }

    return info;
}

/**
 * 使用 Google Custom Search API（需要API密钥）
 */
async function googleCustomSearch(query, apiKey, cx) {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items) {
            return data.items.map(item => ({
                title: item.title,
                snippet: item.snippet,
                url: item.link
            }));
        }

        return [];
    } catch (error) {
        console.error('[Google搜索失败]', error);
        return [];
    }
}

/**
 * 使用 Bing Search API（需要API密钥）
 */
async function bingSearch(query, apiKey) {
    const url = `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url, {
            headers: {
                'Ocp-Apim-Subscription-Key': apiKey
            }
        });
        const data = await response.json();

        if (data.webPages && data.webPages.value) {
            return data.webPages.value.map(item => ({
                title: item.name,
                snippet: item.snippet,
                url: item.url
            }));
        }

        return [];
    } catch (error) {
        console.error('[Bing搜索失败]', error);
        return [];
    }
}

module.exports = {
    miaodaWebSearch,
    googleCustomSearch,
    bingSearch
};