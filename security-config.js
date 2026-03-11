/**
 * 科幻空间网站 - 安全配置模块
 * 版本: 1.0.0
 * 日期: 2026-03-11
 * 
 * 功能：提供全方位的安全防护
 * 1. XSS防护
 * 2. CSP内容安全策略
 * 3. 安全请求头配置
 * 4. 输入验证和过滤
 * 5. 安全审计日志
 */

// 安全配置常量
const SECURITY_CONFIG = {
    // 允许的文件类型
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/ogg'],
    
    // 文件大小限制（字节）
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
    
    // 文件名长度限制
    MAX_FILENAME_LENGTH: 255,
    
    // 描述文本长度限制
    MAX_DESCRIPTION_LENGTH: 500,
    
    // 评论长度限制
    MAX_COMMENT_LENGTH: 2000,
    
    // 防止XSS的允许标签
    ALLOWED_TAGS: [],
    
    // 防止XSS的允许属性
    ALLOWED_ATTRIBUTES: {},
    
    // IP白名单（可选）
    IP_WHITELIST: [],
    
    // 速率限制配置
    RATE_LIMIT: {
        maxRequests: 100,  // 每分钟最大请求数
        windowMs: 60000,   // 时间窗口（毫秒）
    },
    
    // 登录失败限制
    LOGIN_LIMIT: {
        maxAttempts: 5,
        lockoutTime: 15 * 60 * 1000, // 15分钟
    }
};

// XSS防护模块
class XSSProtection {
    /**
     * 转义HTML特殊字符
     */
    static escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return unsafe;
        
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /**
     * 清理用户输入，移除潜在危险内容
     */
    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        // 移除危险的JavaScript代码
        let sanitized = input
            .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '')
            .replace(/<iframe\b[^>]*>([\s\S]*?)<\/iframe>/gim, '')
            .replace(/<object\b[^>]*>([\s\S]*?)<\/object>/gim, '')
            .replace(/<embed\b[^>]*>/gim, '')
            .replace(/javascript:/gim, '')
            .replace(/on\w+\s*=/gim, '')
            .replace(/<[^>]+>/g, ''); // 移除所有HTML标签
        
        return this.escapeHtml(sanitized.trim());
    }

    /**
     * 验证URL安全性
     */
    static isValidUrl(url) {
        if (typeof url !== 'string') return false;
        
        try {
            const parsed = new URL(url);
            // 只允许http和https协议
            return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
            return false;
        }
    }
}

// 文件上传安全模块
class FileUploadSecurity {
    /**
     * 验证文件类型
     */
    static validateFileType(file, allowedTypes) {
        if (!file || !file.type) return false;
        return allowedTypes.includes(file.type);
    }

    /**
     * 验证文件大小
     */
    static validateFileSize(file, maxSize) {
        if (!file || !file.size) return false;
        return file.size <= maxSize;
    }

    /**
     * 验证文件名
     */
    static validateFileName(filename) {
        if (!filename || typeof filename !== 'string') return false;
        
        // 检查长度
        if (filename.length > SECURITY_CONFIG.MAX_FILENAME_LENGTH) return false;
        
        // 检查危险字符
        const dangerousChars = /[<>:"|?*\x00-\x1f]/;
        if (dangerousChars.test(filename)) return false;
        
        // 检查路径遍历
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) return false;
        
        // 检查危险扩展名
        const dangerousExtensions = ['.exe', '.bat', '.cmd', '.sh', '.php', '.jsp', '.asp', '.aspx', '.js', '.vbs'];
        const lowerFilename = filename.toLowerCase();
        return !dangerousExtensions.some(ext => lowerFilename.endsWith(ext));
    }

    /**
     * 生成安全的文件名
     */
    static generateSafeFileName(originalName) {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2, 10);
        const extension = originalName.split('.').pop().toLowerCase();
        return `${timestamp}_${random}.${extension}`;
    }

    /**
     * 验证文件内容（通过魔数）
     */
    static async validateFileContent(file, expectedType) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const arr = new Uint8Array(e.target.result).subarray(0, 8);
                let header = '';
                for (let i = 0; i < arr.length; i++) {
                    header += arr[i].toString(16).padStart(2, '0');
                }
                
                // 文件魔数验证
                const magicNumbers = {
                    'image/jpeg': ['ffd8ff'],
                    'image/png': ['89504e470d0a1a0a'],
                    'image/gif': ['47494638'],
                    'image/webp': ['52494646'],
                    'video/mp4': ['66747970', '0000001c'],
                    'video/webm': ['1a45dfa3'],
                    'video/ogg': ['4f676753']
                };
                
                const allowed = magicNumbers[expectedType] || [];
                resolve(allowed.some(magic => header.startsWith(magic)));
            };
            reader.onerror = () => resolve(false);
            reader.readAsArrayBuffer(file.slice(0, 8));
        });
    }
}

