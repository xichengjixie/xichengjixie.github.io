// 简单的浏览量统计系统（基于本地存储）
// 记录页面访问次数和最近访问时间

class PageViewTracker {
    constructor() {
        this.storageKey = 'tech_space_page_views';
        this.init();
    }

    init() {
        // 记录当前页面访问
        this.recordPageView();
        
        // 显示浏览量统计
        this.displayPageViews();
        
        // 定期更新显示
        setInterval(() => this.displayPageViews(), 5000);
    }

    // 获取当前页面ID
    getCurrentPageId() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html') {
            return 'home';
        }
        return path.replace('.html', '').replace('/', '');
    }

    // 记录页面访问
    recordPageView() {
        const pageId = this.getCurrentPageId();
        const data = this.getPageViewData();
        
        if (!data[pageId]) {
            data[pageId] = {
                count: 0,
                lastVisit: null
            };
        }
        
        data[pageId].count++;
        data[pageId].lastVisit = new Date().toISOString();
        
        // 保存到本地存储
        localStorage.setItem(this.storageKey, JSON.stringify(data));
        
        console.log(`📊 页面访问已记录: ${pageId} (总访问: ${data[pageId].count})`);
    }

    // 获取浏览量数据
    getPageViewData() {
        const data = localStorage.getItem(this.storageKey);
        if (!data) {
            return {};
        }
        return JSON.parse(data);
    }

    // 显示浏览量统计
    displayPageViews() {
        const data = this.getPageViewData();
        const pageId = this.getCurrentPageId();
        const pageData = data[pageId];
        
        // 查找或创建统计显示容器
        let statsContainer = document.getElementById('page-views-stats');
        if (!statsContainer) {
            statsContainer = this.createStatsContainer();
        }
        
        if (pageData) {
            statsContainer.innerHTML = `
                <div class="stats-item">
                    <span class="stats-label">本页浏览</span>
                    <span class="stats-value">${pageData.count}</span>
                </div>
                <div class="stats-item">
                    <span class="stats-label">总页面</span>
                    <span class="stats-value">${Object.keys(data).length}</span>
                </div>
                <div class="stats-item">
                    <span class="stats-label">最后访问</span>
                    <span class="stats-value">${new Date(pageData.lastVisit).toLocaleString()}</span>
                </div>
            `;
        }
    }

    // 创建统计显示容器
    createStatsContainer() {
        const container = document.createElement('div');
        container.id = 'page-views-stats';
        container.className = 'page-views-stats';
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .page-views-stats {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.8);
                border: 1px solid #00ffff;
                border-radius: 10px;
                padding: 15px;
                z-index: 9999;
                min-width: 200px;
                backdrop-filter: blur(10px);
                box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
            }
            
            .stats-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                color: #00ffff;
                font-size: 12px;
            }
            
            .stats-item:last-child {
                margin-bottom: 0;
            }
            
            .stats-label {
                color: #a0a0a0;
            }
            
            .stats-value {
                font-weight: bold;
                font-size: 14px;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(container);
        
        return container;
    }

    // 获取所有页面统计
    getAllPageStats() {
        return this.getPageViewData();
    }

    // 清除统计
    clearStats() {
        localStorage.removeItem(this.storageKey);
        console.log('🗑️ 浏览量统计已清除');
    }
}

// 初始化统计系统
const pageViewTracker = new PageViewTracker();

// 导出到全局
window.PageViewTracker = PageViewTracker;