console.log('Script is running');

import { projects, availableLabels } from './projects/project_info.js';
import { Delaunay } from 'https://cdn.jsdelivr.net/npm/d3-delaunay@6/+esm';

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
                    ${project.youtubeLink ? '<span class="video-icon">▶</span>' : ''}
                </div>
                <p class="card-time">
                    ${project.time}
                    ${project.isteam ? ' -- Team' : ' -- Solo Work'}
                </p>
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
    
    if (lastClickedFilter === clickedFilter && currentTime - lastClickTime < 300) {
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
    
    // 保存过滤器状态到 sessionStorage
    sessionStorage.setItem('activeFilters', JSON.stringify(activeFilters));
    
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
    const container = document.querySelector('.coordinate-container');
    
    // 确保初始状态下所有点都是可见的
    points.forEach(point => {
        point.classList.remove('fade-out');
        point.classList.remove('hide');
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
            baseFrequency: 0.7,        // 更高的频率会产生更细腻的噪点
            numOctaves: 5,             // 更少的叠加次数会产生更简单的纹理
            type: "turbulence",        // 使用湍流而不是分形噪声
            blendMode: "multiply",     // 使用不同的混合模式
            colorMatrix: `
                0 0 0 0 0.5
                0 0 0 0 0.45
                0 0 0 0 0.47
                0 0 0 0.7 0
            `                          // 调整颜色矩阵以改变噪点的外观
        });
        
        defs.appendChild(filter1);
        defs.appendChild(filter2);
        svg.appendChild(defs);
        container.appendChild(svg);
    }

    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            const label = button.textContent.trim();
            
            cards.forEach(card => {
                if (!card.hasAttribute(`data-${label.toLowerCase()}`)) {
                    card.classList.add('fade-out');
                } else {
                    // 找到匹配的标签并添加高亮样式
                    const labels = card.querySelectorAll('.label');
                    labels.forEach(labelSpan => {
                        if (labelSpan.textContent.trim() === label) {
                            labelSpan.classList.add('label-highlight');
                        }
                    });
                }
            });

            points.forEach(point => {
                if (!point.hasAttribute(`data-${label.toLowerCase()}`)) {
                    point.classList.add('fade-out');
                }
            });
            
            // 获取当前可见的点（未被其他过滤器隐藏的点）
            const visiblePoints = Array.from(points).filter(point => 
                !point.classList.contains('fade-out') && 
                !point.classList.contains('hide')
            );
            
            console.log('Currently visible points:', visiblePoints.length);
            
            // 获取匹配的点的坐标并绘制凹包
            const matchingPoints = visiblePoints
                .filter(point => point.hasAttribute(`data-${label.toLowerCase()}`))
                .map(point => getPointCoordinates(point));
            
            console.log(`Points matching ${label}:`, matchingPoints.length);
            console.log('Matching points coordinates:');
            matchingPoints.forEach((p, i) => {
                console.log(`Point ${i + 1}: x=${p.x.toFixed(2)}, y=${p.y.toFixed(2)}, 
                            labels=${visiblePoints[i].getAttributeNames()
                            .filter(attr => attr.startsWith('data-'))
                            .map(attr => attr.slice(5))
                            .join(', ')}`);
            });
            
            drawHull(matchingPoints);
        });

        button.addEventListener('mouseleave', () => {
            cards.forEach(card => {
                card.classList.remove('fade-out');
                // 移除所有标签的高亮样式
                const labels = card.querySelectorAll('.label');
                labels.forEach(labelSpan => {
                    labelSpan.classList.remove('label-highlight');
                });
            });

            points.forEach(point => {
                point.classList.remove('fade-out');
            });

            // 移除凹包路径
            const path = svg.querySelector('path');
            if (path) path.remove();
        });
    });
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
            pointWrapper.style.cursor = 'url(images/cross.svg) 10 10, auto';
            // pointWrapper.style.cursor = 'crosshair';
            pointWrapper.addEventListener('click', () => {
                window.location.href = `projects/${project.name}/${project.name}.html`;
            });
        } else if (true) {
            pointWrapper.style.cursor = 'url(images/closedhand.svg) 10 10, auto';
        }

        // 添加一个函数来更新点的位置
        const updatePosition = () => {
            const container = document.querySelector('.coordinate-container');
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
            
            // 计算点的位置（考虑容器的实际大小）
            const x = (project.situate.x + 100) * containerWidth / 200;
            const y = (-project.situate.y + 100) * containerHeight / 200;
            
            pointWrapper.style.left = `${x}px`;
            pointWrapper.style.top = `${y}px`;
        };
        
        // 初始设置位置
        updatePosition();
        
        // 监听窗口大小变化
        window.addEventListener('resize', updatePosition);

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
            `;
            
            // 根据 y 坐标决定预览框的位置
            const previewHeight = 160; // 预览框的大致高度
            const offset = 20; // 与光标的距离
            
            preview.style.left = `${e.clientX + offset}px`;
            if (project.situate.y > 0) {  // 如果点在坐标系上半部分
                preview.style.top = `${e.clientY + offset}px`;
            } else {
                preview.style.top = `${e.clientY - previewHeight - offset}px`;
            }
            
            document.body.appendChild(preview);
            
            // 添加延伸线
            const container = document.querySelector('.coordinate-container');
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
            
            // 创建横向延伸线（到y轴）
            const horizontalLine = document.createElement('div');
            horizontalLine.className = 'extension-line horizontal';
            horizontalLine.style.top = `${y}px`;
            horizontalLine.style.transform = 'translateY(-50%)';

            // 计算横向延伸线
            if (project.situate.x > 0) {
                horizontalLine.style.left = `${containerWidth/2}px`;  // 从y轴开始
                horizontalLine.style.width = `${x - containerWidth/2}px`;  // 延伸到点
            } else {
                horizontalLine.style.left = `${x}px`;  // 从点开始
                horizontalLine.style.width = `${containerWidth/2 - x}px`;  // 延伸到y轴
            }

            // 创建竖向延伸线（到x轴）
            const verticalLine = document.createElement('div');
            verticalLine.className = 'extension-line vertical';
            verticalLine.style.left = `${x}px`;
            verticalLine.style.transform = 'translateX(-50%)';
            
            // 计算竖向延伸线
            if (project.situate.y > 0) {
                verticalLine.style.top = `${y}px`;  // 从点开始
                verticalLine.style.height = `${containerHeight/2 - y}px`;  // 延伸到x轴
            } else {
                verticalLine.style.top = `${containerHeight/2}px`;  // 从x轴开始
                verticalLine.style.height = `${y - containerHeight/2}px`;  // 延伸到点
            }
            
            container.appendChild(horizontalLine);
            container.appendChild(verticalLine);
            
            // 存储延伸线引用以便移除
            pointWrapper.extensionLines = [horizontalLine, verticalLine];
        });

        pointWrapper.addEventListener('mouseleave', () => {
            const preview = document.querySelector('.point-preview');
            if (preview) {
                preview.remove();
            }
            
            // 移除延伸线
            if (pointWrapper.extensionLines) {
                pointWrapper.extensionLines.forEach(line => line.remove());
                pointWrapper.extensionLines = null;
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
    // 从 sessionStorage 获取视图状态
    let isGalleryView = sessionStorage.getItem('isGalleryView') === 'true';
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
        // 保存视图状态到 sessionStorage
        sessionStorage.setItem('isGalleryView', isGalleryView);
    });
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
        // 如果不是固定状态，更新原始位置
        if (!filterWrapper.classList.contains('fixed')) {
            originalTop = newRect.top + window.pageYOffset;
        }
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
    initFixedFilter();
});