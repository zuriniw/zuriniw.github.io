import { projects } from './project_info.js';

// 获取当前项目名称（从URL中获取）
const projectTitle = window.location.pathname.split('/').pop().replace('.html', '');

// 查找对应的项目数据
const project = projects.find(p => p.title.toLowerCase().replace(/[^a-z0-9]/g, '') === projectTitle);

if (project) {
    // 更新页面标题
    document.title = `${project.title} - Ziru Wei`;
    
    // 更新项目标题和副标题
    document.querySelector('.project-title').textContent = project.title;
    document.querySelector('.project-subtitle').textContent = project.subtitle;

    // 更新项目元数据
    const metaContainer = document.querySelector('.project-meta');
    metaContainer.innerHTML = ''; // 清空现有内容

    // 添加合作者信息
    if (project.collaborator) {
        addMetaItem(metaContainer, '[TEAMMATE]:', project.collaborator, true);
    }

    // 添加我的工作内容
    if (project.myContribution) {
        addMetaItem(metaContainer, '[MY WORK]:', project.myContribution, false);
    }

    // 添加导师信息
    if (project.tutor) {
        addMetaItem(metaContainer, '[TUTOR]:', project.tutor, true);
    }

    // 添加助教信息
    if (project.ta) {
        addMetaItem(metaContainer, '[TA]:', project.ta, false);
    }

    // 更新项目简介和背景
    if (project.briefDescription) {
        document.querySelector('.project-context').textContent = project.briefDescription;
    }
}

// 辅助函数：添加元数据项
function addMetaItem(container, label, content, isLink) {
    const item = document.createElement('div');
    item.className = 'meta-item';
    
    const labelSpan = document.createElement('span');
    labelSpan.className = 'meta-label';
    labelSpan.textContent = label;
    item.appendChild(labelSpan);
    
    if (isLink) {
        const link = document.createElement('a');
        link.className = 'meta-link';
        link.href = '#';
        link.textContent = `${content}↗`;
        item.appendChild(link);
    } else {
        const text = document.createElement('span');
        text.className = 'meta-text';
        text.textContent = content;
        item.appendChild(text);
    }
    
    container.appendChild(item);
} 