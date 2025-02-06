import { projects } from './project_info.js';
import { VisitTracker } from './visit_tracker.js';

// 从 URL 获取当前项目名称
const projectName = window.location.pathname.split('/')[2];  // projects/name/name.html -> name

// 找到对应的项目
const project = projects.find(p => p.name === projectName);

if (project) {
    // 设置页面标题
    document.title = `${project.title} - Ziru Wei`;

    // 填充项目标题和副标题
    document.querySelector('.project-title').textContent = project.title;
    document.querySelector('.project-subtitle').textContent = project.subtitle;

    // 创建并填充元数据
    const metaSection = document.querySelector('.project-meta');
       // 添加链接
       if (project.youtubeLink || project.paperLink || project.githubLink || project.otherLink2) {
        const linksContainer = document.createElement('div');
        linksContainer.className = 'meta-item links-container';
        const linksWrapper = document.createElement('div');
        linksWrapper.className = 'links-wrapper';

        const links = [];
        if (project.youtubeLink) links.push(createMetaLink('Demo Video↗', project.youtubeLink));
        if (project.paperLink) links.push(createMetaLink('Paper↗', project.paperLink));
        if (project.githubLink) links.push(createMetaLink('GitHub↗', project.githubLink));
        if (project.otherLink2) links.push(createMetaLink('Project Page↗', project.otherLink2));

        linksWrapper.innerHTML = links.map(link => `<a href="${link.href}" target="_blank" class="meta-link">${link.textContent}</a>`).join('\n');
        linksContainer.appendChild(linksWrapper);
        metaSection.appendChild(linksContainer);
    }
    // 添加时间
    if (project.time) {
        const timeItem = createMetaItem('Time', project.time);
        timeItem.classList.add('time-item');  // 添加特定类名
        metaSection.appendChild(timeItem);
    }

    // 添加标签
    if (project.labels && project.labels.length > 0) {
        const labelsItem = createMetaItem('Types', project.labels.join(', '));
        metaSection.appendChild(labelsItem);
    }

    // 添加工具
    if (project.tools) {
        const toolsItem = createMetaItem('Tools', project.tools);
        metaSection.appendChild(toolsItem);
    }

    // 添加合作者
    if (project.collaborator) {
        const collaboratorItem = createMetaItem('WorkWith', project.collaborator);
        metaSection.appendChild(collaboratorItem);
    }

    // 添加导师
    if (project.tutor) {
        const tutorItem = createMetaItem('Tutor', project.tutor);
        metaSection.appendChild(tutorItem);
    }

    // 添加助教
    if (project.ta) {
        const taItem = createMetaItem('TA', project.ta);
        metaSection.appendChild(taItem);
    }

    // 添加我的贡献
    if (project.myContribution) {
        const contributionItem = createMetaItem('Work', project.myContribution);
        metaSection.appendChild(contributionItem);
    }

    // 添加奖项
    if (project.prize) {
        const prizeItem = createMetaItem('Honor', project.prize);
        metaSection.appendChild(prizeItem);
    }

    // 添加项目描述
    if (project.briefDescription) {
        document.querySelector('.project-context').textContent = project.briefDescription;
    }

    // 添加叙事性文本
    if (project.narrative) {
        const narrativeItem = createMetaItem('Narrative', project.narrative);
        metaSection.appendChild(narrativeItem);
    }

    // 添加视频部分（在项目描述之后）
    if (project.youtubeLink) {
        const videoSection = document.createElement('div');
        videoSection.className = 'video-wrapper';
        
        const iframe = document.createElement('iframe');
        iframe.src = project.youtubeLink;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allowfullscreen', '');
        
        videoSection.appendChild(iframe);
        
        // 将视频插入到项目描述后面
        const projectContext = document.querySelector('.project-context');
        projectContext.parentNode.insertBefore(videoSection, projectContext.nextSibling);
    }
}

// 辅助函数：创建元数据项
function createMetaItem(label, content) {
    const item = document.createElement('div');
    item.className = 'metadata-item';
    
    const labelSpan = document.createElement('div');
    labelSpan.className = 'meta-label';
    labelSpan.textContent = label;
    
    const contentSpan = document.createElement('div');
    contentSpan.className = 'meta-text';
    contentSpan.textContent = content;
    
    item.appendChild(labelSpan);
    item.appendChild(contentSpan);
    
    return item;
}

// 辅助函数：创建链接
function createMetaLink(label, url) {
    const link = document.createElement('a');
    link.href = url;
    link.className = 'meta-link';
    link.target = '_blank';
    link.textContent = label;
    return link;
}

export class ProjectPage {
    static init() {
        // 检查并记录项目访问
        VisitTracker.checkAndRecordCurrentProject();

        // 获取当前项目信息
        const projectName = this.getCurrentProjectName();
        const currentProject = projects.find(p => p.name === projectName);
        
        if (!currentProject) {
            console.error('Project not found');
            return;
        }
    }

    static getCurrentProjectName() {
        return window.location.pathname.split('/').slice(-2)[0];
    }
    
    constructor() {
        this.name = ProjectPage.getCurrentProjectName();
        this.project = projects.find(p => p.name === this.name);
        
        if (!this.project) {
            console.error('Project not found');
            return;
        }
    }
}

// 初始化页面
ProjectPage.init(); 