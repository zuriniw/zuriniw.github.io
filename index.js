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
        // 设置多个标签的数据属性
        project.labels.forEach(label => {
            card.setAttribute(`data-${label.toLowerCase()}`, '');
        });

        card.innerHTML = `
            <a href="${project.youtubeLink}" target="_blank" class="card-image-link">
                <img src="${project.gifImage}" alt="${project.title}">
            </a>
            <div class="card-body">
                <p class="card-title">${project.title}</p>
                <div class="card-labels">
                    ${project.labels.map(label => `<span class="card-label">${label}</span>`).join('')}
                </div>
                <span class="card-description">${project.subtitle}</span>
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
    cards.forEach(card => {
        // 检查卡片是否匹配任何激活的过滤器
        const isVisible = activeFilters.length === 0 ||  // 如果没有激活的过滤器，显示所有卡片
            activeFilters.some(filter => card.hasAttribute(`data-${filter}`));
        
        if (isVisible) {
            card.classList.remove('hide');
        } else {
            card.classList.add('hide');
        }
    });
}

// 添加过滤器按钮的悬停事件处理
function addFilterHoverEffects() {
    buttonSection.querySelectorAll('button').forEach(button => {
        button.addEventListener('mouseenter', (e) => {
            const filterName = e.target.textContent;
            
            // 处理所有卡片
            document.querySelectorAll('.card').forEach(card => {
                // 检查卡片是否包含当前悬停的标签
                const hasLabel = Array.from(card.querySelectorAll('.card-label'))
                    .some(label => label.textContent === filterName);
                
                if (!hasLabel) {
                    // 如果卡片不包含当前标签，添加淡出效果
                    card.querySelector('.card-title').classList.add('card-fade');
                    card.querySelector('.card-description').classList.add('card-fade');
                    card.querySelectorAll('.card-label').forEach(label => {
                        label.classList.add('card-fade');
                    });
                } else {
                    // 如果卡片包含当前标签，高亮显示匹配的标签
                    card.querySelectorAll('.card-label').forEach(label => {
                        if (label.textContent === filterName) {
                            label.classList.add('hover');
                        }
                    });
                }
            });
        });

        button.addEventListener('mouseleave', (e) => {
            const filterName = e.target.textContent;
            
            // 移除所有淡出和高亮效果
            document.querySelectorAll('.card').forEach(card => {
                card.querySelector('.card-title').classList.remove('card-fade');
                card.querySelector('.card-description').classList.remove('card-fade');
                card.querySelectorAll('.card-label').forEach(label => {
                    label.classList.remove('card-fade');
                    label.classList.remove('hover');
                });
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

// 初始化页面
createFilterButtons();
createProjectCards();
addFilterHoverEffects();
initFilterScroll();

// 添加过滤器点击事件监听
buttonSection.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', handleFilterClick);
});