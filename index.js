console.log('Script is running');

import { projects, availableLabels } from './projects/project_info.js';

console.log('Available labels:', availableLabels);
console.log('Projects:', projects);

const buttonSection = document.querySelector('.buttons-section');
const cardSection = document.querySelector('.cards-section');
const showAllBtn = document.querySelector('.show-all');

// 存储选中的过滤条件
let activeFilters = [];

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
            <img src="${project.gifImage}" alt="${project.title}">
            <div class="card-body">
                <p class="card-title">${project.title}</p>
                <span class="card-description">${project.subtitle}</span>
            </div>
        `;
        cardSection.appendChild(card);
    });
}

// Show All 点击处理
showAllBtn.addEventListener('click', () => {
    const allFilters = Array.from(buttonSection.querySelectorAll('button'))
        .map(btn => btn.getAttribute('data-name'));
    
    // 如果不是所有过滤器都被激活，则激活所有过滤器
    if (activeFilters.length !== allFilters.length || 
        !allFilters.every(filter => activeFilters.includes(filter))) {
        // 激活所有过滤器
        activeFilters = [...allFilters];
        buttonSection.querySelectorAll('button').forEach(btn => btn.classList.add('active'));
    }

    updateCards();
});

// 过滤器点击处理
function handleFilterClick(e) {
    const clickedFilter = e.target.getAttribute('data-name');
    
    if (activeFilters.includes(clickedFilter)) {
        activeFilters = activeFilters.filter(filter => filter !== clickedFilter);
        e.target.classList.remove('active');
    } else {
        activeFilters.push(clickedFilter);
        e.target.classList.add('active');
    }
    
    updateCards();
}

// 更新卡片显示状态
function updateCards() {
    const cards = cardSection.querySelectorAll('.card');
    cards.forEach(card => {
        // 检查卡片是否匹配任何激活的过滤器
        const isVisible = activeFilters.length === 0 || 
            activeFilters.some(filter => card.hasAttribute(`data-${filter}`));
        
        if (isVisible) {
            card.classList.remove('hide');
        } else {
            card.classList.add('hide');
        }
    });
}

// 初始化页面
createFilterButtons();
createProjectCards();

// 添加过滤器点击事件监听
buttonSection.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', handleFilterClick);
});