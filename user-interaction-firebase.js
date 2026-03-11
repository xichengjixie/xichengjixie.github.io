// Firebase用户交互功能模块 - 支持跨设备数据共享

// Firebase配置（需要用户提供）
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Firebase存储用户数据
class FirebaseUserInteraction {
    constructor(pageId) {
        this.pageId = pageId;
        this.collectionName = `page_${pageId}`;
        this.storagePath = `uploads/${pageId}`;
        this.data = {
            images: [],
            comments: [],
            footprints: []
        };
        
        this.initFirebase();
    }

    // 初始化Firebase
    async initFirebase() {
        try {
            // 加载Firebase SDK
            await this.loadFirebaseSDK();
            
            // 初始化Firebase
            firebase.initializeApp(firebaseConfig);
            
            // 初始化Firestore
            this.db = firebase.firestore();
            
            // 初始化Storage
            this.storage = firebase.storage();
            
            // 监听数据变化
            this.listenToDataChanges();
            
            console.log('✅ Firebase初始化成功');
        } catch (error) {
            console.error('❌ Firebase初始化失败:', error);
            alert('无法连接到服务器，请检查网络连接');
        }
    }

    // 加载Firebase SDK
    async loadFirebaseSDK() {
        return new Promise((resolve, reject) => {
            if (typeof firebase !== 'undefined') {
                resolve();
                return;
            }
            
            // 动态加载Firebase SDK
            const scripts = [
                'https://www.gstatic.com/firebasejs/9.22.0/firebase-app-compat.js',
                'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore-compat.js',
                'https://www.gstatic.com/firebasejs/9.22.0/firebase-storage-compat.js'
            ];
            
            let loaded = 0;
            scripts.forEach(src => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => {
                    loaded++;
                    if (loaded === scripts.length) resolve();
                };
                script.onerror = () => reject(new Error(`Failed to load ${src}`));
                document.head.appendChild(script);
            });
        });
    }

    // 监听数据变化
    listenToDataChanges() {
        // 监听图片/视频数据
        this.db.collection(this.collectionName)
            .doc('media')
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const mediaData = doc.data();
                    this.data.images = mediaData.items || [];
                    this.displayImages();
                }
            });

        // 监听评论数据
        this.db.collection(this.collectionName)
            .doc('comments')
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const commentsData = doc.data();
                    this.data.comments = commentsData.items || [];
                    this.displayComments();
                }
            });

        // 监听足迹数据
        this.db.collection(this.collectionName)
            .doc('footprints')
            .onSnapshot((doc) => {
                if (doc.exists) {
                    const footprintsData = doc.data();
                    this.data.footprints = footprintsData.items || [];
                    this.displayFootprints();
                }
            });
    }

    // 上传图片到Storage
    async uploadImage(file, description = '') {
        try {
            const fileName = `image_${Date.now()}_${file.name}`;
            const storageRef = this.storage.ref(`${this.storagePath}/${fileName}`);
            
            // 上传文件
            const snapshot = await storageRef.put(file);
            const downloadUrl = await snapshot.ref.getDownloadURL();
            
            // 保存元数据到Firestore
            const imageData = {
                id: Date.now(),
                type: 'image',
                url: downloadUrl,
                description: description || '',
                fileName: fileName,
                timestamp: new Date().toISOString(),
                userName: this.getUserName()
            };
            
            await this.saveMediaData(imageData);
            this.addFootprint('上传了一张图片');
            
            return imageData;
        } catch (error) {
            console.error('上传图片失败:', error);
            alert('上传图片失败，请重试');
            throw error;
        }
    }

    // 上传视频到Storage
    async uploadVideo(file, description = '') {
        try {
            // 检查视频时长
            const duration = await this.getVideoDuration(file);
            if (duration > 15) {
                alert('视频时长不能超过15秒！');
                throw new Error('视频时长超过限制');
            }
            
            const fileName = `video_${Date.now()}_${file.name}`;
            const storageRef = this.storage.ref(`${this.storagePath}/${fileName}`);
            
            // 上传文件
            const snapshot = await storageRef.put(file);
            const downloadUrl = await snapshot.ref.getDownloadURL();
            
            // 保存元数据到Firestore
            const videoData = {
                id: Date.now(),
                type: 'video',
                url: downloadUrl,
                description: description || '',
                fileName: fileName,
                duration: duration,
                timestamp: new Date().toISOString(),
                userName: this.getUserName()
            };
            
            await this.saveMediaData(videoData);
            this.addFootprint('上传了一个视频');
            
            return videoData;
        } catch (error) {
            console.error('上传视频失败:', error);
            if (error.message !== '视频时长超过限制') {
                alert('上传视频失败，请重试');
            }
            throw error;
        }
    }

    // 获取视频时长
    getVideoDuration(file) {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video');
            video.preload = 'metadata';
            video.onloadedmetadata = () => {
                URL.revokeObjectURL(video.src);
                resolve(video.duration);
            };
            video.onerror = () => reject(new Error('无法读取视频'));
            video.src = URL.createObjectURL(file);
        });
    }

    // 保存媒体数据到Firestore
    async saveMediaData(mediaData) {
        const docRef = this.db.collection(this.collectionName).doc('media');
        const doc = await docRef.get();
        
        if (doc.exists) {
            await docRef.update({
                items: firebase.firestore.FieldValue.arrayUnion(mediaData)
            });
        } else {
            await docRef.set({
                items: [mediaData]
            });
        }
    }

    // 添加评论
    async addComment(content, userName = '') {
        try {
            const comment = {
                id: Date.now(),
                content: content,
                userName: userName || this.getUserName(),
                timestamp: new Date().toISOString()
            };
            
            const docRef = this.db.collection(this.collectionName).doc('comments');
            const doc = await docRef.get();
            
            if (doc.exists) {
                await docRef.update({
                    items: firebase.firestore.FieldValue.arrayUnion(comment)
                });
            } else {
                await docRef.set({
                    items: [comment]
                });
            }
            
            return comment;
        } catch (error) {
            console.error('添加评论失败:', error);
            alert('添加评论失败，请重试');
            throw error;
        }
    }

    // 添加足迹
    async addFootprint(action) {
        try {
            const footprint = {
                id: Date.now(),
                action: action,
                timestamp: new Date().toISOString()
            };
            
            const docRef = this.db.collection(this.collectionName).doc('footprints');
            const doc = await docRef.get();
            
            if (doc.exists) {
                await docRef.update({
                    items: firebase.firestore.FieldValue.arrayUnion(footprint)
                });
            } else {
                await docRef.set({
                    items: [footprint]
                });
            }
        } catch (error) {
            console.error('添加足迹失败:', error);
        }
    }

    // 获取用户名
    getUserName() {
        const userName = localStorage.getItem('tech_space_username');
        if (userName) return userName;
        
        // 生成随机用户名
        const randomName = `访客_${Math.floor(Math.random() * 10000)}`;
        localStorage.setItem('tech_space_username', randomName);
        return randomName;
    }

    // 显示图片/视频
    displayImages() {
        const container = document.getElementById('uploaded-content');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.data.images.forEach(item => {
            const element = document.createElement('div');
            element.className = 'uploaded-item';
            
            if (item.type === 'image') {
                element.innerHTML = `
                    <img src="${item.url}" alt="${item.description}" />
                    <div class="item-info">
                        <p class="item-description">${item.description || '无描述'}</p>
                        <p class="item-meta">
                            <span>👤 ${item.userName}</span>
                            <span>🕒 ${new Date(item.timestamp).toLocaleString()}</span>
                        </p>
                    </div>
                `;
            } else if (item.type === 'video') {
                element.innerHTML = `
                    <video src="${item.url}" controls></video>
                    <div class="item-info">
                        <p class="item-description">${item.description || '无描述'}</p>
                        <p class="item-meta">
                            <span>👤 ${item.userName}</span>
                            <span>🕒 ${new Date(item.timestamp).toLocaleString()}</span>
                            <span>⏱️ ${Math.round(item.duration)}秒</span>
                        </p>
                    </div>
                `;
            }
            
            container.appendChild(element);
        });
    }

    // 显示评论
    displayComments() {
        const container = document.getElementById('comments-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        this.data.comments.forEach(comment => {
            const element = document.createElement('div');
            element.className = 'comment-card';
            element.innerHTML = `
                <div class="comment-header">
                    <span class="comment-author">${comment.userName}</span>
                    <span class="comment-time">${new Date(comment.timestamp).toLocaleString()}</span>
                </div>
                <div class="comment-content">${comment.content}</div>
            `;
            container.appendChild(element);
        });
    }

    // 显示足迹
    displayFootprints() {
        const container = document.getElementById('footprints-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        // 只显示最近的10条足迹
        const recentFootprints = this.data.footprints.slice(0, 10);
        
        recentFootprints.forEach(footprint => {
            const element = document.createElement('div');
            element.className = 'footprint-item';
            element.innerHTML = `
                <span>${footprint.action}</span>
                <span class="footprint-time">${new Date(footprint.timestamp).toLocaleString()}</span>
            `;
            container.appendChild(element);
        });
    }
}

// 导出模块
window.FirebaseUserInteraction = FirebaseUserInteraction;