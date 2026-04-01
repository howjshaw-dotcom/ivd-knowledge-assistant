/**
 * 增强版回复格式化器
 * 包含本地知识库搜索 + 网络搜索（当本地无结果时）
 */

const { miaodaWebSearch } = require('./web-search-api');

/**
 * 格式化回复（增强版）
 * @param {string} query - 用户原始问题
 * @param {Array} localResults - 本地知识库搜索结果
 * @returns {Promise<string>} 格式化后的回复文本
 */
async function formatEnhancedReply(query, localResults) {
    // 如果有本地结果，使用本地结果
    if (localResults && localResults.length > 0) {
        return formatLocalReply(query, localResults);
    }

    // 本地无结果，进行网络搜索
    console.log(`[增强回复] 本地无结果，启动网络搜索: "${query}"`);
    return await searchAndFormatOnline(query);
}

/**
 * 格式化本地知识库回复
 */
function formatLocalReply(query, results) {
    const mainResult = results[0];

    let reply = `🔍 **故障查询结果**\n`;
    reply += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (mainResult.异常分类) {
        reply += `📋 **【问题分类】**\n${mainResult.异常分类}\n\n`;
    }
    if (mainResult.模块) {
        reply += `📦 **【涉及模块】**\n${mainResult.模块}\n\n`;
    }
    if (mainResult.根本原因) {
        reply += `🔍 **【根本原因】**\n${mainResult.根本原因}\n\n`;
    }

    reply += `🔧 **【处理措施】**\n`;
    if (mainResult.临时措施) {
        reply += `• 临时：${mainResult.临时措施}\n`;
    }
    if (mainResult.永久措施) {
        reply += `• 永久：${mainResult.永久措施}\n`;
    }
    if (!mainResult.临时措施 && !mainResult.永久措施) {
        reply += `暂无记录\n`;
    }
    reply += '\n';

    if (mainResult.责任部门) {
        reply += `🏢 **【责任部门】** ${mainResult.责任部门}\n\n`;
    }

    if (results.length > 1) {
        reply += `📚 **【相关记录】**（共${results.length}条）\n`;
        results.slice(1, 4).forEach((r, i) => {
            const desc = r.异常描述?.substring(0, 40) || '无描述';
            reply += `${i + 1}. ${desc}${desc.length >= 40 ? '...' : ''}\n`;
        });
        if (results.length > 4) {
            reply += `   ...还有 ${results.length - 4} 条\n`;
        }
        reply += '\n';
    }

    reply += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    reply += `💡 如需进一步帮助，请联系砖家（IVD技术专家）`;

    return reply;
}

/**
 * 搜索并整理网络信息
 */
async function searchAndFormatOnline(query) {
    try {
        // 构建搜索关键词
        const searchKeywords = buildSearchKeywords(query);

        // 执行网络搜索
        const searchResults = await miaodaWebSearch(searchKeywords);

        if (!searchResults || searchResults.length === 0) {
            return noMatchResponse(query);
        }

        // 分析和整理搜索结果
        const analysis = analyzeSearchResults(searchResults, query);

        // 格式化回复
        return formatOnlineReply(query, analysis);

    } catch (error) {
        console.error('[网络搜索失败]', error);
        return noMatchResponse(query);
    }
}

/**
 * 构建搜索关键词
 */
function buildSearchKeywords(query) {
    // 提取关键术语
    const keywords = [];

    // IVD相关术语
    const ivdTerms = ['IVD', '体外诊断', '化学发光', '免疫分析', '故障', '问题', '解决'];
    const deviceTerms = ['加样臂', '抓手', '泵盒', '试剂仓', '样本针', '盖玻片', '干涉', '漏液', '歪斜'];

    // 原始查询
    keywords.push(query);

    // 添加相关术语
    deviceTerms.forEach(term => {
        if (query.includes(term)) {
            keywords.push(term);
        }
    });

    // 组合搜索词
    const searchStr = keywords.join(' ');
    return `${searchStr} IVD 仪器 故障 解决方案`;
}

