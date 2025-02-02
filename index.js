console.log('Script is running');

import { projects, availableLabels } from './projects/project_info.js';

console.log('Available labels:', availableLabels);
console.log('Projects:', projects);

const buttonSection = document.querySelector('.buttons-section');
const cardSection = document.querySelector('.cards-section');

// 存储选中的过滤条件
let activeFilters = [];  // 初始状态下没有激活的过滤器

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
        buttonSection.appendChild(button);
    });
}

// 生成项目卡片
function createProjectCards() {
    console.log('Creating project cards');
    projects.forEach(project => {
        console.log('Creating card for:', project.title);
        const card = document.createElement('div');
        card.className = 'card';
        project.labels.forEach(label => {
            card.setAttribute(`data-${label.toLowerCase()}`, '');
        });

        // 如果有 myContribution 或 collaborator，就是团队项目
        const workType = (project.myContribution || project.collaborator) ? 'Teamwork' : 'Independent Work';

        card.innerHTML = `
            <a href="${project.youtubeLink}" target="_blank" class="card-image-link">
                <img src="${project.gifImage}" alt="${project.title}">
            </a>
            <div class="card-body">
                <div class="card-title-container">
                    <p class="card-title">${project.title}</p>
                    ${project.youtubeLink ? '<a href="' + project.youtubeLink + '" target="_blank" class="video-icon">►</a>' : ''}
                </div>
                <span class="card-description">${project.subtitle}</span>
                <p class="card-time">${project.time}, ${workType}</p>
                ${project.prize ? `<p class="card-prize">${project.prize}</p>` : ''}
                <div class="card-labels">
                    ${project.labels.map(label => `<span class="card-label">${label}</span>`).join('')}
                </div>
            </div>
        `;
        cardSection.appendChild(card);
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
    
    updateCards();
}

// 更新卡片显示状态
function updateCards() {
    const cards = cardSection.querySelectorAll('.card');
    const pointWrappers = document.querySelectorAll('.point-wrapper');
    
    cards.forEach(card => {
        const isVisible = activeFilters.length === 0 || 
            activeFilters.some(filter => card.hasAttribute(`data-${filter}`));
        
        if (isVisible) {
            card.classList.remove('hide');
        } else {
            card.classList.add('hide');
        }
    });

    pointWrappers.forEach(wrapper => {
        const isVisible = activeFilters.length === 0 || 
            activeFilters.some(filter => wrapper.hasAttribute(`data-${filter}`));
        
        if (isVisible) {
            wrapper.classList.remove('hide');
        } else {
            wrapper.classList.add('hide');
        }
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
        const pointWrapper = document.createElement('div');
        pointWrapper.className = 'point-wrapper';
        
        const point = document.createElement('div');
        point.className = 'project-point';
        
        // 添加项目名称标签
        const label = document.createElement('div');
        label.className = 'point-label';
        label.textContent = `[${project.title}]`;
        
        // 添加与标签相同的数据属性
        project.labels.forEach(label => {
            point.setAttribute(`data-${label.toLowerCase()}`, '');
            pointWrapper.setAttribute(`data-${label.toLowerCase()}`, '');
        });
        
        // 将 -100 到 100 的坐标映射到容器尺寸
        const x = (project.situate.x + 100) / 200 * containerWidth;
        const y = (100 - project.situate.y) / 200 * containerHeight;
        
        pointWrapper.style.left = `${x}px`;
        pointWrapper.style.top = `${y}px`;
        
        // 添加悬停预览
        pointWrapper.addEventListener('mouseenter', (e) => {
            const preview = document.createElement('div');
            preview.className = 'point-preview';
            preview.innerHTML = `<img src="${project.gifImage}" alt="${project.title}">`;
            
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

        pointWrapper.addEventListener('mouseleave', () => {
            const preview = document.querySelector('.point-preview');
            if (preview) {
                preview.remove();
            }
        });
        
        pointWrapper.appendChild(point);
        pointWrapper.appendChild(label);
        container.appendChild(pointWrapper);
    });
}

// 修改视图切换功能
function initViewSwitch() {
    const switchButton = document.querySelector('.switch-view');
    const cardsSection = document.querySelector('.cards-section');
    const coordinateView = document.querySelector('.coordinate-view');
    let isGalleryView = true;
    let pointsCreated = false;

    // 初始化按钮文字
    switchButton.textContent = '⌘';

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
                    activeFilters.some(filter => wrapper.hasAttribute(`data-${filter}`));
                
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