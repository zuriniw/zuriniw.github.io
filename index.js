console.log('Script is running');

import { projects, availableLabels } from './projects/project_info.js';

console.log('Available labels:', availableLabels);
console.log('Projects:', projects);

const buttonSection = document.querySelector('.buttons-section');
const cardSection = document.querySelector('.cards-section');

// 存储选中的过滤条件
let activeFilters = JSON.parse(localStorage.getItem('activeFilters')) || [];  // 从 localStorage 恢复过滤器状态

// 存储上次点击的时间和按钮
let lastClickTime = 0;
let lastClickedFilter = null;

// 生成过滤器按钮
function createFilterButtons() {
    console.log('Creating filter buttons');
    availableLabels.forEach(label => {
        console.log('Creating button for:', label);
        const button = document.createElement('button');
        button.setAttribute('data-name', label.toLowerCase());
        button.textContent = label;
        // 恢复按钮激活状态
        if (activeFilters.includes(label.toLowerCase())) {
            button.classList.add('active');
        }
        buttonSection.appendChild(button);
    });
    // 初始化时应用过滤器
    updateCards();
}

// 项目排序比较函数
function compareProjects(a, b) {
    // 首先按 weight 排序
    const weightDiff = b.weight - a.weight;
    if (weightDiff !== 0) return weightDiff;
    
    // weight 相同时，按时间排序（新的在前）
    const getLatestYear = (time) => {
        const years = time.toString().split('-');
        return parseInt(years[years.length - 1]);
    };
    const timeDiff = getLatestYear(b.time) - getLatestYear(a.time);
    if (timeDiff !== 0) return timeDiff;
    
    // 时间相同时，按项目名称排序（使用项目的唯一标识符）
    return a.name.localeCompare(b.name);
}

// 生成项目卡片
function createProjectCards() {
    console.log('Creating project cards');
    const sortedProjects = [...projects].sort(compareProjects);

    // 使用 Promise.all 确保所有卡片按顺序创建
    Promise.all(sortedProjects.map(project => {
        console.log('Creating card for:', project.title);
        const card = document.createElement('div');
        card.className = 'card';
        card.style.cursor = 'pointer';  // 添加鼠标指针样式
        
        // 添加标签数据属性
        project.labels.forEach(label => {
            card.setAttribute(`data-${label.toLowerCase()}`, '');
        });

        // 添加点击事件
        if (project.ispage) {
            card.addEventListener('click', () => {
                window.location.href = `projects/${project.name}/${project.name}.html`;
            });
        }

        // 创建图片部分（根据 ispage 决定是否添加链接）
        const imageContent = `<img src="${project.getGifPath()}" alt="${project.title}">`;

        card.innerHTML = `
            ${imageContent}
            <div class="card-body">
                <div class="card-title-container">
                    <h3 class="card-title">${project.title}</h3>
                    ${project.youtubeLink ? '<span class="video-icon">▶</span>' : ''}
                </div>
                <p class="card-time">
                    ${project.time}
                    ${project.isteam ? ' -- Team' : ' -- Solo Work'}
                </p>
                <p class="card-description">${project.subtitle}</p>
                <div class="card-labels">
                    ${project.labels.map(label => `<span class="label">${label}</span>`).join('')}
                </div>
            </div>
        `;
        
        return card;
    })).then(cards => {
        // 清空现有卡片
        cardSection.innerHTML = '';
        // 按顺序添加所有卡片
        cards.forEach(card => cardSection.appendChild(card));
        updateCards();
    });
}

