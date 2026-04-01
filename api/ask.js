// 简化的API，不依赖其他模块

// 知识库数据
const knowledgeData = [
{分类:'结构设计',模块:'加样臂模块B',原因:'结构干涉',临时:'自行加工处理',永久:'结构修改图纸',部门:'结构'},
{分类:'结构设计',模块:'加样臂模块B',原因:'结构未做避让',临时:'暂时使用',永久:'结构修改图纸',部门:'结构'},
{分类:'来料不良',模块:'样本轨道模块',原因:'来料不良',临时:'退料处理',永久:'来料检查',部门:'IQC'},
{分类:'结构设计',模块:'样本轨道模块',原因:'图纸漏标注',临时:'自行加工',永久:'修改图纸',部门:'结构'},
{分类:'来料不良',模块:'泵盒模块',原因:'来料不良',临时:'自行加工',永久:'来料检查',部门:'IQC'},
{分类:'结构设计',模块:'泵盒模块',原因:'设计错误',临时:'自行加工',永久:'修改图纸',部门:'结构'},
{分类:'结构设计',模块:'抓手臂模块',原因:'PCB与电机间距过小',临时:'先插端子在锁板',永久:'增加间距',部门:'电子、结构'},
{分类:'结构设计',模块:'抓手臂模块',原因:'未考虑线束导向',临时:'用扎带固定',永久:'贴醋酸胶布固定',部门:'结构'},
{分类:'结构设计',模块:'试剂仓模块',原因:'螺丝孔过多',临时:'暂时使用',永久:'减少螺丝',部门:'结构'},
{分类:'结构设计',模块:'盖玻片分离模块',原因:'电机丝杆自锁',临时:'-',永久:'修改锁紧方式',部门:'结构'},
{分类:'工艺',模块:'加样臂模块A',原因:'来料同心度问题',临时:'自行调节',永久:'设计检验治具',部门:'工艺'},
{分类:'结构设计',模块:'加样臂模块A',原因:'未做地线固定',临时:'自行调节',永久:'修改图纸',部门:'结构'},
{分类:'电子设计',模块:'加样臂模块A',原因:'端子位置需对调',临时:'先使用',永久:'修改PCBA',部门:'电子'},
{分类:'电子设计',模块:'整机框架模块',原因:'走线问题',临时:'先使用',永久:'改走线',部门:'工艺'},
{分类:'结构设计',模块:'整机框架模块',原因:'加工误差',临时:'先使用',永久:'新版已修改',部门:'结构'},
{分类:'来料不良',模块:'整机框架模块',原因:'未做表面处理',临时:'除锈剂处理',永久:'图纸标注',部门:'采购、结构'},
{分类:'结构设计',模块:'稀释板运输模块',原因:'间隙过小',临时:'-',永久:'加大避空',部门:'结构'},
{分类:'结构设计',模块:'加样臂模块A',原因:'间隙过大',临时:'先使用',永久:'改小间隙',部门:'结构'},
{分类:'结构设计',模块:'加样臂模块A',原因:'间隙过大',临时:'先使用',永久:'增加限位',部门:'结构'},
{分类:'结构设计',模块:'整机框架模块',原因:'有干涉摩擦',临时:'自行调节',永久:'优化结构',部门:'结构'}
];

function search(q) {
var k = q.toLowerCase();
return knowledgeData.filter(function(r) {
return (k.includes('加样') && r.模块.includes('加样')) ||
       (k.includes('抓手') && r.模块.includes('抓')) ||
       (k.includes('泵') && r.模块.includes('泵')) ||
       (k.includes('试剂') && r.模块.includes('试剂')) ||
       (k.includes('盖玻') && r.模块.includes('盖玻')) ||
       (k.includes('轨道') && r.模块.includes('轨道')) ||
       (k.includes('框架') && r.模块.includes('框架')) ||
       (k.includes('稀释') && r.模块.includes('稀释'));
});
}

function format(r) {
var s = '🔍 故障查询结果\n━━━━━━━━━━━━━━━━\n';
if (r.分类) s += '📋 分类：' + r.分类 + '\n';
if (r.模块) s += '📦 模块：' + r.模块 + '\n';
if (r.原因) s += '🔍 原因：' + r.原因 + '\n';
s += '🔧 处理：临时-' + r.临时 + ' | 永久-' + r.永久 + '\n';
s += '🏢 部门：' + r.部门 + '\n━━━━━━━━━━━━━━━━';
return s;
}

module.exports = async function(req, res) {
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

        const results = search(question);
        let answer;
        if (results.length > 0) {
            answer = format(results[0]);
            if (results.length > 1) answer += '\n📚 相关：' + (results.length - 1) + '条';
        } else {
            answer = '抱歉，未找到匹配结果。\n\n💡 请尝试：加样臂、抓手、泵盒、试剂仓、盖玻片等关键词';
        }

        res.json({ success: true, question, answer, count: results.length, timestamp: new Date().toISOString() });
    } catch (error) {
        res.status(500).json({ success: false, message: '服务器错误', error: error.message });
    }
};