// 输入验证模块
class InputValidator {
    /**
     * 验证描述文本
     */
    static validateDescription(text) {
        if (typeof text !== 'string') return { valid: false, error: '描述必须是字符串' };
        
        if (text.length > SECURITY_CONFIG.MAX_DESCRIPTION_LENGTH) {
            return { valid: false, error: `描述不能超过${SECURITY_CONFIG.MAX_DESCRIPTION_LENGTH}个字符` };
        }
        
        const sanitized = XSSProtection.sanitizeInput(text);
        return { valid: true, sanitized };
    }

    /**
     * 验证评论内容
     */
    static validateComment(text) {
        if (typeof text !== 'string') return { valid: false, error: '评论必须是字符串' };
        
        const trimmed = text.trim();
        if (trimmed.length === 0) {
            return { valid: false, error: '评论不能为空' };
        }
        
        if (trimmed.length > SECURITY_CONFIG.MAX_COMMENT_LENGTH) {
            return { valid: false, error: `评论不能超过${SECURITY_CONFIG.MAX_COMMENT_LENGTH}个字符` };
        }
        
        const sanitized = XSSProtection.sanitizeInput(trimmed);
        return { valid: true, sanitized };
    }
}

// 安全审计日志模块
class SecurityAudit {
    constructor() {
        this.storageKey = 'security_audit_log';
        this.maxLogEntries = 100;
        this.loadLogs();
    }

    loadLogs() {
        const stored = localStorage.getItem(this.storageKey);
        this.logs = stored ? JSON.parse(stored) : [];
    }

    saveLogs() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
    }

    /**
     * 记录安全事件
     */
    logEvent(event) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            type: event.type,
            severity: event.severity, // low, medium, high, critical
            details: event.details,
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.logs.unshift(logEntry);
        
        // 只保留最近的日志条目
        if (this.logs.length > this.maxLogEntries) {
            this.logs = this.logs.slice(0, this.maxLogEntries);
        }
        
        this.saveLogs();
        
        // 如果是高危事件，发送到控制台
        if (['high', 'critical'].includes(event.severity)) {
            console.warn('[Security Audit]', logEntry);
        }
    }

    /**
     * 检测异常行为
     */
    detectSuspiciousActivity() {
        const now = Date.now();
        const oneHourAgo = now - 3600000;
        
        // 检测一小时内的失败尝试
        const recentFailures = this.logs.filter(log => 
            log.timestamp > oneHourAgo && 
            log.type === 'auth_failure'
        );
        
        if (recentFailures.length >= 10) {
            this.logEvent({
                type: 'brute_force_attempt',
                severity: 'high',
                details: `检测到可能的暴力破解攻击：${recentFailures.length}次失败尝试`
            });
            return true;
        }
        
        return false;
    }

    /**
     * 检测异常文件上传
     */
    detectSuspiciousUploads() {
        const now = Date.now();
        const fiveMinutesAgo = now - 300000;
        
        const recentUploads = this.logs.filter(log => 
            log.timestamp > fiveMinutesAgo && 
            log.type === 'file_upload'
        );
        
        if (recentUploads.length >= 20) {
            this.logEvent({
                type: 'mass_upload_attempt',
                severity: 'high',
                details: `检测到异常文件上传行为：${recentUploads.length}次上传`
            });
            return true;
        }
        
        return false;
    }
}

// 速率限制模块
class RateLimiter {
    constructor() {
        this.storageKey = 'rate_limit_log';
        this.loadLog();
    }

    loadLog() {
        const stored = localStorage.getItem(this.storageKey);
        this.log = stored ? JSON.parse(stored) : {};
    }

