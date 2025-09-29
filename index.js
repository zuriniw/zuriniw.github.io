console.log('Script is running');

import { projects, availableLabels, availableCategories } from './projects/project_info.js';
import { Delaunay } from 'https://cdn.jsdelivr.net/npm/d3-delaunay@6/+esm';
import { initMobilePlayer } from './scripts/mbplay.js';

// 获取原始标签名称的函数
function getOriginalLabelName(sanitizedName) {
    return availableLabels.find(label => 
        label.toLowerCase().replace(/\//g, '-') === sanitizedName
    ) || sanitizedName;
}

console.log('Available labels:', availableLabels);
console.log('Projects:', projects);

const buttonSection = document.querySelector('.buttons-section');
const cardSection = document.querySelector('.cards-section');

// 从 sessionStorage 读取过滤器状态
let activeFilters = JSON.parse(sessionStorage.getItem('activeFilters')) || [];

// 存储上次点击的时间和按钮
let lastClickTime = 0;
let lastClickedFilter = null;

// 添加在文件开头的全局变量
let svg = null;

// 添加凹包算法相关的辅助函数
function getPointCoordinates(point) {
    const rect = point.getBoundingClientRect();
    const container = document.querySelector('.coordinate-container');
    const containerRect = container.getBoundingClientRect();
    // 使用相对于容器的坐标
    const x = rect.left - containerRect.left + rect.width / 2;
    const y = rect.top - containerRect.top + rect.height / 2;
    
    // 添加调试信息
    console.log('Point coordinates:', { x, y });
    return { x, y };
}

function computeConcaveHull(points, alpha = 100) {
    // 确保只处理 4 个或更多点的情况
    if (points.length < 4) {
        console.warn('computeConcaveHull should only be called with 4 or more points');
        return points;
    }
    
    const coords = points.map(p => [p.x, p.y]);
    const delaunay = Delaunay.from(coords);
    
    const edgeCounts = new Map();
    
    for (let i = 0; i < delaunay.triangles.length; i += 3) {
        const a = delaunay.triangles[i];
        const b = delaunay.triangles[i + 1];
        const c = delaunay.triangles[i + 2];
        
        const ax = coords[a][0], ay = coords[a][1];
        const bx = coords[b][0], by = coords[b][1];
        const cx = coords[c][0], cy = coords[c][1];
        const radius = circumradius(ax, ay, bx, by, cx, cy);
        
        if (radius <= alpha) {
            processEdge(a, b, edgeCounts);
            processEdge(b, c, edgeCounts);
            processEdge(c, a, edgeCounts);
        }
    }
    
    const contourEdges = [];
    for (const [key, count] of edgeCounts) {
        if (count === 1) {
            const [a, b] = key.split(',').map(Number);
            contourEdges.push({ a, b });
        }
    }
    
    return edgesToContour(contourEdges, points);
}

function circumradius(ax, ay, bx, by, cx, cy) {
    const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
    if (d === 0) return Infinity;
    
    const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
    const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
    return Math.hypot(ax - ux, ay - uy);
}

function processEdge(a, b, edgeCounts) {
    const key = a < b ? `${a},${b}` : `${b},${a}`;
    edgeCounts.set(key, (edgeCounts.get(key) || 0) + 1);
}

function edgesToContour(edges, points) {
    if (edges.length === 0) return [];
    
    const adjacency = {};
    edges.forEach(({ a, b }) => {
        adjacency[a] = adjacency[a] || [];
        adjacency[a].push(b);
        adjacency[b] = adjacency[b] || [];
        adjacency[b].push(a);
    });
    
    const contours = [];
    const visited = new Set();
    
    Object.keys(adjacency).forEach(startStr => {
        const start = parseInt(startStr, 10);
        if (visited.has(start)) return;
        
        let current = start;
        const contour = [];
        let prev = -1;
        
        while (true) {
            contour.push(current);
            visited.add(current);
            
            const neighbors = adjacency[current];
            if (!neighbors || neighbors.length === 0) break;
            
            let next = neighbors.find(n => n !== prev);
            if (next === undefined) next = neighbors[0];
            
            adjacency[current] = neighbors.filter(n => n !== next);
            adjacency[next] = adjacency[next].filter(n => n !== current);
            
            prev = current;
            current = next;
            
            if (current === start) {
                contour.push(current);
                break;
            }
        }
        
        contours.push(contour);
    });
    
    const mainContour = contours.reduce((max, c) => c.length > max.length ? c : max, []);
    const uniqueIndices = [...new Set(mainContour)];
    const contourPoints = uniqueIndices.map(i => points[i]);
    
    if (contourPoints.length > 0 && !pointsEqual(contourPoints[0], contourPoints[contourPoints.length - 1])) {
        contourPoints.push(contourPoints[0]);
    }
    
    return contourPoints;
}

function pointsEqual(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}

function drawHull(points) {
    if (!svg || points.length < 2) return;  // 至少需要两个点
    
    console.log(`Drawing hull with ${points.length} points:`);
    points.forEach((p, i) => {
        console.log(`Point ${i + 1}: x=${p.x.toFixed(2)}, y=${p.y.toFixed(2)}`);
    });
    
    const existingPath = svg.querySelector('path');
    if (existingPath) existingPath.remove();
    
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    let d;
    
    // 根据点的数量选择不同的绘制方式
    if (points.length === 2) {
        console.log('Drawing a line between two points');
        // 两点情况：直接连线
        d = `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    } else if (points.length === 3) {
        console.log('Drawing a triangle');
        // 三点情况：直接画三角形
        d = `M ${points[0].x} ${points[0].y} 
             L ${points[1].x} ${points[1].y} 
             L ${points[2].x} ${points[2].y} Z`;
    } else {
        console.log('Computing concave hull');
        // 更多点的情况：使用凹包算法
        const alpha = 5250;
        const hull = computeConcaveHull(points, alpha);
        console.log('Concave hull points:', hull.length);
        d = `M ${hull[0].x} ${hull[0].y}`;
        
        for (let i = 1; i < hull.length; i++) {
            const { x, y } = hull[i];
            d += ` L ${x} ${y}`;
        }
        d += ' Z';
    }
    
    console.log('Path data:', d);
    path.setAttribute('d', d);
    
    svg.appendChild(path);
}

// 生成过滤器按钮
function createFilterButtons() {
    
    // 首先获取或创建 filter-wrapper
    let filterWrapper = document.querySelector('.filter-wrapper');
    if (!filterWrapper) {
        console.error('Filter wrapper not found in DOM');
        return;
    }

    // 添加移动端提示文字
    let tips = document.querySelector('.mobile-tips');
    if (!tips) {
        tips = document.createElement('div');
        tips.className = 'mobile-tips';
        tips.innerHTML = `placeholder`;
        filterWrapper.insertBefore(tips, filterWrapper.firstChild);
    }

    // 创建过滤器按钮
    availableLabels.forEach(label => {
        console.log('Creating button for:', label);
        const button = document.createElement('button');
        // Use the original label as the data-name attribute
        button.setAttribute('data-name', label.toLowerCase());
        button.textContent = label;
        // Use sanitized version for checking active filters
        const sanitizedLabel = label.toLowerCase().replace(/\//g, '-');
        // 为按钮添加 data-filters 属性
        button.setAttribute('data-filters', sanitizedLabel);
        if (activeFilters.includes(sanitizedLabel)) {
            button.classList.add('active');
        }
        buttonSection.appendChild(button);
    });

    // 初始化时应用过滤器
    updateCards();
    // 初始化时更新交集图例
    if (activeFilters.length > 0) {
        updateIntersectionLegend();
    }
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
            // Sanitize the label by replacing forward slashes with hyphens
            const sanitizedLabel = label.toLowerCase().replace(/\//g, '-');
            card.setAttribute(`data-${sanitizedLabel}`, '');
        });
        // 只有 ispage 为 true 的项目才添加点击事件和指针样式
        if (project.ispage) {
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => {
                const projectPath = project.getHtmlPath();
                window.location.href = projectPath;
                console.log('Opening project at:', projectPath);  
            });
        } else {
            card.style.cursor = 'url(images/closedhand.svg) 10 10, auto';

        }

        // 创建图片链接
        const imageLink = document.createElement('a');
        imageLink.className = 'card-image-link';
        // 只有 ispage 为 true 的项目才添加链接
        if (project.ispage) {
            imageLink.href = project.getHtmlPath();
        } else {
            imageLink.style.pointerEvents = 'none';  // 禁用链接点击
        }
        
        // 创建图片容器
        const imageContainer = document.createElement('div');
        imageContainer.className = 'card-image-container';
        
        // 创建图片元素
        const image = document.createElement('img');
        image.src = project.getGifPath();
        image.alt = project.title;
        
        imageContainer.appendChild(image);
        imageLink.appendChild(imageContainer);
        card.appendChild(imageLink);

        card.innerHTML = `
            ${imageLink.outerHTML}
            <div class="card-body">
                <div class="card-title-container">
                    <h3 class="card-title">${project.title}</h3>
                    ${project.youtubeLink ? '<span class="video-icon"></span>' : ''}
                </div>
                <p class="card-time">
                    ${project.time}
                    ${project.isteam ? ' | Team' : ' | Solo Work'}
                </p>
                <div class="card-labels">
                    ${project.labels.map(label => `<span class="label">${label}</span>`).join('')}
                </div>
            </div>
        `;

        // 添加卡片悬停效果
        card.addEventListener('mouseenter', () => {
            const buttons = document.querySelectorAll('.buttons-section button');
            buttons.forEach(button => {
                const buttonFilter = button.getAttribute('data-name').toLowerCase().replace(/\//g, '-');
                if (card.hasAttribute(`data-${buttonFilter}`)) {
                    button.classList.add('point-hover');
                }
            });
        });

        card.addEventListener('mouseleave', () => {
            const buttons = document.querySelectorAll('.buttons-section button');
            buttons.forEach(button => {
                button.classList.remove('point-hover');
            });
        });
        
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
    // Get the original filter name and sanitize it
    const clickedFilter = e.target.getAttribute('data-name');
    const sanitizedFilter = clickedFilter.replace(/\//g, '-');
    const currentTime = new Date().getTime();
    
    if (lastClickedFilter === clickedFilter && currentTime - lastClickTime < 300) {
        activeFilters = [sanitizedFilter];
        // 更新所有按钮状态
        buttonSection.querySelectorAll('button').forEach(btn => {
            if (btn.getAttribute('data-name') === clickedFilter) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    } else {
        if (activeFilters.includes(sanitizedFilter)) {
            activeFilters = activeFilters.filter(filter => filter !== sanitizedFilter);
            e.target.classList.remove('active');
        } else {
            activeFilters.push(sanitizedFilter);
            e.target.classList.add('active');
        }
    }
    
    // 更新最后点击的时间和按钮
    lastClickTime = currentTime;
    lastClickedFilter = clickedFilter;
    
    // 保存过滤器状态到 sessionStorage
    sessionStorage.setItem('activeFilters', JSON.stringify(activeFilters));
    
    updateCards();

    // 只在坐标轴视图中更新图例
    const currentView = sessionStorage.getItem('currentView') || 'gallery';
    if (currentView === 'coordinate') {
        updateIntersectionLegend();
    }
}

// 更新卡片显示状态
function updateCards() {
    const cards = cardSection.querySelectorAll('.card');
    const pointWrappers = document.querySelectorAll('.point-wrapper');
    const columnCards = document.querySelectorAll('.column-project-card');
    
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
    
    // 更新列视图的卡片
    columnCards.forEach(card => {
        const hasMatchingFilter = activeFilters.length === 0 || 
            activeFilters.some(filter => card.hasAttribute(`data-${filter.toLowerCase()}`));
        
        if (hasMatchingFilter) {
            card.classList.remove('hide');
        } else {
            card.classList.add('hide');
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
            // The filter name is already sanitized at this point
            const labelAttr = `data-${filter}`;
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

    // 只在选择2个或3个过滤器时显示交集
    if (activeFilters.length === 2 || activeFilters.length === 3) {
        // 获取所有卡片及其项目信息
        const cards = cardSection.querySelectorAll('.card');
        const cardsWithProjects = Array.from(cards).map(card => {
            const cardTitle = card.querySelector('.card-title').textContent;
            const project = projects.find(p => p.title === cardTitle);
            return { card, project };
        });

        let intersectionInfo = [];
        let intersectionSets = []; // 存储每个交集组合的项目集合

        // 清除所有现有的交集样式
        const points = document.querySelectorAll('.project-point');
        points.forEach(point => {
            point.classList.remove('intersection-1', 'intersection-2', 'intersection-3');
        });

        // 如果正好有2个过滤器，只显示这2个过滤器的交集
        if (activeFilters.length === 2) {
            const [filter1, filter2] = activeFilters;
            const commonProjects = cardsWithProjects
                .filter(({ card }) => 
                    card.hasAttribute(`data-${filter1}`) && 
                    card.hasAttribute(`data-${filter2}`))
                .map(({ project }) => project.title);

            if (commonProjects.length > 0) {
                intersectionInfo.push(`${filter1} && ${filter2}: ${commonProjects.join(', ')}`);
                intersectionSets.push(new Set(commonProjects));
            }
        }

        // 如果有3个过滤器，显示两两之间的交集（3种组合）
        if (activeFilters.length === 3) {
            const [filter1, filter2, filter3] = activeFilters;
            
            // 计算三种两两组合的交集
            const pairs = [
                [filter1, filter2],
                [filter1, filter3],
                [filter2, filter3]
            ];

            pairs.forEach(([f1, f2]) => {
                const commonProjects = cardsWithProjects
                    .filter(({ card }) => 
                        card.hasAttribute(`data-${f1}`) && 
                        card.hasAttribute(`data-${f2}`))
                    .map(({ project }) => project.title);

                if (commonProjects.length > 0) {
                    intersectionInfo.push(`${f1} && ${f2}: ${commonProjects.join(', ')}`);
                    intersectionSets.push(new Set(commonProjects));
                }
            });
        }

        // 在控制台打印交集信息
        if (intersectionInfo.length > 0) {
            console.log('Filter Intersections:');
            intersectionInfo.forEach(info => console.log(info));
        }

        // 更新坐标轴视图中点的样式
        const pointWrappers = document.querySelectorAll('.point-wrapper');
        pointWrappers.forEach(wrapper => {
            const pointTitle = wrapper.querySelector('.point-label').textContent;
            const projectPoint = wrapper.querySelector('.project-point');
            if (!projectPoint) return;
            
            // 首先清除所有之前的交集样式
            projectPoint.classList.remove('intersection-1', 'intersection-2', 'intersection-3', 'intersection-full');
            
            if (activeFilters.length === 3) {
                // 检查是否在三重交集中
                const [filter1, filter2, filter3] = activeFilters;
                const isInTripleIntersection = wrapper.hasAttribute(`data-${filter1}`) && 
                    wrapper.hasAttribute(`data-${filter2}`) && 
                    wrapper.hasAttribute(`data-${filter3}`);

                if (isInTripleIntersection) {
                    // 如果在三重交集中，使用实心黑点样式
                    projectPoint.classList.add('intersection-full');
                    return;
                }
            }
            
            // 检查是否在双重交集中
            intersectionSets.forEach((projectSet, index) => {
                if (projectSet.has(pointTitle)) {
                    projectPoint.classList.add(`intersection-${index + 1}`);
                }
            });
        });
    } else {
        // 如果不是2个或3个过滤器，清除所有交集样式
        const points = document.querySelectorAll('.project-point');
        points.forEach(point => {
            point.classList.remove('intersection-1', 'intersection-2', 'intersection-3');
        });
    }
}

// 添加过滤器按钮的悬停效果
function addFilterHoverEffects() {
    const buttons = document.querySelectorAll('.buttons-section button');
    const cards = document.querySelectorAll('.card');
    const points = document.querySelector('.coordinate-view').querySelectorAll('.point-wrapper');
    const container = document.querySelector('.coordinate-container');
    
    // 根据当前过滤器状态设置点的初始可见性
    points.forEach(point => {
        point.classList.remove('fade-out');
        // 检查是否应该隐藏这个点
        const hasMatchingFilter = activeFilters.length === 0 || 
            activeFilters.some(filter => point.hasAttribute(`data-${filter.toLowerCase()}`));
        if (!hasMatchingFilter) {
            point.classList.add('hide');
        } else {
            point.classList.remove('hide');
        }
    });
    
    // 创建 SVG 元素
    if (!svg) {
        svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.style.position = 'absolute';
        svg.style.top = '0';
        svg.style.left = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        
        const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        
        // 创建第一个滤镜 (noiseFilter)
        const filter1 = createNoiseFilter("noiseFilter");
        
        // 创建第二个滤镜 (noiseFilter2)
        const filter2 = createNoiseFilter("noiseFilter2", {
            baseFrequency: 0.6,        // 更高的频率会产生更细腻的噪点
            numOctaves: 5,             // 更少的叠加次数会产生更简单的纹理
            type: "turbulence",        // 使用湍流而不是分形噪声
            blendMode: "multiply",     // 使用不同的混合模式
            seed: 2,
            colorMatrix: `
                0 0 0 0 0.5
                0 0 0 0 0.45
                0 0 0 0 0.47
                0 0 0 0.7 0
            `                          // 调整颜色矩阵以改变噪点的外观
        });
        const filter3 = createNoiseFilter("noiseFilter3", {
            baseFrequency: 0.5,        // 更高的频率会产生更细腻的噪点
            numOctaves: 4,             // 更少的叠加次数会产生更简单的纹理
            type: "turbulence",        // 使用湍流而不是分形噪声
            blendMode: "multiply",     // 使用不同的混合模式
            seed: 3,
            colorMatrix: `
                0 0 0 0 0.5
                0 0 0 0 0.45
                0 0 0 0 0.47
                0 0 0 0.7 0
            `                          // 调整颜色矩阵以改变噪点的外观
        });
        const filter4 = createNoiseFilter("noiseFilter4", {
            baseFrequency: 0.6,        // 更高的频率会产生更细腻的噪点
            numOctaves: 6,             // 更少的叠加次数会产生更简单的纹理
            type: "turbulence",        // 使用湍流而不是分形噪声
            blendMode: "multiply",     // 使用不同的混合模式
            seed: 9,
            colorMatrix: `
                0 0 0 0 0.5
                0 0 0 0 0.45
                0 0 0 0 0.47
                0 0 0 0.7 0
            `                          // 调整颜色矩阵以改变噪点的外观
        });

        const filter5 = createNoiseFilter("noiseFilter5", {
            baseFrequency: 0.8,        // 更高的频率会产生更细腻的噪点
            numOctaves: 5,             // 更少的叠加次数会产生更简单的纹理
            type: "turbulence",        // 使用湍流而不是分形噪声
            blendMode: "multiply",     // 使用不同的混合模式
            seed: 5,
            colorMatrix: `
                0 0 0 0 0.5
                0 0 0 0 0.45
                0 0 0 0 0.47
                0 0 0 0.7 0
            `                          // 调整颜色矩阵以改变噪点的外观
        });



        
        defs.appendChild(filter1);
        defs.appendChild(filter2);
        defs.appendChild(filter3);
        defs.appendChild(filter4);
        defs.appendChild(filter5);
        svg.appendChild(defs);
        container.appendChild(svg);
    }

    // 添加长按处理
    let pressTimer;
    let isLongPress = false;
    let preventClick = false;
    let lastTapTime = 0;
    let lastTapButton = null;

    // 跟踪触摸开始时间
    let touchStartTime = 0;

    // 处理点按的函数 - 实现单击切换和双击单选
    const handleTap = (button) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTime;
        
        if (tapLength < 300 && button === lastTapButton) {
            // 双击 - 单选该过滤器
            const buttons = document.querySelectorAll('.buttons-section button');
            buttons.forEach(btn => {
                if (btn !== button) {
                    btn.classList.remove('active');
                    // 确保移除其他按钮的长按样式
                    btn.classList.remove('long-press');
                }
            });
            button.classList.add('active');
            // 确保添加正确的样式
            button.classList.remove('long-press');
            updateFilteredItems();
        } else {
            // 单击 - 切换该过滤器
            button.classList.toggle('active');
            // 确保移除长按样式
            button.classList.remove('long-press');
            updateFilteredItems();
        }
        
        lastTapTime = currentTime;
        lastTapButton = button;
    };

    // 处理按钮效果的函数
    const handleButtonEffect = (button, isActive) => {
        const label = button.textContent.trim();
        const sanitizedLabel = label.toLowerCase().replace(/\//g, '-');
        
        // 只在长按时或桌面端悬停时添加效果
        if (isLongPress || window.matchMedia('(hover: hover)').matches) {
            button.classList.toggle('long-press', isActive);
            
            // 视觉效果
            cards.forEach(card => {
                if (!card.hasAttribute(`data-${sanitizedLabel}`)) {
                    card.classList.toggle('fade-out', isActive);
                } else {
                    const labels = card.querySelectorAll('.label');
                    labels.forEach(labelSpan => {
                        if (labelSpan.textContent.trim() === label) {
                            labelSpan.classList.toggle('label-highlight', isActive);
                        }
                    });
                }
            });

            points.forEach(point => {
                if (!point.hasAttribute(`data-${sanitizedLabel}`)) {
                    point.classList.toggle('fade-out', isActive);
                }
            });
            
            // 添加column视图的hover效果
            const columnCards = document.querySelectorAll('.column-project-card');
            columnCards.forEach(card => {
                if (!card.hasAttribute(`data-${sanitizedLabel}`)) {
                    card.classList.toggle('fade-out', isActive);
                }
            });

            // 获取当前可见的点
            const visiblePoints = Array.from(points).filter(point => 
                !point.classList.contains('fade-out') && 
                !point.classList.contains('hide')
            );

            // 获取匹配的点的坐标并绘制凹包
            const matchingPoints = visiblePoints
                .filter(point => point.hasAttribute(`data-${label.toLowerCase()}`))
                .map(point => getPointCoordinates(point));

            if (isActive) {
                drawHull(matchingPoints);
            } else {
                clearHull();
            }
        }
    };

    // 更新过滤后的项目显示
    const updateFilteredItems = () => {
        const activeFilters = Array.from(document.querySelectorAll('.buttons-section button.active'))
            .map(button => button.textContent.trim().toLowerCase());
        
        cards.forEach(card => {
            const hasAllFilters = activeFilters.every(filter => 
                card.hasAttribute(`data-${filter}`));
            card.classList.toggle('hide', activeFilters.length > 0 && !hasAllFilters);
        });
        
        points.forEach(point => {
            const hasAllFilters = activeFilters.every(filter => 
                point.hasAttribute(`data-${filter}`));
            point.classList.toggle('hide', activeFilters.length > 0 && !hasAllFilters);
        });
    };

    buttons.forEach(button => {
        // 禁用默认的文本选择和上下文菜单
        button.style.webkitUserSelect = 'none';
        button.style.userSelect = 'none';
        button.style.webkitTouchCallout = 'none';

        // 禁用上下文菜单
        button.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // 移动端长按处理
        button.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            touchStartTime = Date.now();
            isLongPress = false;  // 重置长按状态
            
            pressTimer = setTimeout(() => {
                isLongPress = true;
                preventClick = true;
                handleButtonEffect(button, true);

            }, 200);
        }, { passive: false });

        button.addEventListener('touchend', (e) => {
            e.stopPropagation();
            clearTimeout(pressTimer);
            const touchDuration = Date.now() - touchStartTime;
            
            if (touchDuration < 200) {
                // 短按处理
                handleTap(button);
            }
            
            // 只有在之前处于长按状态时才清除效果
            if (isLongPress) {
                handleButtonEffect(button, false);
                isLongPress = false;
            }
            preventClick = false;
        }, { passive: false });

        // 添加 touchmove 处理，确保手指移出按钮区域时取消长按
        button.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const buttonRect = button.getBoundingClientRect();
            
            // 检查手指是否移出按钮区域
            if (
                touch.clientX < buttonRect.left ||
                touch.clientX > buttonRect.right ||
                touch.clientY < buttonRect.top ||
                touch.clientY > buttonRect.bottom
            ) {
                clearTimeout(pressTimer);
                if (isLongPress) {
                    handleButtonEffect(button, false);
                    isLongPress = false;
                }
            }
        });

        button.addEventListener('touchcancel', () => {
            clearTimeout(pressTimer);
            if (isLongPress) {
                handleButtonEffect(button, false);
                isLongPress = false;
            }
        });

        // 桌面端悬停处理
        button.addEventListener('mouseenter', () => {
            handleButtonEffect(button, true);
        });

        button.addEventListener('mouseleave', () => {
            handleButtonEffect(button, false);
        });
    });
}

// 清除凹包的辅助函数
function clearHull() {
    const existingPaths = svg.querySelectorAll('path');
    existingPaths.forEach(path => path.remove());
}


// 隐藏指令列表
function hideInstructionsList() {
    const instructionsList = document.querySelector('.filter-instructions-list');
    if (!instructionsList) return;
    
    // 隐藏列表
    instructionsList.classList.remove('show');
}

// 修改 createNoiseFilter 函数以接受参数配置
function createNoiseFilter(id, config = {}) {
    // 设置默认值
    const {
        baseFrequency = 0.9,
        numOctaves = 8,
        type = "fractalNoise",
        blendMode = "overlay",
        colorMatrix = `
            0 0 0 0 0
            0 0 0 0 0
            0 0 0 0 0
            0 0 0 1 0
        `
    } = config;
    
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filter.setAttribute("id", id);
    filter.setAttribute("x", "0");
    filter.setAttribute("y", "0");
    filter.setAttribute("width", "100%");
    filter.setAttribute("height", "100%");
    filter.setAttribute("filterUnits", "objectBoundingBox");
    filter.setAttribute("primitiveUnits", "userSpaceOnUse");
    
    // 基础噪点生成
    const turbulence = document.createElementNS("http://www.w3.org/2000/svg", "feTurbulence");
    turbulence.setAttribute("type", type);
    turbulence.setAttribute("baseFrequency", baseFrequency);
    turbulence.setAttribute("numOctaves", numOctaves);
    turbulence.setAttribute("result", "noise");
    
    // 颜色混合
    const colorMatrixElement = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
    colorMatrixElement.setAttribute("in", "noise");
    colorMatrixElement.setAttribute("type", "matrix");
    colorMatrixElement.setAttribute("values", colorMatrix);
    colorMatrixElement.setAttribute("result", "coloredNoise");
    
    // 添加合成操作
    const composite = document.createElementNS("http://www.w3.org/2000/svg", "feComposite");
    composite.setAttribute("in", "coloredNoise");
    composite.setAttribute("in2", "SourceGraphic");
    composite.setAttribute("operator", "in");
    composite.setAttribute("result", "maskedNoise");
    
    // 与原图混合
    const blend = document.createElementNS("http://www.w3.org/2000/svg", "feBlend");
    blend.setAttribute("in", "SourceGraphic");
    blend.setAttribute("in2", "maskedNoise");
    blend.setAttribute("mode", blendMode);
    
    filter.appendChild(turbulence);
    filter.appendChild(colorMatrixElement);
    filter.appendChild(composite);
    filter.appendChild(blend);
    
    return filter;
}

// 初始化过滤器滚动效果
function initFilterScroll() {
    const buttonSection = document.querySelector('.buttons-section');
    let filterRect = buttonSection.getBoundingClientRect();  // 改用 let 声明
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

// 创建分类列视图
function createCategoryColumns() {
    const columnContainer = document.querySelector('.column-container');
    if (!columnContainer) return;
    
    // 清空现有内容
    columnContainer.innerHTML = '';
    
    // 定义category的排序顺序
    const categoryOrder = ['blended environment', 'foundamental interaction techniques', 'computational design tools', 'devices', 'architectures and installations'];
    
    // 按指定顺序为每个类别创建一列
    categoryOrder.forEach(category => {
        const column = document.createElement('div');
        column.className = 'category-column';
        column.setAttribute('data-category', category.replace(/\s+/g, '-'));
        
        // 创建类别标题
        const title = document.createElement('div');
        title.className = 'category-title';
        title.textContent = category.toUpperCase();
        
        // 创建项目容器
        const projectsContainer = document.createElement('div');
        projectsContainer.className = 'category-projects';
        
        // 获取属于该类别的项目
        const categoryProjects = projects.filter(project => project.category === category);
        
        // 按weight排序项目
        categoryProjects.sort(compareProjects);
        
        // 为每个项目创建卡片
        categoryProjects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'column-project-card';
            
            // 添加标签数据属性用于过滤
            project.labels.forEach(label => {
                const sanitizedLabel = label.toLowerCase().replace(/\//g, '-');
                projectCard.setAttribute(`data-${sanitizedLabel}`, '');
            });
            
            // 添加点击事件
            if (project.ispage) {
                projectCard.style.cursor = 'pointer';
                projectCard.addEventListener('click', () => {
                    window.location.href = project.getHtmlPath();
                });
            } else {
                projectCard.style.cursor = 'url(images/closedhand.svg) 10 10, auto';
            }
            
            // 创建项目内容
            projectCard.innerHTML = `
                <div class="column-project-image">
                    <img src="${project.getGifPath()}" alt="${project.title}">
                </div>
                <div class="column-project-info">
                    <h4 class="column-project-title">${project.title}</h4>
                </div>
            `;
            
            // 添加卡片悬停效果
            projectCard.addEventListener('mouseenter', () => {
                const buttons = document.querySelectorAll('.buttons-section button');
                buttons.forEach(button => {
                    const buttonFilter = button.getAttribute('data-name').toLowerCase().replace(/\//g, '-');
                    if (projectCard.hasAttribute(`data-${buttonFilter}`)) {
                        button.classList.add('point-hover');
                    }
                });
            });

            projectCard.addEventListener('mouseleave', () => {
                const buttons = document.querySelectorAll('.buttons-section button');
                buttons.forEach(button => {
                    button.classList.remove('point-hover');
                });
            });
            
            projectsContainer.appendChild(projectCard);
        });
        
        column.appendChild(title);
        column.appendChild(projectsContainer);
        columnContainer.appendChild(column);
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
        
        // 添加项目链接数据
        if (project.ispage) {
            pointWrapper.dataset.href = `projects/${project.name}/${project.name}.html`;
        }
        
        // 为每个点添加标签数据属性
        project.labels.forEach(label => {
            // Sanitize the label by replacing forward slashes with hyphens
            const sanitizedLabel = label.toLowerCase().replace(/\//g, '-');
            pointWrapper.setAttribute(`data-${sanitizedLabel}`, '');
        });

        // 添加点击事件
        if (project.ispage) {
            pointWrapper.style.cursor = 'url(images/cross.svg) 10 10, auto';
            // pointWrapper.style.cursor = 'crosshair';
            pointWrapper.addEventListener('click', () => {
                window.location.href = `projects/${project.name}/${project.name}.html`;
            });
        } else if (true) {
            pointWrapper.style.cursor = 'url(images/closedhand.svg) 10 10, auto';
        }

        // 使用百分比定位
        const xPercent = (project.situate.x + 100) / 2;
        const yPercent = (-project.situate.y + 100) / 2;
        
        pointWrapper.style.left = `${xPercent}%`;
        pointWrapper.style.top = `${yPercent}%`;
        
        // 创建标签和点的元素
        const label = document.createElement('div');
        label.className = project.isflipped ? 'point-label flipped' : 'point-label';
        label.textContent = project.title;

        const point = document.createElement('div');
        point.className = 'project-point';

        // 根据 isflipped 属性决定添加顺序
        if (project.isflipped) {
            pointWrapper.appendChild(label);
            pointWrapper.appendChild(point);
        } else {
            pointWrapper.appendChild(point);
            pointWrapper.appendChild(label);
        }

        // 添加悬停预览和延伸线
        pointWrapper.addEventListener('mouseenter', (e) => {
            const preview = document.createElement('div');
            preview.className = 'point-preview';
            preview.innerHTML = `
                <img src="${project.getGifPath()}" alt="${project.title}">
                <div class="preview-title">${project.subtitle}</div>
            `;
            
            // 根据 y 坐标决定预览框的位置
            const previewHeight = 160; // 预览框的大致高度
            const previewWidth = 214;  // 预览框的宽度
            const offset = 20; // 与光标的距离
            
            // 根据点的 x 坐标决定预览框的水平位置
            if (project.situate.x > 0) {
                preview.style.left = `${e.clientX - previewWidth - offset}px`;  // 显示在左边
            } else {
                preview.style.left = `${e.clientX + offset}px`;  // 显示在右边
            }
            
            // 根据点的 y 坐标决定预览框的垂直位置
            if (project.situate.y > 0) {  // 如果点在坐标系上半部分
                preview.style.top = `${e.clientY + offset}px`;
            } else {
                preview.style.top = `${e.clientY - previewHeight - offset}px`;
            }
            
            // 添加按钮hover效果
            const buttons = document.querySelectorAll('.buttons-section button');
            buttons.forEach(button => {
                const buttonFilter = button.getAttribute('data-name').toLowerCase().replace(/\//g, '-');
                if (pointWrapper.hasAttribute(`data-${buttonFilter}`)) {
                    button.classList.add('point-hover');
                }
            });
            
            document.body.appendChild(preview);
            
            // 添加延伸线
            const container = document.querySelector('.coordinate-container');
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
            const x = (project.situate.x + 100) * containerWidth / 200;
            const pointRect = pointWrapper.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const y = pointRect.top - containerRect.top;
            
            // 创建横向延伸线（到y轴）
            const horizontalLine = document.createElement('div');
            horizontalLine.className = 'extension-line horizontal';
            horizontalLine.style.top = `${y}px`;
            horizontalLine.style.transform = 'translateY(-50%)';
            
            // 如果点在y轴右边
            if (project.situate.x > 0) {
                horizontalLine.style.left = `${containerWidth/2}px`;
                horizontalLine.style.width = `${x - containerWidth/2}px`;
            } else {
                horizontalLine.style.left = `${x}px`;
                horizontalLine.style.width = `${containerWidth/2 - x}px`;
            }
            
            // 创建竖向延伸线（到x轴）
            const verticalLine = document.createElement('div');
            verticalLine.className = 'extension-line vertical';
            verticalLine.style.left = `${x}px`;
            verticalLine.style.transform = 'translateX(-50%)';
            
            // 如果点在x轴上方
            if (project.situate.y > 0) {
                verticalLine.style.top = `${y}px`;
                verticalLine.style.height = `${containerHeight/2 - y}px`;
            } else {
                verticalLine.style.top = `${containerHeight/2}px`;
                verticalLine.style.height = `${y - containerHeight/2}px`;
            }
            
            container.appendChild(horizontalLine);
            container.appendChild(verticalLine);
            
            // 存储延伸线引用以便移除
            pointWrapper.extensionLines = [horizontalLine, verticalLine];
        });

        // 修改后的 mouseleave 事件处理（增加强制重绘逻辑）
        pointWrapper.addEventListener('mouseleave', () => {
            // 恢复按钮的原始状态
            const buttons = document.querySelectorAll('.buttons-section button');
            buttons.forEach(button => {
                const buttonFilter = button.getAttribute('data-name').toLowerCase().replace(/\//g, '-');
                // 移除point-hover类
                if (pointWrapper.hasAttribute(`data-${buttonFilter}`)) {
                    button.classList.remove('point-hover');
                }
            });
            clearAllPreviews();
        });
                
        container.appendChild(pointWrapper);
    });

        

    // 初始化移动端播放器
    initMobilePlayer();
}

function initViewSwitch() {
    const switchButton = document.querySelector('.switch-view');
    const switchContainer = document.querySelector('.switch-container');
    const cardsSection = document.querySelector('.cards-section');
    const coordinateView = document.querySelector('.coordinate-view');
    const columnView = document.querySelector('.column-view');
    // 根据当前屏幕尺寸决定默认视图，移动端默认为 'column'，桌面端默认为 'gallery'
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    const defaultView = isMobile ? 'column' : 'gallery';
    // 优先使用当前屏幕尺寸对应的默认视图，而不是保存的状态
    let currentView = defaultView;
    // 只在同一设备类型下保持用户的选择
    const savedView = sessionStorage.getItem('currentView');
    const savedDeviceType = sessionStorage.getItem('deviceType');
    const currentDeviceType = isMobile ? 'mobile' : 'desktop';
    
    if (savedView && savedDeviceType === currentDeviceType) {
        currentView = savedView;
    }
    // 保存当前设备类型
    sessionStorage.setItem('deviceType', currentDeviceType);
    let pointsCreated = false;
    let columnsCreated = false;

    // 更新视图状态的函数
    const updateViewState = (view) => {
        const switchLabel = document.querySelector('.switch-label');
        
        // 隐藏所有视图
        cardsSection.classList.add('hide');
        columnView.classList.add('hide');
        coordinateView.classList.add('hide');
        
        // 隐藏图例
        const legend = document.querySelector('.intersection-legend');
        if (legend) {
            legend.classList.remove('show');
        }
        
        // 根据视图模式显示相应的内容和按钮
        switch(view) {
            case 'gallery':
                cardsSection.classList.remove('hide');
                switchButton.innerHTML = '<img src="images/column.svg" alt="Column Icon">';
                if (switchLabel) {
                    switchLabel.textContent = 'Column\nView';
                }
                break;
            case 'column':
                columnView.classList.remove('hide');
                switchButton.innerHTML = '<img src="images/matrix.svg" alt="Matrix Icon">';
                if (switchLabel) {
                    switchLabel.textContent = 'Map\nView';
                }
                break;
            case 'coordinate':
                coordinateView.classList.remove('hide');
                switchButton.innerHTML = '<img src="images/gallery.svg" alt="Gallery Icon">';
                if (switchLabel) {
                    switchLabel.textContent = 'Gallery\nView';
                }
                // 如果有活动的过滤器且是2个或3个，则显示图例
                if (activeFilters.length === 2 || activeFilters.length === 3) {
                    updateIntersectionLegend();
                }
                break;
        }
    };

    // 初始状态设置
    updateViewState(currentView);
    if (currentView === 'coordinate') {
        createProjectPoints();
        pointsCreated = true;
    } else if (currentView === 'column') {
        createCategoryColumns();
        columnsCreated = true;
    }

    // 提取视图切换逻辑为独立函数
    function switchToNextView() {
        switch(currentView) {
            case 'gallery':
                currentView = 'column';
                if (!columnsCreated) {
                    createCategoryColumns();
                    columnsCreated = true;
                }
                break;
            case 'column':
                currentView = 'coordinate';
                if (!pointsCreated) {
                    createProjectPoints();
                    pointsCreated = true;
                }
                // 更新点的可见性
                const pointWrappers = document.querySelectorAll('.point-wrapper');
                pointWrappers.forEach(wrapper => {
                    const isVisible = activeFilters.length === 0 || 
                        activeFilters.some(filter => wrapper.hasAttribute(`data-${filter.toLowerCase()}`));
                    wrapper.classList.toggle('hide', !isVisible);
                });
                break;
            case 'coordinate':
                currentView = 'gallery';
                break;
        }
        
        // 保存视图状态到 sessionStorage
        sessionStorage.setItem('currentView', currentView);
        // 保存设备类型以便下次访问时判断
        const isMobileNow = window.matchMedia('(max-width: 900px)').matches;
        sessionStorage.setItem('deviceType', isMobileNow ? 'mobile' : 'desktop');
        // 应用新的视图状态
        updateViewState(currentView);
    }

    function switchToPrevView() {
        switch(currentView) {
            case 'gallery':
                currentView = 'coordinate';
                if (!pointsCreated) {
                    createProjectPoints();
                    pointsCreated = true;
                }
                // 更新点的可见性
                const pointWrappers = document.querySelectorAll('.point-wrapper');
                pointWrappers.forEach(wrapper => {
                    const isVisible = activeFilters.length === 0 || 
                        activeFilters.some(filter => wrapper.hasAttribute(`data-${filter.toLowerCase()}`));
                    wrapper.classList.toggle('hide', !isVisible);
                });
                break;
            case 'column':
                currentView = 'gallery';
                break;
            case 'coordinate':
                currentView = 'column';
                if (!columnsCreated) {
                    createCategoryColumns();
                    columnsCreated = true;
                }
                break;
        }
        
        // 保存视图状态到 sessionStorage
        sessionStorage.setItem('currentView', currentView);
        // 保存设备类型以便下次访问时判断
        const isMobileNow = window.matchMedia('(max-width: 900px)').matches;
        sessionStorage.setItem('deviceType', isMobileNow ? 'mobile' : 'desktop');
        // 应用新的视图状态
        updateViewState(currentView);
    }

    // 添加swipe手势处理函数
    function initSwipeGestures() {
        let startX = 0;
        let startY = 0;
        let startTime = 0;
        
        // 获取主要内容区域
        const mainContent = document.body;
        
        mainContent.addEventListener('touchstart', (e) => {
            // 只处理单指触摸
            if (e.touches.length !== 1) return;
            
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            startTime = Date.now();
        }, { passive: true });
        
        mainContent.addEventListener('touchend', (e) => {
            // 只处理单指触摸
            if (e.changedTouches.length !== 1) return;
            
            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;
            const endTime = Date.now();
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            const deltaTime = endTime - startTime;
            
            // 检查是否为有效的swipe手势
            const minSwipeDistance = 50; // 最小swipe距离
            const maxSwipeTime = 300; // 最大swipe时间
            const maxVerticalMovement = 100; // 最大垂直移动距离
            
            // 确保是水平swipe且时间和距离合适
            if (Math.abs(deltaX) > minSwipeDistance && 
                Math.abs(deltaY) < maxVerticalMovement && 
                deltaTime < maxSwipeTime) {
                
                // 检查是否在可swipe的区域（避免在filter按钮等交互元素上swipe）
                const target = e.target;
                const isInFilterArea = target.closest('.buttons-section') || 
                                     target.closest('.switch-container') || 
                                     target.closest('.help-icon-container');
                
                if (!isInFilterArea) {
                    if (deltaX > 0) {
                        // 向右swipe - 切换到前一个视图
                        switchToPrevView();
                    } else {
                        // 向左swipe - 切换到下一个视图
                        switchToNextView();
                    }
                }
            }
        }, { passive: true });
    }

    // 为整个switch容器添加点击事件
    switchContainer.addEventListener('click', () => {
        switchToNextView();
    });

    // 添加swipe手势支持
    initSwipeGestures();
    
    // 初始化swipe提示 - 暂时禁用
    // initSwipeHint();
}


// 添加固定过滤器功能
function initFixedFilter() {
    const filterWrapper = document.querySelector('.filter-wrapper');
    const filterRect = filterWrapper.getBoundingClientRect();
    const originalTop = filterRect.top + window.pageYOffset;  // 获取原始位置
    
    // 创建占位元素
    const placeholder = document.createElement('div');
    placeholder.className = 'filter-wrapper-placeholder';
    placeholder.style.height = `${filterRect.height}px`;
    filterWrapper.parentNode.insertBefore(placeholder, filterWrapper);
    
    // 监听滚动事件
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // 检查滚动位置是否超过原始位置
        if (scrollTop > originalTop) {
            filterWrapper.classList.add('fixed');
            placeholder.classList.add('active');
        } else {
            filterWrapper.classList.remove('fixed');
            placeholder.classList.remove('active');
            // 重置 filter wrapper 的位置
            filterWrapper.style.top = '';
        }
    });
    
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
        // 重新计算原始位置和高度
        const newRect = filterWrapper.getBoundingClientRect();
        placeholder.style.height = `${newRect.height}px`;
    });
}

// 添加点击效果
function addClickEffect(e) {
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.style.left = `${e.clientX}px`;
    effect.style.top = `${e.clientY}px`;
    document.body.appendChild(effect);

    // 动画结束后移除元素
    effect.addEventListener('animationend', () => {
        effect.remove();
    });
}

// 添加点击事件监听
document.addEventListener('click', addClickEffect);

// 创建交集图例
function createIntersectionLegend() {
    // 如果已存在图例，先移除
    const existingLegend = document.querySelector('.intersection-legend');
    if (existingLegend) {
        existingLegend.remove();
    }

    const legend = document.createElement('div');
    legend.className = 'intersection-legend';
    
    document.body.appendChild(legend);
    return legend;
}

// 更新图例内容和显示状态
function updateLegend() {
    let legend = document.querySelector('.intersection-legend');
    if (!legend) {
        legend = createIntersectionLegend();
    }

    // 清空现有内容，保留标题
    const title = legend.querySelector('.legend-title');
    legend.innerHTML = '';
    legend.appendChild(title);

    if (activeFilters.length !== 2 && activeFilters.length !== 3) {
        legend.classList.remove('show');
        return;
    }

    // 获取所有卡片及其项目信息
    const cards = document.querySelectorAll('.card');
    const cardsWithProjects = Array.from(cards).map(card => {
        const cardTitle = card.querySelector('.card-title').textContent;
        const project = projects.find(p => p.title === cardTitle);
        return { card, project };
    });

    let intersectionGroups = [];

    // 收集交集组合及其项目
    if (activeFilters.length === 2) {
        const [filter1, filter2] = activeFilters;
        const commonProjects = cardsWithProjects
            .filter(({ card }) => 
                card.hasAttribute(`data-${filter1}`) && 
                card.hasAttribute(`data-${filter2}`))
            .map(({ project }) => project.title);

        if (commonProjects.length > 0) {
            intersectionGroups.push({
                filters: [filter1, filter2],
                projects: commonProjects,
                pattern: 'pattern-1'
            });
        }
    } else if (activeFilters.length === 3) {
        const [filter1, filter2, filter3] = activeFilters;
        const pairs = [
            { filters: [filter1, filter2], pattern: 'pattern-1' },
            { filters: [filter1, filter3], pattern: 'pattern-2' },
            { filters: [filter2, filter3], pattern: 'pattern-3' }
        ];

        pairs.forEach(pair => {
            const commonProjects = cardsWithProjects
                .filter(({ card }) => 
                    card.hasAttribute(`data-${pair.filters[0]}`) && 
                    card.hasAttribute(`data-${pair.filters[1]}`))
                .map(({ project }) => project.title);

            if (commonProjects.length > 0) {
                intersectionGroups.push({
                    filters: pair.filters,
                    projects: commonProjects,
                    pattern: pair.pattern
                });
            }
        });
    }

    // 只在有交集组合时显示图例
    if (intersectionGroups.length > 0) {
        intersectionGroups.forEach(group => {
            const groupElement = document.createElement('div');
            groupElement.className = 'legend-item';
            groupElement.innerHTML = `
                <div class="legend-point ${group.pattern}"></div>
                <div class="legend-content">
                    <div class="legend-text">${group.filters.join(' && ')}</div>
                    <div class="legend-projects">${group.projects.join(', ')}</div>
                </div>
            `;
            legend.appendChild(groupElement);
        });
        legend.classList.add('show');
    } else {
        legend.classList.remove('show');
    }
}

// 更新图例内容和显示状态
function updateIntersectionLegend() {
    // 检查当前视图模式
    const currentView = sessionStorage.getItem('currentView') || 'gallery';
    if (currentView !== 'coordinate') {
        // 只在坐标轴视图下显示图例
        const existingLegend = document.querySelector('.intersection-legend');
        if (existingLegend) {
            existingLegend.classList.remove('show');
        }
        return;
    }

    const cards = cardSection.querySelectorAll('.card');
    const cardsWithProjects = Array.from(cards).map(card => {
        const cardTitle = card.querySelector('.card-title').textContent;
        const project = projects.find(p => p.title === cardTitle);
        return { card, project };
    });

    let legend = document.querySelector('.intersection-legend');
    if (!legend) {
        legend = createIntersectionLegend();
    }

    // 清空现有内容
    legend.innerHTML = '';
    
    // 添加标题
    const titleElement = document.createElement('div');
    titleElement.className = 'legend-title';
    titleElement.innerHTML = `
        <div class="legend-title-main">Intersections</div>
        <div class="legend-title-sub">Hover to check them out</div>
    `;
    legend.appendChild(titleElement);

    if (activeFilters.length !== 2 && activeFilters.length !== 3) {
        legend.classList.remove('show');
        return;
    }

    let intersectionGroups = [];

    // 收集交集组合及其项目
    if (activeFilters.length === 2) {
        const [filter1, filter2] = activeFilters;
        const commonProjects = cardsWithProjects
            .filter(({ card }) => 
                card.hasAttribute(`data-${filter1}`) && 
                card.hasAttribute(`data-${filter2}`))
            .map(({ project }) => project.title);

        if (commonProjects.length > 0) {
            intersectionGroups.push({
                filters: [getOriginalLabelName(filter1), getOriginalLabelName(filter2)],
                projects: commonProjects,
                pattern: 'pattern-1'
            });
        }
    } else if (activeFilters.length === 3) {
        const [filter1, filter2, filter3] = activeFilters;
        
        // 首先检查三重交集
        const tripleIntersectionProjects = cardsWithProjects
            .filter(({ card }) => 
                card.hasAttribute(`data-${filter1}`) && 
                card.hasAttribute(`data-${filter2}`) && 
                card.hasAttribute(`data-${filter3}`))
            .map(({ project }) => project.title);

        if (tripleIntersectionProjects.length > 0) {
            intersectionGroups.push({
                filters: [getOriginalLabelName(filter1), getOriginalLabelName(filter2), getOriginalLabelName(filter3)],
                projects: tripleIntersectionProjects,
                pattern: 'pattern-full'
            });
        }

        // 然后检查双重交集
        const pairs = [
            { filters: [filter1, filter2], pattern: 'pattern-1' },
            { filters: [filter1, filter3], pattern: 'pattern-2' },
            { filters: [filter2, filter3], pattern: 'pattern-3' }
        ];

        pairs.forEach(pair => {
            const commonProjects = cardsWithProjects
                .filter(({ card }) => 
                    card.hasAttribute(`data-${pair.filters[0]}`) && 
                    card.hasAttribute(`data-${pair.filters[1]}`))
                .map(({ project }) => project.title);

            if (commonProjects.length > 0) {
                intersectionGroups.push({
                    filters: pair.filters.map(f => getOriginalLabelName(f)),
                    projects: commonProjects,
                    pattern: pair.pattern
                });
            }
        });
    }

    // 只在有交集组合时显示图例
    if (intersectionGroups.length > 0) {
        intersectionGroups.forEach(group => {
            const groupElement = document.createElement('div');
            groupElement.className = 'legend-item';
            
            const pointElement = document.createElement('div');
            pointElement.className = `legend-point ${group.pattern}`;
            
            const contentElement = document.createElement('div');
            contentElement.className = 'legend-content';
            
            const textElement = document.createElement('div');
            textElement.className = 'legend-text';
            textElement.innerHTML = group.filters.join(' && ').split(' && ').map(text => `<span>${text}</span>`).join(' && ');
            
            const projectsElement = document.createElement('div');
            projectsElement.className = 'legend-projects';
            // 每个项目单独一行
            group.projects.forEach(project => {
                const projectDiv = document.createElement('div');
                projectDiv.textContent = project;
                projectsElement.appendChild(projectDiv);
            });
            
            contentElement.appendChild(textElement);
            contentElement.appendChild(projectsElement);
            
            groupElement.appendChild(pointElement);
            groupElement.appendChild(contentElement);
            
            // 添加hover效果
            groupElement.addEventListener('mouseenter', () => {
                // 给相关的filter按钮添加三角效果
                const filterButtons = document.querySelectorAll('.buttons-section button');
                group.filters.forEach(filter => {
                    const sanitizedFilter = filter.toLowerCase().replace(/\//g, '-');
                    filterButtons.forEach(button => {
                        if (button.getAttribute('data-filters') === sanitizedFilter) {
                            button.classList.add('point-hover');
                        }
                    });
                });

                const pointWrappers = document.querySelectorAll('.point-wrapper');
                pointWrappers.forEach(wrapper => {
                    const pointTitle = wrapper.querySelector('.point-label').textContent;
                    if (group.projects.includes(pointTitle)) {
                        // 模拟点悬停效果
                        const preview = document.createElement('div');
                        preview.className = 'point-preview';
                        const project = projects.find(p => p.title === pointTitle);
                        if (project) {
                            preview.innerHTML = `
                                <img src="${project.getGifPath()}" alt="${project.title}">
                                <div class="preview-title">${project.subtitle || ''}</div>
                            `;
                            
                            const point = wrapper.querySelector('.project-point');
                            if (point) {
                                point.classList.add('hover-effect');
                                document.body.appendChild(preview); // 先添加到DOM以获取正确的尺寸
                                requestAnimationFrame(() => {
                                    const rect = point.getBoundingClientRect();
                                    const previewRect = preview.getBoundingClientRect();
                                    
                                    // 计算位置，确保在视口内
                                    let left = rect.right + 15;
                                    let top = rect.top;
                                    
                                    // 如果预览框会超出右边界，则显示在左侧
                                    if (left + previewRect.width > window.innerWidth) {
                                        left = rect.left - previewRect.width - 15;
                                    }
                                    
                                    // 如果预览框会超出底部，则向上调整
                                    if (top + previewRect.height > window.innerHeight) {
                                        top = window.innerHeight - previewRect.height - 15;
                                    }
                                    
                                    preview.style.left = `${left}px`;
                                    preview.style.top = `${top}px`;
                                    
                                    wrapper.dataset.previewId = Date.now(); // 用于跟踪预览
                                });
                            }
                        }
                    } else {
                        wrapper.classList.add('fade-out');
                    }
                });
            });
            
            groupElement.addEventListener('mouseleave', () => {
                // 移除所有filter按钮的三角效果
                const filterButtons = document.querySelectorAll('.buttons-section button');
                group.filters.forEach(filter => {
                    const sanitizedFilter = filter.toLowerCase().replace(/\//g, '-');
                    filterButtons.forEach(button => {
                        if (button.getAttribute('data-filters') === sanitizedFilter) {
                            button.classList.remove('point-hover');
                        }
                    });
                });

                const pointWrappers = document.querySelectorAll('.point-wrapper');
                pointWrappers.forEach(wrapper => {
                    wrapper.classList.remove('fade-out');
                    const point = wrapper.querySelector('.project-point');
                    if (point) {
                        point.classList.remove('hover-effect');
                    }
                    if (wrapper.dataset.previewId) {
                        const previews = document.querySelectorAll('.point-preview');
                        previews.forEach(preview => preview.remove());
                        delete wrapper.dataset.previewId;
                    }
                });
            });
            
            legend.appendChild(groupElement);
        });
        legend.classList.add('show');
    } else {
        legend.classList.remove('show');
    }
}

// 初始化问号图标功能
function initHelpIcon() {
    const helpIcon = document.querySelector('.help-icon');
    if (!helpIcon) return;
    
    // 只在桌面端添加功能
    if (!window.matchMedia('(hover: hover)').matches) return;
    
    let isPinned = false; // 跟踪列表是否被固定
    
    // 点击事件 - 切换固定状态
    helpIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // 防止事件冒泡
        isPinned = !isPinned;
        
        if (isPinned) {
            showInstructionsListFromIcon(helpIcon);
            helpIcon.classList.add('pinned');
        } else {
            hideInstructionsList();
            helpIcon.classList.remove('pinned');
        }
    });
    
    // hover事件 - 只在未固定时生效
    helpIcon.addEventListener('mouseenter', () => {
        if (!isPinned) {
            showInstructionsListFromIcon(helpIcon);
        }
    });
    
    helpIcon.addEventListener('mouseleave', () => {
        if (!isPinned) {
            hideInstructionsList();
        }
    });
    
}

// 从问号图标显示指令列表
function showInstructionsListFromIcon(icon) {
    const instructionsList = document.querySelector('.filter-instructions-list');
    if (!instructionsList) return;
    
    // 获取图标的位置
    const iconRect = icon.getBoundingClientRect();
    
    // 计算列表位置（在图标右边，上端对齐）
    const listLeft = iconRect.right + 8; // 图标右边 + 8px间距
    const listTop = iconRect.top; // 上端对齐
    
    // 设置列表位置
    instructionsList.style.left = `${listLeft}px`;
    instructionsList.style.top = `${listTop}px`;
    
    // 显示列表
    instructionsList.classList.add('show');
}

// 初始化页面
createFilterButtons();
createProjectCards();
addFilterHoverEffects();
initFilterScroll();
initViewSwitch();
createIntersectionLegend();
initHelpIcon();

// 添加过滤器点击事件监听
buttonSection.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', handleFilterClick);
});

// 当页面加载完成时初始化
document.addEventListener('DOMContentLoaded', () => {
    initFilterScroll();
    addFilterHoverEffects();
    initFixedFilter();
    // 如果有已激活的过滤器，更新交集图例
    if (activeFilters.length > 0) {
        updateIntersectionLegend();
    }
});

// 切换按钮 - 现在针对整个switch容器
function addVibrationToSwitchButton() {
    const switchContainer = document.querySelector('.switch-container');
    if (!switchContainer) return; 
    
    // 为移动端添加touch事件处理
    let touchStartTime = 0;
    
    switchContainer.addEventListener('touchstart', (e) => {
        touchStartTime = Date.now();
        // 防止默认行为和事件冒泡
        e.preventDefault();
    }, { passive: false });
    
    switchContainer.addEventListener('touchend', (e) => {
        const touchDuration = Date.now() - touchStartTime;
        
        // 只有在短按时才触发点击（避免长按时意外触发）
        if (touchDuration < 300) {
            // 触发点击事件
            switchContainer.click();
        }
        
        e.preventDefault();
    }, { passive: false });
}

// 在页面加载完成时初始化
document.addEventListener('DOMContentLoaded', () => {
    addVibrationToSwitchButton();
});

// 在文件开头添加全局函数
function clearAllPreviews() {
    // 清除所有预览
    const previews = document.querySelectorAll('.point-preview');
    previews.forEach(preview => preview.remove());
    
    // 清除所有延伸线
    const extensionLines = document.querySelectorAll('.extension-line');
    extensionLines.forEach(line => line.remove());
    
    // 清除所有hover效果
    const points = document.querySelectorAll('.project-point');
    points.forEach(point => point.classList.remove('hover-effect'));
    
    // 清除column卡片的fade-out效果
    const columnCards = document.querySelectorAll('.column-project-card');
    columnCards.forEach(card => card.classList.remove('fade-out'));
}

// 添加页面可见性变化监听
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
        clearAllPreviews();
    }
});

// 添加鼠标移出容器的监听
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.coordinate-container');
    if (container) {
        container.addEventListener('mouseleave', () => {
            clearAllPreviews();
        });
    }
});

// 初始化swipe提示功能
function initSwipeHint() {
    const swipeHint = document.getElementById('swipeHint');
    const swipeHintClose = document.getElementById('swipeHintClose');
    
    if (!swipeHint || !swipeHintClose) return;
    
    // 检查是否已经显示过提示（通过localStorage记录）
    const hasSeenSwipeHint = localStorage.getItem('hasSeenSwipeHint');
    
    // 只在移动端且未见过提示时显示
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    
    if (isMobile && !hasSeenSwipeHint) {
        // 延迟1秒显示提示，让用户先适应界面
        setTimeout(() => {
            swipeHint.classList.add('show');
            
            // 30秒后自动隐藏
            setTimeout(() => {
                hideSwipeHint();
            }, 30000);
            
        }, 1000);
    }
    
    // 点击关闭按钮
    swipeHintClose.addEventListener('click', (e) => {
        e.stopPropagation(); // 防止触发switch容器的点击事件
        hideSwipeHint();
    });
    
    // 隐藏提示框的函数
    function hideSwipeHint() {
        swipeHint.classList.remove('show');
        // 记录用户已经看过提示
        localStorage.setItem('hasSeenSwipeHint', 'true');
    }
    
    // 如果用户进行了swipe操作，也隐藏提示
    let hasSwipedBefore = false;
    
    // 监听触摸事件来检测swipe
    document.body.addEventListener('touchend', (e) => {
        if (!hasSwipedBefore && swipeHint.classList.contains('show')) {
            // 简单检测是否为可能的swipe手势
            const touch = e.changedTouches[0];
            if (touch) {
                hasSwipedBefore = true;
                setTimeout(() => {
                    hideSwipeHint();
                }, 500); // 延迟一点隐藏，让用户看到效果
            }
        }
    }, { passive: true });
}

// 添加键盘事件监听器来处理退格键
document.addEventListener('keydown', (event) => {
    // 检查按下的是否为退格键，且不是在输入框中
    if (event.key === 'Backspace' && 
        !['input', 'textarea'].includes(document.activeElement.tagName.toLowerCase())) {
        // 阻止浏览器的默认退格键行为
        event.preventDefault();
        // 只在有活动过滤器时执行清除操作
        if (activeFilters.length > 0) {
            // 清除所有过滤器
            activeFilters = [];
            // 更新所有按钮状态
            buttonSection.querySelectorAll('button').forEach(btn => {
                btn.classList.remove('active');
            });
            // 保存状态到 sessionStorage
            sessionStorage.setItem('activeFilters', JSON.stringify(activeFilters));
            // 更新显示
            updateCards();
            // 隐藏图例
            const legend = document.querySelector('.intersection-legend');
            if (legend) {
                legend.classList.remove('show');
            }
            // 清除所有交集样式
            const projectPoints = document.querySelectorAll('.project-point');
            projectPoints.forEach(point => {
                point.classList.remove('intersection-1', 'intersection-2', 'intersection-3', 'intersection-full');
            });
        }
    }
});