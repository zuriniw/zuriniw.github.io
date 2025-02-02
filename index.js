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
        // 添加标签数据属性
        project.labels.forEach(label => {
            card.setAttribute(`data-${label.toLowerCase()}`, '');
        });


        // 创建图片部分（根据 ispage 决定是否添加链接）
        let imageContent;
        if (project.ispage) {
            imageContent = `
                <a href="${project.getHtmlPath()}" class="card-image-link">
                    <img src="${project.getGifPath()}" alt="${project.title}">
                </a>
            `;
        } else {
            imageContent = `
                <img src="${project.getGifPath()}" alt="${project.title}">
            `;
        }
        
        card.innerHTML = `
            ${imageContent}
            <div class="card-body">
                <div class="card-title-container">
                    <span class="card-title">${project.title}</span>
                    ${project.youtubeLink ? `<a href="${project.youtubeLink}" target="_blank" class="video-icon">▶</a>` : ''}
                </div>
                <div class="card-description">${project.subtitle}</div>
                <div class="card-time">${project.time}, ${project.isteam ? 'Teamwork' : 'Independent Work'}</div>
                ${project.prize ? `<div class="card-prize">${project.prize}</div>` : ''}
                <div class="card-labels">
                    ${project.labels.map(label => `<span class="card-label">${label}</span>`).join('')}
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

// 添加过滤器按钮的悬停事件处理
function addFilterHoverEffects() {
    buttonSection.querySelectorAll('button').forEach(button => {
        button.addEventListener('mouseenter', (e) => {
            const filterName = e.target.textContent;
            
            document.querySelectorAll('.card, .point-wrapper').forEach(element => {
                const hasLabel = element.classList.contains('card') 
                    ? Array.from(element.querySelectorAll('.card-label'))
                        .some(label => label.textContent === filterName)
                    : element.hasAttribute(`data-${filterName.toLowerCase()}`);
                
                if (!hasLabel) {
                    if (element.classList.contains('card')) {
                        // 卡片淡出效果
                        element.querySelector('.card-title').classList.add('card-fade');
                        element.querySelector('.card-description').classList.add('card-fade');
                        element.querySelector('.card-time').classList.add('card-fade');
                        const prizeElement = element.querySelector('.card-prize');
                        if (prizeElement) {
                            prizeElement.classList.add('card-fade');
                        }
                        const videoIcon = element.querySelector('.video-icon');
                        if (videoIcon) {
                            videoIcon.classList.add('card-fade');
                        }
                        element.querySelectorAll('.card-label').forEach(label => {
                            label.classList.add('card-fade');
                        });
                    } else {
                        // 点和标签淡出效果
                        element.classList.add('point-fade');
                    }
                } else if (element.classList.contains('card')) {
                    element.querySelectorAll('.card-label').forEach(label => {
                        if (label.textContent === filterName) {
                            label.classList.add('hover');
                        }
                    });
                }
            });
        });

        button.addEventListener('mouseleave', () => {
            document.querySelectorAll('.card, .point-wrapper').forEach(element => {
                if (element.classList.contains('card')) {
                    element.querySelector('.card-title').classList.remove('card-fade');
                    element.querySelector('.card-description').classList.remove('card-fade');
                    element.querySelector('.card-time').classList.remove('card-fade');
                    const prizeElement = element.querySelector('.card-prize');
                    if (prizeElement) {
                        prizeElement.classList.remove('card-fade');
                    }
                    const videoIcon = element.querySelector('.video-icon');
                    if (videoIcon) {
                        videoIcon.classList.remove('card-fade');
                    }
                    element.querySelectorAll('.card-label').forEach(label => {
                        label.classList.remove('card-fade');
                        label.classList.remove('hover');
                    });
                } else {
                    element.classList.remove('point-fade');
                }
            });
        });
    });
}

// 添加滚动处理逻辑
function initFilterScroll() {
    const filterWrapper = document.querySelector('.filter-wrapper');
    const cardsSection = document.querySelector('.cards-section');
    let filterRect = filterWrapper.getBoundingClientRect();
    let originalTop = filterRect.top + window.pageYOffset;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > originalTop) {
            filterWrapper.classList.add('fixed');
            cardsSection.classList.add('filter-fixed');
        } else {
            filterWrapper.classList.remove('fixed');
            cardsSection.classList.remove('filter-fixed');
        }
    });

    // 当窗口大小改变时重新计算位置
    window.addEventListener('resize', () => {
        filterRect = filterWrapper.getBoundingClientRect();
        originalTop = filterRect.top + window.pageYOffset;
    });
}

// 修改项目点生成功能
function createProjectPoints() {
    const container = document.querySelector('.coordinate-container');
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    projects.forEach(project => {
        const wrapper = document.createElement('div');
        wrapper.className = 'point-wrapper';
        
        // 创建点击区域
        const clickArea = document.createElement('a');
        
        // 构建可能的项目页面路径
        const htmlPath = project.getHtmlPath();
        
        // 检查项目页面是否存在
        fetch(htmlPath)
            .then(response => {
                if (response.ok && project.ispage) {  // 检查 ispage 属性
                    clickArea.href = htmlPath;
                } else {
                    // 如果项目页面不存在，使用视频链接或其他链接
                    clickArea.href = project.youtubeLink || project.otherLink1 || '#';
                    if (project.youtubeLink || project.otherLink1) {
                        clickArea.target = '_blank';
                    }
                }
            })
            .catch(() => {
                // 如果检查失败，使用视频链接或其他链接
                clickArea.href = project.youtubeLink || project.otherLink1 || '#';
                if (project.youtubeLink || project.otherLink1) {
                    clickArea.target = '_blank';
                }
            });

        clickArea.style.textDecoration = 'none';
        clickArea.style.color = 'inherit';

        const point = document.createElement('div');
        point.className = 'project-point';
        clickArea.appendChild(point);

        const label = document.createElement('div');
        label.className = 'point-label';
        label.textContent = project.title;
        clickArea.appendChild(label);
        
        wrapper.appendChild(clickArea);

        // 添加与标签相同的数据属性
        project.labels.forEach(label => {
            point.setAttribute(`data-${label.toLowerCase()}`, '');
            wrapper.setAttribute(`data-${label.toLowerCase()}`, '');
        });
        
        // 将 -100 到 100 的坐标映射到容器尺寸
        const x = (project.situate.x + 100) / 200 * containerWidth;
        const y = (100 - project.situate.y) / 200 * containerHeight;
        
        wrapper.style.left = `${x}px`;
        wrapper.style.top = `${y}px`;
        
        // 添加悬停预览
        wrapper.addEventListener('mouseenter', (e) => {
            const preview = document.createElement('div');
            preview.className = 'point-preview';
            preview.innerHTML = `
                <img src="${project.getGifPath()}" alt="${project.title}">
            `;
            
            // 根据 y 坐标决定预览框的位置
            const previewHeight = 160; // 预览框的大致高度
            const offset = 20; // 与光标的距离
            
            preview.style.left = `${e.clientX + offset}px`;
            if (project.situate.y > 0) {
                preview.style.top = `${e.clientY + offset}px`;
            } else {
                preview.style.top = `${e.clientY - previewHeight - offset}px`;
            }
            
            document.body.appendChild(preview);
        });

        wrapper.addEventListener('mouseleave', () => {
            const preview = document.querySelector('.point-preview');
            if (preview) {
                preview.remove();
            }
        });
        
        container.appendChild(wrapper);
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