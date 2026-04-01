// IVD知识助手 API - 带砖家审核功能

const knowledgeData = [
{关键词:['加样臂','干涉','挡片'],分类:'结构设计',模块:'加样臂模块B',原因:'结构干涉',临时:'自行加工处理',永久:'结构修改图纸',部门:'结构'},
{关键词:['加样臂','晃动','针头'],分类:'结构设计',模块:'加样臂模块A',原因:'间隙过大',临时:'先使用',永久:'改小间隙',部门:'结构'},
{关键词:['加样针','歪斜','同心度'],分类:'工艺',模块:'加样臂模块A',原因:'来料同心度问题',临时:'自行调节',永久:'设计检验治具',部门:'工艺'},
{关键词:['加样臂','接地','排线'],分类:'结构设计',模块:'加样臂模块A',原因:'未做地线固定',临时:'自行调节',永久:'修改图纸',部门:'结构'},
{关键词:['加样臂','排线','交叉'],分类:'电子设计',模块:'加样臂模块A',原因:'端子位置需对调',临时:'先使用',永久:'修改PCBA',部门:'电子'},
{关键词:['抓手','电机','端子'],分类:'结构设计',模块:'抓手臂模块',原因:'PCB与电机间距过小',临时:'先插端子在锁板',永久:'增加间距',部门:'电子、结构'},
{关键词:['抓手','气管','磨损'],分类:'结构设计',模块:'抓手臂模块',原因:'未考虑线束导向',临时:'用扎带固定',永久:'贴醋酸胶布固定',部门:'结构'},
{关键词:['泵盒','固定板','孔加工'],分类:'来料不良',模块:'泵盒模块',原因:'来料不良',临时:'自行加工',永久:'来料检查',部门:'IQC'},
{关键词:['泵盒','压力','安装孔'],分类:'结构设计',模块:'泵盒模块',原因:'设计错误',临时:'自行加工',永久:'修改图纸',部门:'结构'},
{关键词:['试剂仓','轨道','螺丝'],分类:'结构设计',模块:'试剂仓模块',原因:'螺丝孔过多',临时:'暂时使用',永久:'减少螺丝',部门:'结构'},
{关键词:['试剂仓','门','关不上'],分类:'结构设计',模块:'整机框架模块',原因:'有干涉摩擦',临时:'自行调节',永久:'优化结构',部门:'结构'},
{关键词:['盖玻片','Z轴','螺母'],分类:'结构设计',模块:'盖玻片分离模块',原因:'电机丝杆自锁',临时:'-',永久:'修改锁紧方式',部门:'结构'},
{关键词:['样本轨道','阻拦','来料'],分类:'来料不良',模块:'样本轨道模块',原因:'来料不良',临时:'退料处理',永久:'来料检查',部门:'IQC'},
{关键词:['样本轨道','安装板','螺纹孔'],分类:'结构设计',模块:'样本轨道模块',原因:'图纸漏标注',临时:'自行加工',永久:'修改图纸',部门:'结构'},
{关键词:['稀释板','运输','干涉'],分类:'结构设计',模块:'稀释板运输模块',原因:'间隙过小',临时:'-',永久:'加大避空',部门:'结构'},
{关键词:['框架','导轨','生锈'],分类:'来料不良',模块:'整机框架模块',原因:'未做表面处理',临时:'除锈剂处理',永久:'图纸标注',部门:'采购、结构'},
{关键词:['框架','外壳','缝隙'],分类:'结构设计',模块:'整机框架模块',原因:'加工误差',临时:'先使用',永久:'新版已修改',部门:'结构'},
{关键词:['显示器','信号线','短'],分类:'电子设计',模块:'整机框架模块',原因:'走线问题',临时:'先使用',永久:'改走线',部门:'工艺'},
{关键词:['泵','Z向','滑块'],分类:'结构设计',模块:'加样臂模块B',原因:'结构未做避让',临时:'暂时使用',永久:'结构修改图纸',部门:'结构'}
];

function search(q) {
var qLower = q.toLowerCase();
var results = [];
knowledgeData.forEach(function(item) {
var matchCount = 0;
item.关键词.forEach(function(keyword) {
if (qLower.includes(keyword)) matchCount++;
});
if (matchCount >= 1) results.push({item: item, score: matchCount});
});
results.sort(function(a, b) { return b.score - a.score; });
return results.map(function(r) { return r.item; });
}

function format(r) {
var s = '🔍 故障查询结果\n━━━━━━━━━━━━━━━━\n';
if (r.分类) s += '📋 分类：' + r.分类 + '\n';
if (r.模块) s += '📦 模块：' + r.模块 + '\n';
if (r.原因) s += '🔍 原因：' + r.原因 + '\n';
s += '🔧 处理：';
if (r.临时 && r.临时 !== '-') s += '临时-' + r.临时 + '; ';
if (r.永久) s += '永久-' + r.永久;
s += '\n';
if (r.部门) s += '🏢 部门：' + r.部门 + '\n';
s += '━━━━━━━━━━━━━━━━';
return s;
}

module.exports = async function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({error: 'Method not allowed'});

    try {
        const {question} = req.body;
        if (!question || !question.trim()) {
            return res.json({success: false, message: '问题不能为空'});
        }

        console.log('[提问]', question);
        const results = search(question);

        if (results.length > 0) {
            // 知识库有结果
            res.json({
                success: true,
                question: question,
                answer: format(results[0]),
                count: results.length,
                source: 'knowledge',
                timestamp: new Date().toISOString()
            });
        } else {
            // 知识库无结果 - 需要砖家审核
            res.json({
                success: true,
                question: question,
                answer: '⏳ 您的问题正在提交给砖家审核，请稍候...\n\n📝 问题已记录：' + question + '\n\n💡 如需紧急帮助，请直接在飞书联系砖家',
                count: 0,
                source: 'pending',
                needExpert: true,
                timestamp: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error('[API错误]', error);
        res.status(500).json({success: false, message: '服务器错误', error: error.message});
    }
};
