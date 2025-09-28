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
        title.textContent = 'Choose your next destination';
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
        const xLabels = ['NARRATIVE', 'TOOLS'];
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
        
        const linkWrapper = document.createElement(project.ispage ? 'a' : 'div');
        linkWrapper.className = 'link-wrapper';
        if (project.ispage) {
            linkWrapper.href = `../../projects/${project.name}/${project.name}.html`;
        }
        
        // 添加标题元素
        const title = document.createElement('div');
        title.className = 'point-title';
        title.textContent = project.title;
        
        const point = document.createElement('div');
        point.className = 'point';
        
        // 检查是否是已访问的项目
        if (this.visitedProjects.includes(project.name)) {
            point.classList.add('visited');
        }
        
        // 如果是当前项目，添加标签和样式
        if (project.name === this.currentProject) {
            const label = document.createElement('div');
            label.className = 'current-label';
            label.textContent = project.title;
            linkWrapper.appendChild(label);
            point.classList.add('current');
            linkWrapper.classList.add('current');
        }
        
        // 先构建DOM结构
        linkWrapper.appendChild(point);
        pointWrapper.appendChild(title);
        pointWrapper.appendChild(linkWrapper);
        
        // 设置位置
        if (project.situate) {
            const { x, y } = project.situate;
            const clampedX = Math.max(-100, Math.min(100, x));
            const clampedY = Math.max(-100, Math.min(100, y));
            const percentX = (clampedX + 100) / 2;
            const percentY = (clampedY + 100) / 2;
            pointWrapper.style.left = `${percentX}%`;
            pointWrapper.style.top = `${100 - percentY}%`;
        }
        
        // 简化的事件处理
        if (window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(hover: none)').matches) {
            console.log('移动端');
            // 移动端：简单的点击跳转
            if (project.ispage && project.name !== this.currentProject) {
                console.log('should can be clicked');
                pointWrapper.addEventListener('touchstart', (e) => {
                    console.log('touchstart');
                    window.location.href = `../../projects/${project.name}/${project.name}.html`;
                });
            }
        } else {
            // 桌面端的预览效果保持不变
            pointWrapper.addEventListener('mouseenter', (e) => {
                if (project.name === this.currentProject) return;
                
                const preview = document.createElement('div');
                preview.className = 'point-preview';
                
                const img = document.createElement('img');
                img.src = `../../${project.getGifPath()}`;
                img.alt = project.subtitle;
                preview.appendChild(img);
                
                const previewTitle = document.createElement('div');
                previewTitle.className = 'preview-title';
                previewTitle.textContent = project.subtitle;
                preview.appendChild(previewTitle);
                
                const previewHeight = 160;
                const offset = 20;
                preview.style.left = `${e.clientX + offset}px`;
                preview.style.top = project.situate.y > 0 
                    ? `${e.clientY + offset}px`
                    : `${e.clientY - previewHeight - offset}px`;
                
                document.body.appendChild(preview);
            });
            
            pointWrapper.addEventListener('mouseleave', () => {
                const preview = document.querySelector('.point-preview');
                if (preview) preview.remove();
            });
        }
        
        return pointWrapper;
    }

    checkAllProjectsVisited() {
        const visitableProjects = projects.filter(p => p.ispage);
        const visitedProjects = VisitTracker.getVisitedProjects();
        
        // 检查是否所有可访问的项目都被访问过
        const allVisited = visitableProjects.every(p => visitedProjects.includes(p.name));
        
        if (allVisited) {
            // 创建感谢信息容器
            const thanksMessage = document.createElement('div');
            thanksMessage.className = 'thanks-message';
            
            // 创建一个空的 span 用于打字效果
            const textSpan = document.createElement('span');
            thanksMessage.appendChild(textSpan);
            
            // 创建省略号容器
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'dots-message';
            dotsContainer.style.opacity = '0';  // 初始隐藏
            
            // 创建可点击的省略号链接
            const dotsLink = document.createElement('a');
            dotsLink.href = '#';
            dotsLink.className = 'dots-link';
            dotsLink.textContent = '......';
            dotsLink.addEventListener('click', (e) => {
                e.preventDefault();
                // 移除点击事件防止重复触发
                dotsLink.style.pointerEvents = 'none';
                
                // 创建第三行文字容器
                const collaborateMessage = document.createElement('div');
                collaborateMessage.className = 'collaborate-message';
                
                // 创建一个空的 span 用于打字效果
                const collaborateSpan = document.createElement('span');
                collaborateMessage.appendChild(collaborateSpan);
                
                // 将新消息添加到容器中
                this.container.appendChild(collaborateMessage);
                
                // 实现打字机效果
                const collaborateText = '?:  I mean... why not be friends?';
                let index = 0;
                const typeInterval = setInterval(() => {
                    if (index < collaborateText.length) {
                        collaborateSpan.textContent += collaborateText[index];
                        index++;
                    } else {
                        clearInterval(typeInterval);
                        // 创建回应文字容器
                        const responseMessage = document.createElement('div');
                        responseMessage.className = 'response-message';
                        responseMessage.style.opacity = '0';
                        
                        // 创建可点击的回应链接
                        const responseLink = document.createElement('a');
                        responseLink.href = '#';
                        responseLink.className = 'response-link';
                        responseLink.textContent = 'I guess I wouldn\'t mind.';
                        responseLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            // 移除点击事件防止重复触发
                            responseLink.style.pointerEvents = 'none';
                            
                            // 创建成就文字容器
                            const achievementMessage = document.createElement('div');
                            achievementMessage.className = 'achievement-message';
                            achievementMessage.style.opacity = '0';
                            
                            // 方法1：创建两个独立的span元素
                            const line1 = document.createElement('span');
                            line1.textContent = '★ Achievement unlocked: [A New Friend]';
                            const line2 = document.createElement('span');
                            line2.textContent = '--> Claim your reward here: ';
                            
                            achievementMessage.appendChild(line1);
                            achievementMessage.appendChild(document.createElement('br')); // 添加换行
                            achievementMessage.appendChild(line2);
                            
                            // 创建链接
                            const rewardLink = document.createElement('a');
                            rewardLink.href = 'https://www.instagram.com/azzuriwey/';  // 替换为实际链接
                            rewardLink.className = 'reward-link';
                            rewardLink.textContent = '█████';
                            rewardLink.target = '_blank';  // 在新标签页打开
                            
                            achievementMessage.appendChild(rewardLink);
                            this.container.appendChild(achievementMessage);
                            
                            // 延迟显示成就文字
                            setTimeout(() => {
                                achievementMessage.style.opacity = '1';
                                achievementMessage.style.transition = 'opacity 0.5s ease';
                            }, 500);
                        });
                        
                        responseMessage.appendChild(responseLink);
                        this.container.appendChild(responseMessage);
                        
                        // 延迟显示回应文字
                        setTimeout(() => {
                            responseMessage.style.opacity = '1';
                            responseMessage.style.transition = 'opacity 0.5s ease';
                        }, 500);
                    }
                }, 100);
            });
            
            dotsContainer.appendChild(dotsLink);
            
            // 将感谢信息添加到矩阵容器后面
            this.container.appendChild(thanksMessage);
            this.container.appendChild(dotsContainer);
            
            // 实现打字机效果
            const text = '?:  Thank you...';
            let index = 0;
            const typeInterval = setInterval(() => {
                if (index < text.length) {
                    textSpan.textContent += text[index];
                    index++;
                } else {
                    clearInterval(typeInterval);
                    // 文字打完后显示省略号
                    setTimeout(() => {
                        dotsContainer.style.opacity = '1';
                        dotsContainer.style.transition = 'opacity 0.5s ease';
                    }, 500);  // 等待500ms后显示省略号
                }
            }, 100);
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    const matrix = new RelatedMatrix();
    matrix.init();
}); 