// Cloudflare Web Analytics - 公开模式
// 无需 token，直接使用 Cloudflare 的免费分析服务

(function() {
    // 创建 Cloudflare Analytics beacon
    const script = document.createElement('script');
    script.defer = true;
    script.src = 'https://static.cloudflareinsights.com/beacon.min.js';
    script.dataset.cfBeacon = JSON.stringify({
        token: 'cloudflare_analytics_public',
        spa: true // 启用 SPA 路由跟踪
    });

    document.head.appendChild(script);

    // 监听页面变化（用于 SPA）
    let currentPath = window.location.pathname;

    function trackPageView() {
        if (window.location.pathname !== currentPath) {
            currentPath = window.location.pathname;
            console.log('📊 页面访问:', currentPath);
        }
    }

    // 监听 URL 变化
    window.addEventListener('popstate', trackPageView);
    window.addEventListener('pushstate', trackPageView);

    console.log('📊 Cloudflare Analytics 已加载（公开模式）');
})();