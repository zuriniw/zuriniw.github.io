import { projects } from '../project_info.js';

function createProjectPage(project) {
    console.log('Creating project page for:', project);
    console.log('Project YouTube link:', project.youtubeLink);  // 检查 youtubeLink 是否存在
    // 设置页面标题
    document.title = `${project.title} - Ziru Wei`;

    // 填充项目标题和副标题
    document.querySelector('.project-title').textContent = project.title;
    document.querySelector('.project-subtitle').textContent = project.subtitle;

    // 填充项目元数据
    const metaContainer = document.querySelector('.project-meta');
    metaContainer.innerHTML = generateMetaHTML(project);

    // 填充项目描述
    if (project.briefDescription) {
        document.querySelector('.project-context').textContent = project.briefDescription;
    }

    // 在 context 下方添加 YouTube 视频
    if (project.youtubeLink) {
        console.log('Found YouTube link:', project.youtubeLink);
        const videoId = getYoutubeVideoId(project.youtubeLink);
        console.log('Extracted video ID:', videoId);
        if (videoId) {
            const videoSection = document.createElement('div');
            videoSection.className = 'video-section';
            
            const videoContainer = document.createElement('div');
            videoContainer.className = 'video-container';
            
            console.log('Creating video container with ID:', videoId);
            const iframe = document.createElement('iframe');
            iframe.width = "560";
            iframe.height = "315";
            iframe.src = `https://www.youtube.com/embed/${videoId}`;
            iframe.title = `${project.title} Demo Video`;
            iframe.frameBorder = "0";
            iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
            iframe.allowFullscreen = true;
            
            videoContainer.appendChild(iframe);
            
            videoSection.appendChild(videoContainer);
            
            // 将视频插入到视频容器中
            const videoWrapper = document.querySelector('.video-wrapper');
            console.log('Found video wrapper:', videoWrapper);
            console.log('Video wrapper HTML before:', videoWrapper.innerHTML);
            if (videoWrapper) {
                videoWrapper.appendChild(videoSection);
                console.log('Video section inserted');
                console.log('Video wrapper HTML after:', videoWrapper.innerHTML);
            }
        }
    }
}

function generateMetaHTML(project) {
    let html = '';
    
    // 添加时间信息
    if (project.time) {
        html += `
            <div class="meta-item">
                <span class="meta-label">Time: </span>
                <span class="meta-text">${project.time}</span>
            </div>
        `;
    }

    // 添加项目类型
    html += `
        <div class="meta-item">
            <span class="meta-label">Type: </span>
            <span class="meta-text">${project.isteam ? 'Teamwork' : 'Independent Work'}</span>
        </div>
    `;

    // 添加工具信息
    if (project.tools) {
        html += `
            <div class="meta-item">
                <span class="meta-label">Tools: </span>
                <span class="meta-text">${project.tools}</span>
            </div>
        `;
    }

    // 添加链接信息
    const links = [];
    if (project.youtubeLink) links.push(`<a href="${project.youtubeLink}" target="_blank" class="meta-link">Demo Video↗</a>`);
    if (project.paperLink) links.push(`<a href="${project.paperLink}" target="_blank" class="meta-link">Paper↗</a>`);
    if (project.otherLink1) links.push(`<a href="${project.otherLink1}" target="_blank" class="meta-link">GitHub↗</a>`);

    if (links.length > 0) {
        html += `
            <div class="meta-item">
                <span class="meta-label">Links: </span>
                <div class="links-wrapper">
                    ${links.join('\n')}
                </div>
            </div>
        `;
    }

    return html;
}

// 从 YouTube URL 中提取视频 ID
function getYoutubeVideoId(url) {
    // 处理 youtu.be 短链接
    if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1].split('?')[0];
        console.log('Extracted ID from youtu.be:', id);
        return id;
    }
    
    // 处理标准 YouTube URL
    const videoIdMatch = url.match(/[?&]v=([^?&]+)/);
    if (videoIdMatch) {
        console.log('Extracted ID from standard URL:', videoIdMatch[1]);
        return videoIdMatch[1];
    }

    // 如果都没有匹配，返回 null
    console.log('URL:', url);
    console.log('No video ID found');
    return null;
}

// 获取当前项目名称
function getCurrentProjectName() {
    const path = window.location.pathname;
    console.log('Current path:', path);
    const projectName = path.split('/').slice(-2)[0];
    console.log('Extracted project name:', projectName);
    console.log('Looking for project with name:', projectName);
    return projectName;
}

// 初始化页面
function initProjectPage() {
    // 确保页面有项目页面标识
    if (!document.body.classList.contains('project-page')) {
        document.body.classList.add('project-page');
    }
    
    const projectName = getCurrentProjectName();
    const project = projects.find(p => p.name === projectName);
    
    if (project) {
        createProjectPage(project);
    } else {
        console.error('Project not found:', projectName);
    }
}

// 确保在 DOM 加载完成后立即执行
document.addEventListener('DOMContentLoaded', initProjectPage); 