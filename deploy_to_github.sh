#!/bin/bash
# 科幻空间网站 - GitHub Pages 部署脚本

echo "🚀 开始部署科幻空间网站到 GitHub Pages..."
echo ""

# 检查git是否已安装
if ! command -v git &> /dev/null; then
    echo "❌ Git 未安装，请先安装 Git"
    exit 1
fi

# 检查是否已配置git
if ! git config user.name > /dev/null 2>&1; then
    echo "⚠️  Git 用户名未配置"
    read -p "请输入你的 GitHub 用户名: " github_username
    git config --global user.name "$github_username"
fi

if ! git config user.email > /dev/null 2>&1; then
    echo "⚠️  Git 邮箱未配置"
    read -p "请输入你的 GitHub 邮箱: " github_email
    git config --global user.email "$github_email"
fi

echo ""
echo "📋 当前 Git 配置:"
echo "   用户名: $(git config user.name)"
echo "   邮箱: $(git config user.email)"
echo ""

# 询问GitHub用户名
read -p "请输入你的 GitHub 用户名（用于生成仓库地址）: " github_username

# 仓库名称
repo_name="${github_username}.github.io"

echo ""
echo "📦 将创建仓库: $repo_name"
echo "🌐 访问地址将是: https://$repo_name"
echo ""

# 询问是否继续
read -p "是否继续？(y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "❌ 已取消部署"
    exit 0
fi

# 检查是否已添加远程仓库
if git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  已存在远程仓库 origin"
    read -p "是否要更新远程仓库地址？(y/n): " update_remote
    if [ "$update_remote" = "y" ]; then
        git remote remove origin
    else
        echo "⚠️  跳过远程仓库配置"
    fi
fi

# 添加远程仓库
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 添加远程仓库..."
    git remote add origin "https://github.com/$github_username/$repo_name.git"
    echo "✅ 远程仓库已添加"
fi

echo ""
echo "📋 下一步操作："
echo ""
echo "1️⃣  打开浏览器，访问: https://github.com/new"
echo "2️⃣  仓库名称输入: $repo_name"
echo "3️⃣  选择 'Public'（公开）"
echo "4️⃣  点击 'Create repository'"
echo ""
echo "📋 创建仓库后，运行以下命令推送代码："
echo ""
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "📋 推送成功后，启用 GitHub Pages："
echo ""
echo "1️⃣  访问仓库: https://github.com/$github_username/$repo_name"
echo "2️⃣  点击 'Settings'（设置）"
echo "3️⃣  点击左侧 'Pages'（页面）"
echo "4️⃣  在 'Build and deployment' 下选择 'Source' 为 'Deploy from a branch'"
echo "5️⃣  'Branch' 选择 'main'，文件夹选择 '/ (root)'"
echo "6️⃣  点击 'Save'"
echo ""
echo "🎉 等待1-2分钟，访问: https://$repo_name"
echo ""
echo "📝 部署脚本完成！"