// 过滤器点击处理
function handleFilterClick(e) {
    const clickedFilter = e.target.getAttribute('data-name');
    const currentTime = new Date().getTime();
    
    // 检查是否是双击（同一个按钮在300ms内被点击两次）
    if (lastClickedFilter === clickedFilter && currentTime - lastClickTime < 300) {
        // 双击操作：只保留当前过滤器
        activeFilters = [clickedFilter];
        // 更新所有按钮状态
        buttonSection.querySelectorAll('button').forEach(btn => {
            if (btn.getAttribute('data-name') === clickedFilter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    } else {
        // 单击操作：正常的切换逻辑
        if (activeFilters.includes(clickedFilter)) {
            activeFilters = activeFilters.filter(filter => filter !== clickedFilter);
            e.target.classList.remove('active');
        } else {
            activeFilters.push(clickedFilter);
    e.target.classList.add('active');
        }
    }
    
    // 更新最后点击的时间和按钮
    lastClickTime = currentTime;
    lastClickedFilter = clickedFilter;
    
    // 保存过滤器状态到 localStorage
    localStorage.setItem('activeFilters', JSON.stringify(activeFilters));
    
    updateCards();
}

// 更新卡片显示状态
function updateCards() {
    const cards = cardSection.querySelectorAll('.card');
    const pointWrappers = document.querySelectorAll('.point-wrapper');
    
    // 更新数轴视图的点
    pointWrappers.forEach(wrapper => {
        const hasMatchingFilter = activeFilters.length === 0 || 
            activeFilters.some(filter => wrapper.hasAttribute(`data-${filter.toLowerCase()}`));
        
        if (hasMatchingFilter) {
            wrapper.classList.remove('hide');
        } else {
            wrapper.classList.add('hide');
        }
    });

    // 首先获取所有卡片及其对应的项目信息
    const cardsWithProjects = Array.from(cards).map(card => {
        // 使用卡片标题来匹配项目
        const cardTitle = card.querySelector('.card-title').textContent;
        const project = projects.find(p => p.title === cardTitle);
        if (!project) {
            console.error('Project not found for card:', cardTitle);
        }
        return { card, project };
    });

    // 过滤可见卡片
    const visibleCards = cardsWithProjects.filter(({ card, project }) => {
        if (!project) return false;  // 如果找不到项目信息，不显示该卡片
        if (activeFilters.length === 0) return true;
        
        return activeFilters.some(filter => {
            const labelAttr = `data-${filter.toLowerCase()}`;
            return card.hasAttribute(labelAttr);
        });
    });

    // 先重置所有卡片的显示状态
    cardsWithProjects.forEach(({ card }) => {
        card.classList.add('hide');
        card.style.order = '';  // 重置排序
    });

    // 按weight和时间重新排序并显示可见卡片
    visibleCards
        .sort((a, b) => {
            // 确保两个项目都存在
            if (!a.project || !b.project) return 0;
            return compareProjects(a.project, b.project);
        })
        .forEach(({ card }, index) => {
            card.classList.remove('hide');
            card.style.order = index;
        });
}

// 添加过滤器按钮的悬停效果
function addFilterHoverEffects() {
    const buttons = document.querySelectorAll('.buttons-section button');
    const cards = document.querySelectorAll('.card');
    const points = document.querySelector('.coordinate-view').querySelectorAll('.point-wrapper');

    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            const filter = button.textContent.trim();
            if (filter === 'All') return;

            cards.forEach(card => {
                if (!card.hasAttribute(`data-${filter.toLowerCase()}`)) {
                    card.classList.add('fade-out');
                } else {
                    // 找到匹配的标签并添加高亮效果
                    const labels = card.querySelectorAll('.label');
                    labels.forEach(label => {
                        if (label.textContent === filter) {
                            label.classList.add('label-highlight');
                        }
                    });
                }
            });

            points.forEach(point => {
                if (!point.hasAttribute(`data-${filter.toLowerCase()}`)) {
                    point.classList.add('fade-out');
                }
            });
        });

        button.addEventListener('mouseleave', () => {
            cards.forEach(card => {
                card.classList.remove('fade-out');
                // 移除所有标签的高亮效果
                const labels = card.querySelectorAll('.label');
                labels.forEach(label => {
                    label.classList.remove('label-highlight');
                });
            });

            points.forEach(point => {
                point.classList.remove('fade-out');
            });
        });
    });
}

// 初始化过滤器滚动效果
function initFilterScroll() {
    const buttonSection = document.querySelector('.buttons-section');
    const filterRect = buttonSection.getBoundingClientRect();
    let originalTop = filterRect.top + window.pageYOffset;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > originalTop) {
            buttonSection.classList.add('fixed');
            cardSection.classList.add('filter-fixed');
        } else {
            buttonSection.classList.remove('fixed');
            cardSection.classList.remove('filter-fixed');
        }
    });

    // 当窗口大小改变时重新计算位置
    window.addEventListener('resize', () => {
        filterRect = buttonSection.getBoundingClientRect();
        originalTop = filterRect.top + window.pageYOffset;
    });
}