    saveLog() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.log));
    }

    /**
     * 检查是否超过速率限制
     */
    checkLimit(action) {
        const now = Date.now();
        const windowStart = now - SECURITY_CONFIG.RATE_LIMIT.windowMs;
        
        if (!this.log[action]) {
            this.log[action] = [];
        }
        
        // 清理过期的记录
        this.log[action] = this.log[action].filter(timestamp => timestamp > windowStart);
        
        // 检查是否超过限制
        if (this.log[action].length >= SECURITY_CONFIG.RATE_LIMIT.maxRequests) {
            return { allowed: false, retryAfter: Math.ceil((this.log[action][0] - windowStart) / 1000) };
        }
        
        // 记录此次请求
        this.log[action].push(now);
        this.saveLog();
        
        return { allowed: true, remaining: SECURITY_CONFIG.RATE_LIMIT.maxRequests - this.log[action].length };
    }
}

// 加密工具模块
class EncryptionUtils {
    /**
     * 生成安全的随机字符串
     */
    static generateSecureToken(length = 32) {
        const array = new Uint8Array(length);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * 简单的数据混淆（用于localStorage）
     * 注意：这不是强加密，只是防止简单的数据篡改
     */
    static obfuscate(data) {
        const str = JSON.stringify(data);
        const encoded = btoa(encodeURIComponent(str));
        return encoded.split('').reverse().join('');
    }

    /**
     * 解混淆数据
     */
    static deobfuscate(obfuscated) {
        try {
            const reversed = obfuscated.split('').reverse().join('');
            const decoded = decodeURIComponent(atob(reversed));
            return JSON.parse(decoded);
        } catch {
            return null;
        }
    }

    /**
     * 计算简单的哈希值用于数据完整性验证
     */
    static hash(data) {
        let hash = 0;
        const str = JSON.stringify(data);
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return hash.toString(16);
    }
}

// 安全配置初始化
class SecurityInitializer {
    constructor() {
        this.audit = new SecurityAudit();
        this.rateLimiter = new RateLimiter();
        this.init();
    }

    init() {
        // 设置CSP meta标签（如果不存在）
        this.setupCSP();
        
        // 设置安全相关的meta标签
        this.setupSecurityHeaders();
        
        // 监控页面可见性变化
        this.monitorPageVisibility();
        
        // 记录页面访问
        this.logPageVisit();
        
        // 初始化完成日志
        this.audit.logEvent({
            type: 'security_init',
            severity: 'low',
            details: '安全模块初始化完成'
        });
    }

    setupCSP() {
        // GitHub Pages支持通过meta标签设置CSP
        let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!cspMeta) {
            cspMeta = document.createElement('meta');
            cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
            document.head.appendChild(cspMeta);
        }
        
        // 配置CSP策略
        const cspPolicy = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://utteranc.es",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https://images.unsplash.com https://picsum.photos",
            "media-src 'self' data: blob:",
            "frame-src 'self' https://utteranc.es",
            "connect-src 'self'",
            "font-src 'self' data:",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            "upgrade-insecure-requests"
        ].join('; ');
        
        cspMeta.setAttribute('content', cspPolicy);
    }

    setupSecurityHeaders() {
        const headers = [
            { name: 'X-Content-Type-Options', content: 'nosniff' },
            { name: 'X-Frame-Options', content: 'DENY' },
            { name: 'X-XSS-Protection', content: '1; mode=block' },
            { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' },
            { name: 'Permissions-Policy', content: 'geolocation=(), microphone=(), camera=()' }
        ];
        
        headers.forEach(header => {
            let meta = document.querySelector(`meta[name="${header.name}"]`);
            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute('name', header.name);
                document.head.appendChild(meta);
            }
            meta.setAttribute('content', header.content);
        });
    }

    monitorPageVisibility() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.audit.logEvent({
                    type: 'page_visible',
                    severity: 'low',
                    details: '用户返回页面'
                });
            }
        });
    }

    logPageVisit() {
        this.audit.logEvent({
            type: 'page_visit',
            severity: 'low',
            details: `访问页面: ${window.location.pathname}`
        });
    }
}

// 导出安全模块
window.SecurityConfig = SECURITY_CONFIG;
window.XSSProtection = XSSProtection;
window.FileUploadSecurity = FileUploadSecurity;
window.InputValidator = InputValidator;
window.SecurityAudit = SecurityAudit;
window.RateLimiter = RateLimiter;
window.EncryptionUtils = EncryptionUtils;
window.SecurityInitializer = SecurityInitializer;

// 页面加载时自动初始化安全模块
document.addEventListener('DOMContentLoaded', () => {
    window.security = new SecurityInitializer();
});