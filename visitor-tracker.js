// 简单的访客统计系统（基于 localStorage + 可选的服务器同步）
// 统计真实访客数量和页面访问

class VisitorTracker {
    constructor() {
        this.storageKey = 'tech_space_visitor_data';
        this.sessionKey = 'tech_space_session_id';
        this.init();
    }

    init() {
        // 创建或获取会话ID
        this.sessionId = this.getOrCreateSessionId();
        
        // 记录访客信息
        this.recordVisitor();
        
        // 记录页面访问
        this.recordPageView();
        
        // 显示访客统计
        this.displayVisitorStats();
        
        // 定期更新显示
        setInterval(() => this.displayVisitorStats(), 10000);
        
        console.log('📊 访客统计系统已启动');
    }

    // 获取或创建会话ID
    getOrCreateSessionId() {
        let sessionId = sessionStorage.getItem(this.sessionKey);
        if (!sessionId) {
            sessionId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem(this.sessionKey, sessionId);
        }
        return sessionId;
    }

    // 记录访客信息
    recordVisitor() {
        const data = this.getVisitorData();
        const now = new Date().toISOString();
        
        // 更新访客统计
        if (!data.totalVisitors) {
            data.totalVisitors = 0;
        }
        
        // 如果是新会话，增加访客数
        if (!data.sessions) {
            data.sessions = [];
        }
        
        if (!data.sessions.includes(this.sessionId)) {
            data.sessions.push(this.sessionId);
            data.totalVisitors++;
        }
        
        // 记录访问时间
        if (!data.lastVisit) {
            data.lastVisit = now;
        }
        data.lastVisit = now;
        
        // 记录首次访问
        if (!data.firstVisit) {
            data.firstVisit = now;
        }
        
        this.saveVisitorData(data);
    }

    // 记录页面访问
    recordPageView() {
        const pageId = this.getCurrentPageId();
        const data = this.getVisitorData();
        
        if (!data.pageViews) {
            data.pageViews = {};
        }
        
        if (!data.pageViews[pageId]) {
            data.pageViews[pageId] = 0;
        }
        
        data.pageViews[pageId]++;
        data.totalPageViews = (data.totalPageViews || 0) + 1;
        
        // 记录页面访问历史
        if (!data.pageHistory) {
            data.pageHistory = [];
        }
        
        data.pageHistory.push({
            page: pageId,
            time: new Date().toISOString(),
            session: this.sessionId
        });
        
        // 只保留最近100条历史
        if (data.pageHistory.length > 100) {
            data.pageHistory = data.pageHistory.slice(-100);
        }
        
        this.saveVisitorData(data);
        
        console.log(`📄 页面访问: ${pageId}`);
    }

    // 获取当前页面ID
    getCurrentPageId() {
        const path = window.location.pathname;
        if (path === '/' || path === '/index.html' || path.endsWith('/')) {
            return 'home';
        }
        return path.replace('.html', '').replace(/\//g, '');
    }

    // 获取访客数据
    getVisitorData() {
        const data = localStorage.getItem(this.storageKey);
        if (!data) {
            return {};
        }
        return JSON.parse(data);
    }

    // 保存访客数据
    saveVisitorData(data) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
    }

    // 显示访客统计
    displayVisitorStats() {
        const data = this.getVisitorData();
        
        // 查找或创建统计显示容器
        let statsContainer = document.getElementById('visitor-stats');
        if (!statsContainer) {
            statsContainer = this.createStatsContainer();
        }
        
        const pageId = this.getCurrentPageId();
        const pageViews = data.pageViews ? (data.pageViews[pageId] || 0) : 0;
        
        statsContainer.innerHTML = `
            <div class="stats-header">📊 访客统计</div>
            <div class="stats-item">
                <span class="stats-label">总访客</span>
                <span class="stats-value">${data.totalVisitors || 0}</span>
            </div>
            <div class="stats-item">
                <span class="stats-label">总浏览</span>
                <span class="stats-value">${data.totalPageViews || 0}</span>
            </div>
            <div class="stats-item">
                <span class="stats-label">本页浏览</span>
                <span class="stats-value">${pageViews}</span>
            </div>
            <div class="stats-item">
                <span class="stats-label">在线访客</span>
                <span class="stats-value">1</span>
            </div>
        `;
    }

    // 创建统计显示容器
    createStatsContainer() {
        const container = document.createElement('div');
        container.id = 'visitor-stats';
        container.className = 'visitor-stats';
        
        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .visitor-stats {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: rgba(0, 0, 0, 0.9);
                border: 2px solid #00ffff;
                border-radius: 15px;
                padding: 20px;
                z-index: 10000;
                min-width: 220px;
                backdrop-filter: blur(10px);
                box-shadow: 0 0 30px rgba(0, 255, 255, 0.4);
                animation: statsGlow 3s ease-in-out infinite;
            }
            
            @keyframes statsGlow {
                0%, 100% {
                    box-shadow: 0 0 20px rgba(0, 255, 255, 0.3);
                }
                50% {
                    box-shadow: 0 0 40px rgba(0, 255, 255, 0.6);
                }
            }
            
            .stats-header {
                font-size: 16px;
                font-weight: bold;
                color: #00ffff;
                text-align: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(0, 255, 255, 0.3);
            }
            
            .stats-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 12px;
                color: #00ffff;
                font-size: 13px;
            }
            
            .stats-item:last-child {
                margin-bottom: 0;
            }
            
            .stats-label {
                color: #a0a0a0;
            }
            
            .stats-value {
                font-weight: bold;
                font-size: 18px;
                text-shadow: 0 0 10px rgba(0, 255, 255, 0.5);
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(container);
        
        return container;
    }

    // 获取所有统计数据
    getAllStats() {
        return this.getVisitorData();
    }

    // 清除统计
    clearStats() {
        localStorage.removeItem(this.storageKey);
        sessionStorage.removeItem(this.sessionKey);
        console.log('🗑️ 访客统计已清除');
    }

    // 导出统计数据
    exportStats() {
        const data = this.getVisitorData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'visitor_stats_' + new Date().toISOString().split('T')[0] + '.json';
        a.click();
        URL.revokeObjectURL(url);
    }
}

// 初始化访客统计系统
const visitorTracker = new VisitorTracker();

// 导出到全局
window.VisitorTracker = VisitorTracker;