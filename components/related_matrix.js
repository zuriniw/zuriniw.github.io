import { projects } from '../projects/project_info.js';
import { availableLabels } from '../projects/project_info.js';
import { VisitTracker } from '../projects/visit_tracker.js';

class RelatedMatrix {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'related-matrix-container';
        
        // 添加标题
        const title = document.createElement('div');
        title.className = 'related-matrix-title';
        title.textContent = 'Choose your next destination...';
        this.container.appendChild(title);
        
        // 添加向下箭头
        const arrow = document.createElement('div');
        arrow.className = 'down-arrow';
        this.container.appendChild(arrow);
        
        // 创建矩阵容器
        this.matrixContainer = document.createElement('div');
        this.matrixContainer.className = 'matrix-container';
        
        // 添加坐标轴标签
        this.addAxisLabels();
        
        this.container.appendChild(this.matrixContainer);
        
        // 检查是否访问了所有可访问的项目，在矩阵后面添加感谢信息
        this.checkAllProjectsVisited();
        
        // 获取当前项目名称
        this.currentProject = window.location.pathname.split('/').slice(-2)[0];
        this.visitedProjects = VisitTracker.getVisitedProjects();
    }

    init() {
        // 获取所有项目
        const allProjects = projects;
        
        // 创建项目点
        allProjects.filter(project => project.ispage).forEach(project => {
            const point = this.createProjectPoint(project);
            this.matrixContainer.appendChild(point);
        });

        // 添加到页面
        const footer = document.getElementById('footer');
        document.body.insertBefore(this.container, footer);
    }

    addAxisLabels() {
        const labels = document.createElement('div');
        labels.className = 'axis-labels';

        // X轴标签
        const xLabels = ['NARRATIVE', 'INSTRUMENTAL'];
        xLabels.forEach((text, i) => {
            const label = document.createElement('div');
            label.className = `x-label ${i === 0 ? 'left' : 'right'}`;
            label.textContent = text;
            labels.appendChild(label);
        });

        // Y轴标签
        const yLabels = ['SPECULATIVE', 'PRACTICAL'];
        yLabels.forEach((text, i) => {
            const label = document.createElement('div');
            label.className = `y-label ${i === 0 ? 'top' : 'bottom'}`;
            label.textContent = text;
            labels.appendChild(label);
        });

        this.matrixContainer.appendChild(labels);
    }

    createProjectPoint(project) {
        const pointWrapper = document.createElement('div');
        pointWrapper.className = 'point-wrapper';
        
        // 添加标题元素
        const title = document.createElement('div');
        title.className = 'point-title';
        title.textContent = project.title;
        pointWrapper.appendChild(title);
        
        // 创建链接包装器
        const linkWrapper = document.createElement('a');
        linkWrapper.href = `../${project.name}/${project.name}.html`;
        linkWrapper.className = 'link-wrapper';
        
        const point = document.createElement('div');
        point.className = 'point';
        
        // 检查是否是已访问的项目
        if (this.visitedProjects.includes(project.name)) {
            point.classList.add('visited');
        }
        
        // 如果是当前项目，添加标签
        if (project.name === this.currentProject) {
            const label = document.createElement('div');
            label.className = 'current-label';
            label.textContent = project.title;
            linkWrapper.appendChild(label);
        }
        
        // 如果是当前项目，添加特殊样式
        if (project.name === this.currentProject) {
            point.classList.add('current');
            linkWrapper.classList.add('current');
        }
        
        // 根据项目的 situate 属性设置位置
        if (project.situate) {
            const { x, y } = project.situate;
            // 确保坐标在 -100 到 100 的范围内
            const clampedX = Math.max(-100, Math.min(100, x));
            const clampedY = Math.max(-100, Math.min(100, y));
            
            // 将 -100~100 的坐标映射到 0~100 的百分比位置
            const percentX = (clampedX + 100) / 2;
            const percentY = (clampedY + 100) / 2;
            
            pointWrapper.style.left = `${percentX}%`;
            pointWrapper.style.top = `${100 - percentY}%`;
        }
        
        linkWrapper.appendChild(point);
        pointWrapper.appendChild(linkWrapper);
        
        // 添加悬停效果
        pointWrapper.addEventListener('mouseenter', (e) => {
            // 如果是当前项目，不添加悬停效果
            if (project.name === this.currentProject) return;
            
            // 创建预览框
            const preview = document.createElement('div');
            preview.className = 'point-preview';
            preview.innerHTML = `
                <img src="../../${project.getGifPath()}" alt="${project.title}">
            `;
            
            // 设置预览框位置
            const previewHeight = 160;
            const offset = 20;
            preview.style.left = `${e.clientX + offset}px`;
            if (project.situate.y > 0) {
                preview.style.top = `${e.clientY + offset}px`;
            } else {
                preview.style.top = `${e.clientY - previewHeight - offset}px`;
            }
            
            document.body.appendChild(preview);
        });
        
        // 移除悬停效果
        pointWrapper.addEventListener('mouseleave', () => {
            const preview = document.querySelector('.point-preview');
            if (preview) {
                preview.remove();
            }
        });
        
        return pointWrapper;
    }

    checkAllProjectsVisited() {
        const visitableProjects = projects.filter(p => p.ispage);
        const visitedProjects = VisitTracker.getVisitedProjects();
        
        // 检查是否所有可访问的项目都被访问过
        const allVisited = visitableProjects.every(p => visitedProjects.includes(p.name));
        
        if (allVisited) {
            // 创建感谢信息
            const thanksMessage = document.createElement('div');
            thanksMessage.className = 'thanks-message';
            thanksMessage.textContent = 'Thanks for visiting';
            
            // 将感谢信息添加到矩阵容器后面
            this.container.appendChild(thanksMessage);
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    const matrix = new RelatedMatrix();
    matrix.init();
}); 