/**
 * 分析搜索结果
 */
function analyzeSearchResults(results, query) {
    const analysis = {
        sources: [],
        solutions: [],
        manufacturers: new Set(),
        confidence: 'low'
    };

    // 遍历搜索结果
    results.forEach(result => {
        const title = result.title || '';
        const snippet = result.snippet || '';
        const url = result.url || '';

        // 提取厂家信息
        const manufacturers = ['罗氏', '雅培', '西门子', '迈瑞', '新产业', '安图', '迈克', '透景'];
        manufacturers.forEach(m => {
            if (title.includes(m) || snippet.includes(m)) {
                analysis.manufacturers.add(m);
            }
        });

        // 提取解决方案关键词
        if (snippet.includes('解决') || snippet.includes('处理') || snippet.includes('维修')) {
            analysis.solutions.push({
                title: title.substring(0, 100),
                snippet: snippet.substring(0, 200),
                url: url
            });
        }

        // 记录来源
        if (url) {
            analysis.sources.push({
                title: title,
                url: url
            });
        }
    });

    // 评估可信度
    if (analysis.solutions.length >= 3) {
        analysis.confidence = 'high';
    } else if (analysis.solutions.length >= 1) {
        analysis.confidence = 'medium';
    }

    return analysis;
}

/**
 * 格式化网络搜索回复
 */
function formatOnlineReply(query, analysis) {
    let reply = `🌐 **网络搜索结果**\n`;
    reply += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    reply += `🔍 **您的问题**：${query}\n\n`;

    if (analysis.manufacturers.size > 0) {
        reply += `🏭 **相关厂家**：${Array.from(analysis.manufacturers).join('、')}\n\n`;
    }

    if (analysis.solutions.length > 0) {
        reply += `💡 **网络解决方案**（来自${analysis.solutions.length}条结果）\n\n`;

        analysis.solutions.slice(0, 3).forEach((sol, i) => {
            reply += `${i + 1}. **${sol.title}**\n`;
            if (sol.snippet) {
                reply += `   ${sol.snippet}\n`;
            }
            if (sol.url) {
                reply += `   🔗 [查看原文](${sol.url})\n`;
            }
            reply += '\n';
        });

        if (analysis.solutions.length > 3) {
            reply += `📑 还有 ${analysis.solutions.length - 3} 条相关结果\n\n`;
        }
    } else {
        reply += `⚠️ 未找到直接相关的解决方案\n\n`;
    }

    if (analysis.sources.length > 0) {
        reply += `📚 **参考来源**（${analysis.sources.length}个）\n`;
        analysis.sources.slice(0, 2).forEach((src, i) => {
            reply += `${i + 1}. ${src.title}\n`;
        });
        reply += '\n';
    }

    reply += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    reply += `📌 **说明**：以上结果来自网络搜索，仅供参考。\n`;
    reply += `💡 如需专业支持，请联系砖家（IVD技术专家）`;

    return reply;
}

/**
 * 未匹配到结果时的回复（本地+网络都无结果）
 */
function noMatchResponse(query) {
    return `🔍 **未找到匹配结果**

抱歉，本地知识库和网络搜索均未找到与"**${query}**"直接相关的故障记录。

💡 **建议**：
• 尝试更简化的关键词（如"加样臂"、"抓手"、"泵盒"）
• 使用模块名称搜索（如"试剂仓"、"盖玻片"）
• 描述故障现象时使用通用术语
• 联系砖家获取专业支持

📊 **当前知识库统计**：
• 本地故障记录：50+ 条
• 覆盖模块：12 个
• 故障分类：50+ 种

🌐 网络搜索已自动启用，稍后重试！`;
}

module.exports = {
    formatEnhancedReply,
    formatLocalReply,
    searchAndFormatOnline,
    buildSearchKeywords,
    analyzeSearchResults,
    formatOnlineReply,
    noMatchResponse
};