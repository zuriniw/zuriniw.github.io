import { projects } from './project_info.js';

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
       if (project.youtubeLink || project.paperLink || project.otherLink1) {
        const linksContainer = document.createElement('div');
        linksContainer.className = 'meta-item links-container';
        const linksWrapper = document.createElement('div');
        linksWrapper.className = 'links-wrapper';

        if (project.youtubeLink) {
            const link = createMetaLink('  ○ Video ↗', project.youtubeLink);
            linksWrapper.appendChild(link);
        }

        if (project.paperLink) {
            const link = createMetaLink('  ○ Paper ↗', project.paperLink);
            linksWrapper.appendChild(link);
        }

        if (project.otherLink1) {
            const link = createMetaLink('  ○ Project Page ↗', project.otherLink1);
            linksWrapper.appendChild(link);
        }

        linksContainer.appendChild(linksWrapper);
        metaSection.appendChild(linksContainer);
    }
    // 添加时间
    if (project.time) {
        const timeItem = createMetaItem('Time', project.time);
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
        const collaboratorItem = createMetaItem('Collaborator', project.collaborator);
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
        const contributionItem = createMetaItem('My Contribution', project.myContribution);
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
}

// 辅助函数：创建元数据项
function createMetaItem(label, content) {
    const item = document.createElement('div');
    item.className = 'meta-item';
    item.innerHTML = `
        <span class="meta-label">${label}:</span>
        <span class="meta-text">${content}</span>
    `;
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