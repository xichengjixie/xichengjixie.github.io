// Google Analytics - 浏览统计功能
// 需要将 GOOGLE_ANALYTICS_ID 替换为实际的跟踪ID

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

// 创建跟踪器
ga('create', 'GOOGLE_ANALYTICS_ID', 'auto');

// 发送页面浏览
ga('send', 'pageview');

// 跟踪自定义事件
function trackEvent(category, action, label, value) {
    ga('send', 'event', category, action, label, value);
}

// 跟踪上传事件
function trackUpload(type) {
    trackEvent('Upload', type, window.location.pathname);
}

// 跟踪留言事件
function trackComment() {
    trackEvent('Interaction', 'Comment', window.location.pathname);
}

// 跟踪页面停留时间
let startTime = new Date();
window.addEventListener('beforeunload', function() {
    var duration = (new Date() - startTime) / 1000;
    trackEvent('Page Duration', 'seconds', window.location.pathname, Math.round(duration));
});

console.log('📊 Google Analytics已加载');
