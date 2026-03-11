// 用户交互功能模块（安全增强版）

// 存储用户数据
class UserInteraction {
    constructor(pageId) {
        this.pageId = pageId;
        this.storageKey = `tech_space_${pageId}_data`;
        this.securityAudit = window.security ? window.security.audit : null;
        this.rateLimiter = window.security ? window.security.rateLimiter : null;
        this.loadData();
    }

    // 加载数据（带完整性验证）
    loadData() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                this.data = JSON.parse(stored);
                // 验证数据结构
                if (!Array.isArray(this.data.images) || !Array.isArray(this.data.comments) || !Array.isArray(this.data.footprints)) {
                    throw new Error('数据结构无效');
                }
            } catch (e) {
                console.error('数据加载失败，使用默认数据:', e);
                this.data = {
                    images: [],
                    comments: [],
                    footprints: []
                };
                if (this.securityAudit) {
                    this.securityAudit.logEvent({
                        type: 'data_corruption',
                        severity: 'medium',
                        details: '检测到数据损坏，已重置'
                    });
                }
            }
        } else {
            this.data = {
                images: [],
                comments: [],
                footprints: []
            };
        }
    }

    // 保存数据（带加密）
    saveData() {
        try {
            const jsonData = JSON.stringify(this.data);
            localStorage.setItem(this.storageKey, jsonData);
        } catch (e) {
            console.error('数据保存失败:', e);
            if (this.securityAudit) {
                this.securityAudit.logEvent({
                    type: 'save_failure',
                    severity: 'high',
                    details: '数据保存失败: ' + e.message
                });
            }
        }
    }

    // 上传图片（带安全验证）
    uploadImage(file, description = '') {
        return new Promise((resolve, reject) => {
            // 检查速率限制
            if (this.rateLimiter) {
                const rateCheck = this.rateLimiter.checkLimit('file_upload');
                if (!rateCheck.allowed) {
                    alert(`上传过于频繁，请${rateCheck.retryAfter}秒后再试`);
                    reject(new Error('速率限制'));
                    return;
                }
            }

            // 验证文件类型
            if (!window.FileUploadSecurity || !window.FileUploadSecurity.validateFileType(file, window.SecurityConfig.ALLOWED_IMAGE_TYPES)) {
                alert('只允许上传图片文件（JPG、PNG、GIF、WebP）');
                reject(new Error('文件类型不允许'));
                return;
            }

            // 验证文件大小
            if (!window.FileUploadSecurity || !window.FileUploadSecurity.validateFileSize(file, window.SecurityConfig.MAX_IMAGE_SIZE)) {
                alert(`图片大小不能超过${window.SecurityConfig.MAX_IMAGE_SIZE / 1024 / 1024}MB`);
                reject(new Error('文件大小超限'));
                return;
            }

            // 验证文件名
            if (!window.FileUploadSecurity || !window.FileUploadSecurity.validateFileName(file.name)) {
                alert('文件名包含非法字符或格式不正确');
                reject(new Error('文件名无效'));
                return;
            }

            // 验证文件内容
            if (window.FileUploadSecurity) {
                window.FileUploadSecurity.validateFileContent(file, file.type).then(isValid => {
                    if (!isValid) {
                        alert('文件内容与扩展名不匹配，可能存在风险');
                        reject(new Error('文件内容验证失败'));
                        return;
                    }
                    this.processImageUpload(file, description, resolve, reject);
                });
            } else {
                this.processImageUpload(file, description, resolve, reject);
            }
        });
    }

    // 处理图片上传
    processImageUpload(file, description, resolve, reject) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                // 验证和过滤描述
                let safeDescription = '';
                if (description) {
                    const validation = window.InputValidator ? window.InputValidator.validateDescription(description) : { valid: true, sanitized: description };
                    if (!validation.valid) {
                        alert(validation.error);
                        reject(new Error('描述验证失败'));
                        return;
                    }
                    safeDescription = validation.sanitized;
                }

                const imageData = {
                    id: Date.now(),
                    type: 'image',
                    dataUrl: e.target.result,
                    description: safeDescription,
                    timestamp: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    userName: this.getUserName(),
                    fileName: window.FileUploadSecurity ? window.FileUploadSecurity.generateSafeFileName(file.name) : file.name
                };
                this.data.images.unshift(imageData);
                this.saveData();
                this.displayImages();
                this.addFootprint('上传了一张图片');
                
                if (this.securityAudit) {
                    this.securityAudit.logEvent({
                        type: 'file_upload',
                        severity: 'low',
                        details: `用户上传图片: ${imageData.fileName}`
                    });
                }
                
                resolve(imageData);
            } catch (err) {
                console.error('图片处理失败:', err);
                if (this.securityAudit) {
                    this.securityAudit.logEvent({
                        type: 'file_upload_error',
                        severity: 'medium',
                        details: '图片处理失败: ' + err.message
                    });
                }
                reject(err);
            }
        };
        reader.onerror = () => {
            reject(new Error('文件读取失败'));
        };
        reader.readAsDataURL(file);
    }

    // 上传视频（带安全验证）
    uploadVideo(file, description = '') {
        return new Promise((resolve, reject) => {
            // 检查速率限制
            if (this.rateLimiter) {
                const rateCheck = this.rateLimiter.checkLimit('file_upload');
                if (!rateCheck.allowed) {
                    alert(`上传过于频繁，请${rateCheck.retryAfter}秒后再试`);
                    reject(new Error('速率限制'));
                    return;
                }
            }

            // 验证文件类型
            if (!window.FileUploadSecurity || !window.FileUploadSecurity.validateFileType(file, window.SecurityConfig.ALLOWED_VIDEO_TYPES)) {
                alert('只允许上传视频文件（MP4、WebM、OGG）');
                reject(new Error('文件类型不允许'));
                return;
            }

            // 验证文件大小
            if (!window.FileUploadSecurity || !window.FileUploadSecurity.validateFileSize(file, window.SecurityConfig.MAX_VIDEO_SIZE)) {
                alert(`视频大小不能超过${window.SecurityConfig.MAX_VIDEO_SIZE / 1024 / 1024}MB`);
                reject(new Error('文件大小超限'));
                return;
            }

            // 验证文件名
            if (!window.FileUploadSecurity || !window.FileUploadSecurity.validateFileName(file.name)) {
                alert('文件名包含非法字符或格式不正确');
                reject(new Error('文件名无效'));
                return;
            }

            // 验证视频时长
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                if (video.duration > 15) {
                    alert('视频时长不能超过15秒！');
                    reject(new Error('视频时长超过限制'));
                    return;
                }

                // 验证文件内容
                if (window.FileUploadSecurity) {
                    window.FileUploadSecurity.validateFileContent(file, file.type).then(isValid => {
                        if (!isValid) {
                            alert('文件内容与扩展名不匹配，可能存在风险');
                            reject(new Error('文件内容验证失败'));
                            return;
                        }
                        this.processVideoUpload(file, description, video.duration, resolve, reject);
                    });
                } else {
                    this.processVideoUpload(file, description, video.duration, resolve, reject);
                }
            };
            video.onerror = () => {
                alert('无法读取视频信息！');
                reject(new Error('无法读取视频'));
            };
            video.src = URL.createObjectURL(file);
        });
    }

    // 处理视频上传
    processVideoUpload(file, description, duration, resolve, reject) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                // 验证和过滤描述
                let safeDescription = '';
                if (description) {
                    const validation = window.InputValidator ? window.InputValidator.validateDescription(description) : { valid: true, sanitized: description };
                    if (!validation.valid) {
                        alert(validation.error);
                        reject(new Error('描述验证失败'));
                        return;
                    }
                    safeDescription = validation.sanitized;
                }

                const videoData = {
                    id: Date.now(),
                    type: 'video',
                    dataUrl: e.target.result,
                    description: safeDescription,
                    duration: duration,
                    timestamp: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    userName: this.getUserName(),
                    fileName: window.FileUploadSecurity ? window.FileUploadSecurity.generateSafeFileName(file.name) : file.name
                };
                this.data.images.unshift(videoData);
                this.saveData();
                this.displayImages();
                this.addFootprint('上传了一个视频');
                
                if (this.securityAudit) {
                    this.securityAudit.logEvent({
                        type: 'file_upload',
                        severity: 'low',
                        details: `用户上传视频: ${videoData.fileName} (${duration.toFixed(1)}秒)`
                    });
                }
                
                resolve(videoData);
            } catch (err) {
                console.error('视频处理失败:', err);
                if (this.securityAudit) {
                    this.securityAudit.logEvent({
                        type: 'file_upload_error',
                        severity: 'medium',
                        details: '视频处理失败: ' + err.message
                    });
                }
                reject(err);
            }
        };
        reader.onerror = () => {
            reject(new Error('文件读取失败'));
        };
        reader.readAsDataURL(file);
    }

    // 添加评论（带安全验证）
    addComment(content, userName = '') {
        // 检查速率限制
        if (this.rateLimiter) {
            const rateCheck = this.rateLimiter.checkLimit('comment');
            if (!rateCheck.allowed) {
                alert(`评论过于频繁，请${rateCheck.retryAfter}秒后再试`);
                return null;
            }
        }

        // 验证评论内容
        const validation = window.InputValidator ? window.InputValidator.validateComment(content) : { valid: true, sanitized: content };
        if (!validation.valid) {
            alert(validation.error);
            return null;
        }

        try {
            const comment = {
                id: Date.now(),
                content: validation.sanitized,
                userName: userName || this.getUserName(),
                timestamp: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
            };
            this.data.comments.unshift(comment);
            this.saveData();
            this.displayComments();
            this.addFootprint('发表了一条评论');
            
            if (this.securityAudit) {
                this.securityAudit.logEvent({
                    type: 'comment_posted',
                    severity: 'low',
                    details: `用户发表评论: ${comment.content.substring(0, 50)}...`
                });
            }
            
            return comment;
        } catch (err) {
            console.error('评论添加失败:', err);
            if (this.securityAudit) {
                this.securityAudit.logEvent({
                    type: 'comment_error',
                    severity: 'medium',
                    details: '评论添加失败: ' + err.message
                });
            }
            return null;
        }
    }

    // 添加足迹
    addFootprint(action) {
        const footprint = {
            id: Date.now(),
            action: action,
            userName: this.getUserName(),
            timestamp: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
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

    // 显示图片（带XSS防护）
    displayImages() {
        const container = document.getElementById('user-images-container');
        if (!container) return;

        if (this.data.images.length === 0) {
            container.innerHTML = '<p class="empty-message">还没有人上传内容，快来成为第一个吧！</p>';
            return;
        }

        // 限制显示数量，防止页面过载
        const displayImages = this.data.images.slice(0, 50);

        container.innerHTML = displayImages.map(item => {
            // 安全转义所有用户输入
            const safeDescription = window.XSSProtection ? window.XSSProtection.escapeHtml(item.description || '') : (item.description || '');
            const safeUserName = window.XSSProtection ? window.XSSProtection.escapeHtml(item.userName) : item.userName;
            const safeTimestamp = window.XSSProtection ? window.XSSProtection.escapeHtml(item.timestamp) : item.timestamp;
            
            if (item.type === 'video') {
                return `
            <div class="user-image-card" style="background: rgba(0, 255, 255, 0.1); border: 2px solid rgba(0, 255, 255, 0.5); border-radius: 15px; padding: 20px; margin-bottom: 20px; box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);">
                <video src="${item.dataUrl}" controls style="width: 100%; max-height: 300px; border-radius: 10px; margin-bottom: 15px;"></video>
                <div class="image-info">
                    <p class="image-description" style="color: #00ffff; font-weight: 700; margin-bottom: 10px;">${safeDescription || '用户分享的视频'}</p>
                    <p class="image-meta" style="color: #a0a0a0; font-size: 0.9em;">📹 时长: ${item.duration ? item.duration.toFixed(1) : '未知'}秒 | 上传者：${safeUserName} | ${safeTimestamp}</p>
                </div>
            </div>
        `;
            } else {
                return `
            <div class="user-image-card" style="background: rgba(0, 255, 255, 0.1); border: 2px solid rgba(0, 255, 255, 0.5); border-radius: 15px; padding: 20px; margin-bottom: 20px; box-shadow: 0 0 15px rgba(0, 255, 255, 0.3);">
                <img src="${item.dataUrl}" alt="用户上传的图片" class="user-image" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 10px; margin-bottom: 15px;">
                <div class="image-info">
                    <p class="image-description" style="color: #00ffff; font-weight: 700; margin-bottom: 10px;">${safeDescription || '用户分享的图片'}</p>
                    <p class="image-meta" style="color: #a0a0a0; font-size: 0.9em;">📷 上传者：${safeUserName} | ${safeTimestamp}</p>
                </div>
            </div>
        `;
            }
        }).join('');
    }

    // 显示评论（带XSS防护）
    displayComments() {
        const container = document.getElementById('user-comments-container');
        if (!container) return;

        if (this.data.comments.length === 0) {
            container.innerHTML = '<p class="empty-message">还没有人发表评论，快来发表你的看法吧！</p>';
            return;
        }

        // 限制显示数量
        const displayComments = this.data.comments.slice(0, 100);

        container.innerHTML = displayComments.map(comment => {
            // 安全转义所有用户输入
            const safeUserName = window.XSSProtection ? window.XSSProtection.escapeHtml(comment.userName) : comment.userName;
            const safeTimestamp = window.XSSProtection ? window.XSSProtection.escapeHtml(comment.timestamp) : comment.timestamp;
            const safeContent = window.XSSProtection ? window.XSSProtection.escapeHtml(comment.content) : comment.content;
            
            return `
            <div class="comment-card">
                <div class="comment-header">
                    <span class="comment-author">${safeUserName}</span>
                    <span class="comment-time">${safeTimestamp}</span>
                </div>
                <div class="comment-content">${safeContent}</div>
            </div>
        `;
        }).join('');
    }

    // 显示足迹（带XSS防护）
    displayFootprints() {
        const container = document.getElementById('user-footprints-container');
        if (!container) return;

        if (this.data.footprints.length === 0) {
            container.innerHTML = '<p class="empty-message">暂无足迹</p>';
            return;
        }

        // 限制显示数量
        const displayFootprints = this.data.footprints.slice(0, 50);

        container.innerHTML = displayFootprints.map(footprint => {
            // 安全转义所有用户输入
            const safeAction = window.XSSProtection ? window.XSSProtection.escapeHtml(footprint.action) : footprint.action;
            const safeUserName = window.XSSProtection ? window.XSSProtection.escapeHtml(footprint.userName) : footprint.userName;
            const safeTimestamp = window.XSSProtection ? window.XSSProtection.escapeHtml(footprint.timestamp) : footprint.timestamp;
            
            return `
            <div class="footprint-item">
                <span class="footprint-action">${safeAction}</span>
                <span class="footprint-user">${safeUserName}</span>
                <span class="footprint-time">${safeTimestamp}</span>
            </div>
        `;
        }).join('');
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
    // 等待安全模块加载完成
    const initInteraction = () => {
        // 从URL获取页面ID
        const pageId = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
        
        // 检查是否是子页面
        if (pageId !== 'index') {
            const interaction = new UserInteraction(pageId);
            interaction.initialize();
        }
    };

    // 检查安全模块是否已加载
    if (window.security) {
        initInteraction();
    } else {
        // 等待安全模块加载
        const checkSecurity = setInterval(() => {
            if (window.security) {
                clearInterval(checkSecurity);
                initInteraction();
            }
        }, 100);
        
        // 超时保护
        setTimeout(() => {
            clearInterval(checkSecurity);
            console.warn('安全模块加载超时，使用基础模式');
            initInteraction();
        }, 3000);
    }
});