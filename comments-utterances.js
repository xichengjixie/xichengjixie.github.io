// 使用utterances实现跨设备留言功能
// 这是一个完全免费的GitHub Issues评论系统，无需配置

function loadUtterances() {
    // 检查是否已经加载
    if (document.querySelector('.utterances')) {
        return;
    }

    // 创建utterances容器
    const utterancesDiv = document.createElement('div');
    utterancesDiv.className = 'utterances';
    utterancesDiv.style.cssText = `
        max-width: 800px;
        margin: 40px auto;
        padding: 20px;
        background: rgba(0, 0, 0, 0.3);
        border: 2px solid rgba(0, 255, 255, 0.3);
        border-radius: 15px;
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.2);
    `;

    // 添加标题
    const title = document.createElement('h3');
    title.textContent = '💬 留言讨论区';
    title.style.cssText = `
        color: #00ffff;
        text-align: center;
        margin-bottom: 20px;
        text-shadow: 0 0 10px #00ffff;
        font-size: 1.5em;
    `;
    utterancesDiv.appendChild(title);

    // 获取当前页面ID
    const pageId = window.location.pathname.split('/').pop() || 'index';
    
    // 创建utterances脚本
    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.setAttribute('repo', 'xichengjixie/xichengjixie.github.io');
    script.setAttribute('issue-term', `pathname:${pageId}`);
    script.setAttribute('theme', 'photon-dark');
    script.setAttribute('crossorigin', 'anonymous');
    script.async = true;

    utterancesDiv.appendChild(script);

    // 找到评论容器并插入
    const commentContainer = document.getElementById('comments-container');
    if (commentContainer) {
        commentContainer.innerHTML = '';
        commentContainer.appendChild(utterancesDiv);
    } else {
        // 如果没有容器，找到主要内容区域后插入
        const mainContent = document.querySelector('main') || document.body;
        mainContent.appendChild(utterancesDiv);
    }
}

// 页面加载完成后加载评论系统
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadUtterances);
} else {
    loadUtterances();
}