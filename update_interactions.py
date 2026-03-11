#!/usr/bin/env python3
import os

# 标准互动空间HTML代码
interaction_html = '''        <!-- 用户交互区域 -->
        <div class="user-interaction-section">
            <h2 class="section-title" style="text-shadow: 0 0 15px rgba(0, 255, 255, 0.8);">互动空间</h2>
            <div class="interaction-tabs">
                <button class="tab-btn active" data-tab="images" style="font-size: 1.2em; padding: 12px 25px;">📷 分享内容</button>
                <button class="tab-btn" data-tab="comments" style="font-size: 1.2em; padding: 12px 25px;">💬 评论交流</button>
                <button class="tab-btn" data-tab="footprints" style="font-size: 1.2em; padding: 12px 25px;">👣 访问足迹</button>
            </div>

            <!-- 图片和视频分享标签页 -->
            <div class="tab-content active" id="images-tab">
                <div class="upload-area" style="background: rgba(0, 255, 255, 0.1); border: 3px solid rgba(0, 255, 255, 0.5); border-radius: 20px; padding: 30px; box-shadow: 0 0 20px rgba(0, 255, 255, 0.3), inset 0 0 30px rgba(0, 255, 255, 0.1);">
                    <p style="color: #00ffff; margin-bottom: 20px; font-size: 1.5em; font-weight: 700; text-shadow: 0 0 10px rgba(0, 255, 255, 0.8);">✨ 欢迎留下你自己觉得你喜欢的视频和图片！</p>
                    <p style="color: #a0ffff; margin-bottom: 25px; font-size: 1.2em;">💫 视频时长控制在15秒内，分享你的科幻灵感！</p>
                    
                    <input type="text" id="image-description" class="image-description-input" placeholder="描述你的视频或图片（可选）" style="width: 100%; padding: 15px; margin-bottom: 20px; border: 2px solid rgba(0, 255, 255, 0.5); border-radius: 10px; background: rgba(0, 0, 0, 0.5); color: #00ffff; font-size: 1.1em;">
                    
                    <div style="display: flex; gap: 20px; flex-wrap: wrap;">
                        <button class="upload-btn" id="upload-image-btn" style="flex: 1; min-width: 200px; padding: 18px 30px; font-size: 1.2em; font-weight: 700;">📤 上传图片</button>
                        <button class="upload-btn" id="upload-video-btn" style="flex: 1; min-width: 200px; padding: 18px 30px; font-size: 1.2em; font-weight: 700;">🎬 上传视频</button>
                    </div>
                </div>
                <div class="user-images-container" id="user-images-container" style="margin-top: 30px;"></div>
            </div>

            <!-- 评论交流标签页 -->
            <div class="tab-content" id="comments-tab">
                <div class="comment-input-area" style="background: rgba(255, 0, 255, 0.1); border: 3px solid rgba(255, 0, 255, 0.5); border-radius: 20px; padding: 30px; box-shadow: 0 0 20px rgba(255, 0, 255, 0.3);">
                    <p style="color: #ff00ff; margin-bottom: 20px; font-size: 1.5em; font-weight: 700; text-shadow: 0 0 10px rgba(255, 0, 255, 0.8);">💬 分享你的看法和见解</p>
                    <textarea id="comment-input" class="comment-textarea" placeholder="写下你的评论..." style="width: 100%; padding: 15px; margin-bottom: 20px; border: 2px solid rgba(255, 0, 255, 0.5); border-radius: 10px; background: rgba(0, 0, 0, 0.5); color: #ff00ff; font-size: 1.1em; min-height: 120px;"></textarea>
                    <button class="comment-submit-btn" id="submit-comment-btn" style="width: 100%; padding: 18px 30px; font-size: 1.2em; font-weight: 700;">💬 发表评论</button>
                </div>
                <div class="comments-container" id="user-comments-container" style="margin-top: 30px;"></div>
            </div>

            <!-- 访问足迹标签页 -->
            <div class="tab-content" id="footprints-tab">
                <div class="footprints-container" id="user-footprints-container" style="background: rgba(255, 255, 0, 0.1); border: 3px solid rgba(255, 255, 0, 0.5); border-radius: 20px; padding: 30px; box-shadow: 0 0 20px rgba(255, 255, 0, 0.3);"></div>
            </div>
        </div>
'''

# 需要更新的页面列表
pages = [
    ('warp.html', '曲速引擎'),
    ('ai.html', '人工智能'),
    ('neural.html', '神经网络'),
    ('genetic.html', '基因工程'),
    ('nano.html', '纳米技术'),
    ('darkmatter.html', '暗物质')
]

# 更新每个页面
for page_file, page_name in pages:
    file_path = f'/Users/a/tech_space/{page_file}'
    
    if not os.path.exists(file_path):
        print(f"文件不存在: {file_path}")
        continue
    
    # 读取文件
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 查找并替换互动空间
    old_pattern = '''        <!-- 用户交互区域 -->
        <div class="user-interaction-section">
            <h2 class="section-title">互动空间</h2>
            <div class="interaction-tabs">
                <button class="tab-btn active" data-tab="images">📷 图片分享</button>
                <button class="tab-btn" data-tab="comments">💬 评论交流</button>
                <button class="tab-btn" data-tab="footprints">👣 访问足迹</button>
            </div>

            <!-- 图片分享标签页 -->
            <div class="tab-content active" id="images-tab">
                <div class="upload-area">
                    <p style="color:'''
    
    if old_pattern in content:
        # 找到互动空间的开始位置
        start_pos = content.find('<!-- 用户交互区域 -->')
        if start_pos == -1:
            print(f"未找到互动空间: {page_file}")
            continue
        
        # 找到互动空间的结束位置（下一个 content-section 或 </div>）
        end_pattern = '<div class="content-section">'
        next_section_pos = content.find(end_pattern, start_pos + 10)
        
        if next_section_pos == -1:
            end_pattern = '</div>'
            next_section_pos = content.find(end_pattern, start_pos + 10)
        
        if next_section_pos != -1:
            # 替换互动空间
            new_content = content[:start_pos] + interaction_html + content[next_section_pos:]
            
            # 写入文件
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"✅ 已更新: {page_file} ({page_name})")
        else:
            print(f"❌ 无法找到结束位置: {page_file}")
    else:
        print(f"⚠️ 未找到匹配的互动空间: {page_file}")

print("\n所有页面更新完成！")