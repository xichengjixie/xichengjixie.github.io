// 用户交互功能模块

// 存储用户数据
class UserInteraction {
    constructor(pageId) {
        this.pageId = pageId;
        this.storageKey = `tech_space_${pageId}_data`;
        this.loadData();
    }

    // 加载数据
    loadData() {
        const stored = localStorage.getItem(this.storageKey);
        this.data = stored ? JSON.parse(stored) : {
            images: [],
            comments: [],
            footprints: []
        };
    }

    // 保存数据
    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }

    // 上传图片
    uploadImage(file, description = '') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageData = {
                    id: Date.now(),
                    type: 'image',
                    dataUrl: e.target.result,
                    description: description,
                    timestamp: new Date().toLocaleString(),
                    userName: this.getUserName()
                };
                this.data.images.unshift(imageData);
                this.saveData();
                this.displayImages();
                this.addFootprint('上传了一张图片');
                resolve(imageData);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // 上传视频
    uploadVideo(file, description = '') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                // 检查视频时长
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.onloadedmetadata = () => {
                    if (video.duration > 15) {
                        alert('视频时长不能超过15秒！');
                        reject(new Error('视频时长超过限制'));
                        return;
                    }
                    const videoData = {
                        id: Date.now(),
                        type: 'video',
                        dataUrl: e.target.result,
                        description: description,
                        duration: video.duration,
                        timestamp: new Date().toLocaleString(),
                        userName: this.getUserName()
                    };
                    this.data.images.unshift(videoData);
                    this.saveData();
                    this.displayImages();
                    this.addFootprint('上传了一个视频');
                    resolve(videoData);
                };
                video.onerror = () => {
                    alert('无法读取视频信息！');
                    reject(new Error('无法读取视频'));
                };
                video.src = URL.createObjectURL(file);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // 添加评论
    addComment(content, userName = '') {
        const comment = {
            id: Date.now(),
            content: content,
            userName: userName || this.getUserName(),
            timestamp: new Date().toLocaleString()
        };
        this.data.comments.unshift(comment);
        this.saveData();
        this.displayComments();
        this.addFootprint('发表了一条评论');
        return comment;
    }

    // 添加足迹
    addFootprint(action) {
        const footprint = {
            id: Date.now(),
            action: action,
            userName: this.getUserName(),
            timestamp: new Date().toLocaleString()
        };
        this.data.footprints.unshift(footprint);
        // 只保留最近50条足迹
        if (this.data.footprints.length > 50) {
            this.data.footprints = this.data.footprints.slice(0, 50);
        }
        this.saveData();
        this.displayFootprints();
    }

    // 获取用户名
    getUserName() {
        let userName = localStorage.getItem('tech_space_username');
        if (!userName) {
            userName = '游客' + Math.floor(Math.random() * 10000);
            localStorage.setItem('tech_space_username', userName);
        }
        return userName;
    }

    // 显示图片
    displayImages() {
        const container = document.getElementById('user-images-container');
        if (!container) return;

        if (this.data.images.length === 0) {
            container.innerHTML = '<p class="empty-message">还没有人上传内容，快来成为第一个吧！</p>';
            return;
        }

        container.innerHTML = this.data.images.map(item => {
            if (item.type === 'video') {
                return `
            <div class="user-image-card" style="background: rgba(0, 255, 255, 0.1); border: 2px solid rgba(0, 255, 255, 0.5); border-radius: 15px; padding: 20px; margin-bottom: 20px; box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);">
                <video src="${item.dataUrl}" controls style="width: 100%; max-height: 300px; border-radius: 10px; margin-bottom: 15px;"></video>
                <div class="image-info">
                    <p class="image-description" style="color: #00ffff; font-weight: 700; margin-bottom: 10px;">${item.description || '用户分享的视频'}</p>
                    <p class="image-meta" style="color: #a0a0a0; font-size: 0.9em;">📹 时长: ${item.duration ? item.duration.toFixed(1) : '未知'}秒 | 上传者：${item.userName} | ${item.timestamp}</p>
                </div>
            </div>
        `;
            } else {
                return `
            <div class="user-image-card" style="background: rgba(0, 255, 255, 0.1); border: 2px solid rgba(0, 255, 255, 0.5); border-radius: 15px; padding: 20px; margin-bottom: 20px; box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);">
                <img src="${item.dataUrl}" alt="用户上传的图片" class="user-image" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 10px; margin-bottom: 15px;">
                <div class="image-info">
                    <p class="image-description" style="color: #00ffff; font-weight: 700; margin-bottom: 10px;">${item.description || '用户分享的图片'}</p>
                    <p class="image-meta" style="color: #a0a0a0; font-size: 0.9em;">📷 上传者：${item.userName} | ${item.timestamp}</p>
                </div>
            </div>
        `;
            }
        }).join('');
    }

    // 显示评论
    displayComments() {
        const container = document.getElementById('user-comments-container');
        if (!container) return;

        if (this.data.comments.length === 0) {
            container.innerHTML = '<p class="empty-message">还没有人发表评论，快来发表你的看法吧！</p>';
            return;
        }

        container.innerHTML = this.data.comments.map(comment => `
            <div class="comment-card">
                <div class="comment-header">
                    <span class="comment-author">${comment.userName}</span>
                    <span class="comment-time">${comment.timestamp}</span>
                </div>
                <div class="comment-content">${comment.content}</div>
            </div>
        `).join('');
    }

    // 显示足迹
    displayFootprints() {
        const container = document.getElementById('user-footprints-container');
        if (!container) return;

        if (this.data.footprints.length === 0) {
            container.innerHTML = '<p class="empty-message">暂无足迹</p>';
            return;
        }

        container.innerHTML = this.data.footprints.map(footprint => `
            <div class="footprint-item">
                <span class="footprint-action">${footprint.action}</span>
                <span class="footprint-user">${footprint.userName}</span>
                <span class="footprint-time">${footprint.timestamp}</span>
            </div>
        `).join('');
    }

    // 初始化所有功能
    initialize() {
        this.displayImages();
        this.displayComments();
        this.displayFootprints();
        this.setupEventListeners();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 图片上传
        const uploadBtn = document.getElementById('upload-image-btn');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'image/*';
                fileInput.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const description = document.getElementById('image-description').value;
                        this.uploadImage(file, description).then(() => {
                            document.getElementById('image-description').value = '';
                        }).catch(err => {
                            console.error('上传图片失败:', err);
                        });
                    }
                };
                fileInput.click();
            });
        }

        // 视频上传
        const uploadVideoBtn = document.getElementById('upload-video-btn');
        if (uploadVideoBtn) {
            uploadVideoBtn.addEventListener('click', () => {
                const fileInput = document.createElement('input');
                fileInput.type = 'file';
                fileInput.accept = 'video/*';
                fileInput.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const description = document.getElementById('image-description').value;
                        this.uploadVideo(file, description).then(() => {
                            document.getElementById('image-description').value = '';
                        }).catch(err => {
                            console.error('上传视频失败:', err);
                        });
                    }
                };
                fileInput.click();
            });
        }

        // 提交评论
        const commentBtn = document.getElementById('submit-comment-btn');
        if (commentBtn) {
            commentBtn.addEventListener('click', () => {
                const commentInput = document.getElementById('comment-input');
                const content = commentInput.value.trim();
                if (content) {
                    this.addComment(content);
                    commentInput.value = '';
                }
            });
        }

        // 记录访问足迹
        this.addFootprint('访问了此页面');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 从URL获取页面ID
    const pageId = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    
    // 检查是否是子页面
    if (pageId !== 'index') {
        const interaction = new UserInteraction(pageId);
        interaction.initialize();
    }
});