// 修改项目点生成功能
function createProjectPoints() {
    const container = document.querySelector('.coordinate-container');
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    projects.forEach(project => {
        if (!project.situate) return;

        const pointWrapper = document.createElement('div');
        pointWrapper.className = 'point-wrapper';
        
        // 为每个点添加标签数据属性
        project.labels.forEach(label => {
            pointWrapper.setAttribute(`data-${label.toLowerCase()}`, '');
        });

        // 添加点击事件
        if (project.ispage) {
            pointWrapper.style.cursor = 'pointer';
            pointWrapper.addEventListener('click', () => {
                window.location.href = `projects/${project.name}/${project.name}.html`;
            });
        } else if (project.youtubeLink) {
            pointWrapper.style.cursor = 'pointer';
            pointWrapper.addEventListener('click', () => {
                window.open(project.youtubeLink, '_blank');
            });
        }

        // 计算点的位置
        const x = (project.situate.x + 100) * containerWidth / 200;
        const y = (project.situate.y + 100) * containerHeight / 200;
        
        pointWrapper.style.left = `${x}px`;
        pointWrapper.style.top = `${y}px`;
        
        pointWrapper.innerHTML = `
            <div class="project-point"></div>
            <div class="point-label">${project.title}</div>
        `;
        
        // 添加悬停预览
        pointWrapper.addEventListener('mouseenter', (e) => {
            const preview = document.createElement('div');
            preview.className = 'point-preview';
            preview.innerHTML = `
                <img src="${project.getGifPath()}" alt="${project.title}">
            `;
            
            // 根据 y 坐标决定预览框的位置
            const previewHeight = 160; // 预览框的大致高度
            const offset = 20; // 与光标的距离
            
            preview.style.left = `${e.clientX + offset}px`;
            if (project.situate.y < 0) {  // 如果点在坐标系下半部分
                preview.style.top = `${e.clientY + offset}px`;
            } else {
                preview.style.top = `${e.clientY - previewHeight - offset}px`;
            }
            
            document.body.appendChild(preview);
        });

        pointWrapper.addEventListener('mouseleave', () => {
            const preview = document.querySelector('.point-preview');
            if (preview) {
                preview.remove();
            }
        });
        
        container.appendChild(pointWrapper);
    });
}

// 修改视图切换功能
function initViewSwitch() {
    const switchButton = document.querySelector('.switch-view');
    const cardsSection = document.querySelector('.cards-section');
    const coordinateView = document.querySelector('.coordinate-view');
    // 从 localStorage 获取上次的视图状态，默认为 false（数轴视图）
    let isGalleryView = localStorage.getItem('isGalleryView') === 'true';
    let pointsCreated = false;

    // 初始化按钮文字
    switchButton.textContent = isGalleryView ? '⌘' : '∀';

    // 初始化为数轴视图
    if (isGalleryView) {
        cardsSection.classList.remove('hide');
        coordinateView.classList.add('hide');
    } else {
        cardsSection.classList.add('hide');
        coordinateView.classList.remove('hide');
        createProjectPoints();  // 创建项目点
        pointsCreated = true;
    }

    switchButton.addEventListener('click', () => {
        if (isGalleryView) {
            cardsSection.classList.add('hide');
            coordinateView.classList.remove('hide');
            switchButton.textContent = '∀';
            
            if (!pointsCreated) {
                createProjectPoints();
                pointsCreated = true;
            }
            
            // 切换到数轴视图时，应用当前的过滤器状态
            const pointWrappers = document.querySelectorAll('.point-wrapper');
            pointWrappers.forEach(wrapper => {
                const isVisible = activeFilters.length === 0 || 
                    activeFilters.some(filter => wrapper.hasAttribute(`data-${filter.toLowerCase()}`));
                
                if (isVisible) {
                    wrapper.classList.remove('hide');
                } else {
                    wrapper.classList.add('hide');
                }
            });
        } else {
            cardsSection.classList.remove('hide');
            coordinateView.classList.add('hide');
            switchButton.textContent = '⌘';
        }
        isGalleryView = !isGalleryView;
        // 保存视图状态到 localStorage
        localStorage.setItem('isGalleryView', isGalleryView);
    });
}

// 初始化页面
createFilterButtons();
createProjectCards();
addFilterHoverEffects();
initFilterScroll();
initViewSwitch();

// 添加过滤器点击事件监听
buttonSection.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', handleFilterClick);
});

// 当页面加载完成时初始化
document.addEventListener('DOMContentLoaded', () => {
    initFilterScroll();
    addFilterHoverEffects();
});