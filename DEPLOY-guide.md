# IVD知识助手 - 永久部署指南（Vercel）

## 项目结构

本项目为单页面HTML应用，可直接部署到Vercel。

### 文件说明

- `index.html` - 网页前端（需要后端API）
- `standalone.html` - **离线版单文件**（推荐，双击即可用）
- `server.js` - Node.js后端服务
- `knowledge-local.js` - 本地知识库数据
- `package.json` - 项目配置

---

## 部署到Vercel（免费永久）

### 方式1：通过GitHub部署（推荐）

1. **创建GitHub仓库**
   - 登录 https://github.com
   - 创建新仓库：`ivd-knowledge-assistant`
   - 上传 `standalone.html` 文件

2. **导入Vercel**
   - 打开 https://vercel.com/new
   - 点击 "Import Git Repository"
   - 选择刚创建的仓库

3. **配置部署**
   - Framework Preset: 选 "Other"
   - Build Command: 留空
   - Output Directory: 留空

4. **完成！**
   - Vercel会生成一个永久网址，如：`https://ivd-knowledge-assistant.vercel.app`

---

### 方式2：通过Vercel CLI部署

```bash
# 1. 安装Vercel CLI
npm install -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel

# 4. 生产环境部署
vercel --prod
```

---

### 方式3：托管静态HTML文件

只需将 `standalone.html` 上传到任何静态托管服务：

1. **Vercel**
   - 把 `standalone.html` 拖到 https://vercel.com/drop

2. **Netlify**
   - 把文件拖到 https://app.netlify.com/drop

3. **GitHub Pages**
   - 上传到仓库的 `docs` 文件夹
   - 开启 Pages 功能

---

## 本地运行

### 方式1：直接打开HTML文件（最简单）

双击 `standalone.html` 文件，用浏览器打开即可使用。

### 方式2：运行本地服务器

```bash
# 安装依赖
npm install

# 启动服务
node server.js

# 访问地址
# http://localhost:3000
```

---

## 更新知识库

知识库数据在 `knowledge-local.js` 文件中，可直接编辑添加更多故障记录。

格式：
```javascript
{
    id: '001',
    异常描述: '故障描述',
    异常分类: '分类',
    模块: '所属模块',
    根本原因: '原因分析',
    临时措施: '临时解决方案',
    永久措施: '永久解决方案',
    责任部门: '责任部门'
}
```

---

## 故障排查

### 问题1：打开页面空白
- 检查浏览器控制台是否有JS错误
- 确认文件编码为UTF-8

### 问题2：搜索无结果
- 检查知识库是否有对应关键词
- 尝试使用更简短的关键词

### 问题3：样式显示异常
- 确认网络正常（加载字体）
- 尝试使用Chrome/Edge浏览器

---

*最后更新：2026-04-01*