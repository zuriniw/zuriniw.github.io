    import { projects } from '../projects/project_info.js';

    export function initMobilePlayer() {
        if (window.matchMedia('(hover: hover)').matches) return;

        const playerLeft = document.querySelector('.player-left');
        const points = document.querySelectorAll('.point-wrapper');
        console.log('初始化移动播放器，找到点数量:', points.length);
        let draggedPoint = null;
        let dragStartTime = 0;
        const LONG_PRESS_DURATION = 200;  // 长按触发时间
        let dragIndicator = null;
        let currentActivePoint = null;  // 当前激活的点
        let currentProject = null;

        // 添加点击事件处理
        const playerContainer = document.querySelector('.player-container');
        playerContainer.addEventListener('click', () => {
            if (currentProject && currentProject.ispage) {
                window.location.href = `projects/${currentProject.name}/${currentProject.name}.html`;
            }
        });

        points.forEach(point => {
            let startX, startY;
            let isDragging = false;
            let longPressTimer;

            // 创建拖拽指示器
            function createDragIndicator(x, y) {
                dragIndicator = document.createElement('div');
                dragIndicator.className = 'drag-indicator';
                dragIndicator.style.left = `${x}px`;
                dragIndicator.style.top = `${y}px`;
                document.body.appendChild(dragIndicator);
            }

            // 更新拖拽指示器位置
            function updateDragIndicator(x, y) {
                if (dragIndicator) {
                    dragIndicator.style.left = `${x}px`;
                    dragIndicator.style.top = `${y}px`;
                }
            }

            // 移除拖拽指示器
            function removeDragIndicator() {
                if (dragIndicator) {
                    dragIndicator.remove();
                    dragIndicator = null;
                }
            }

            point.addEventListener('touchstart', (e) => {
                console.log('触摸开始');
                e.preventDefault();
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                dragStartTime = Date.now();
                
                // 设置长按定时器
                longPressTimer = setTimeout(() => {
                    console.log('长按触发');
                    isDragging = true;
                    draggedPoint = point;
                    point.classList.add('dragging');
                    
                    createDragIndicator(e.touches[0].clientX, e.touches[0].clientY);
                    
                    if (window.navigator && window.navigator.vibrate) {
                        window.navigator.vibrate(20);
                    }
                }, LONG_PRESS_DURATION);
            }, { passive: false });

            point.addEventListener('touchmove', (e) => {
                if (!isDragging) return;

                updateDragIndicator(e.touches[0].clientX, e.touches[0].clientY);

                const touch = e.touches[0];
                const playerRect = playerLeft.getBoundingClientRect();

                if (touch.clientX >= playerRect.left && 
                    touch.clientX <= playerRect.right && 
                    touch.clientY >= playerRect.top && 
                    touch.clientY <= playerRect.bottom) {
                    
                        const projectTitle = point.querySelector('.point-label').textContent;
                        const project = projects.find(p => p.title === projectTitle);
                        
                        if (project) {
                            // 更新当前项目引用
                            currentProject = project;

                            // 获取项目对应的标签，并为对应的filter按钮添加三角效果
                            const buttons = document.querySelectorAll('.buttons-section button');
                            // 先清除所有按钮的三角效果
                            buttons.forEach(btn => btn.classList.remove('point-hover'));
                            // 为当前项目的标签对应的按钮添加三角效果
                            project.labels.forEach(label => {
                                const sanitizedLabel = label.toLowerCase().replace(/\//g, '-');
                                buttons.forEach(button => {
                                    if (button.getAttribute('data-filters') === sanitizedLabel) {
                                        button.classList.add('point-hover');
                                    }
                                });
                            });                        // 检查当前点是否在视图中可见
                        const projectPoint = point.querySelector('.project-point');
                        const rect = projectPoint.getBoundingClientRect();
                        const isVisible = (
                            rect.top >= 0 &&
                            rect.left >= 0 &&
                            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                        );

                        if (isVisible) {
                            // 如果有之前激活的点且不是当前点，清除其背景色
                            if (currentActivePoint && currentActivePoint !== projectPoint) {
                                currentActivePoint.style.backgroundColor = 'var(--color-background)';
                            }
                            // 更新当前激活点的引用并设置背景色
                            currentActivePoint = projectPoint;
                            projectPoint.style.backgroundColor = 'var(--color-red)';
                            projectPoint.style.border = '1.6px solid var(--color-red)'; 
                        }

                        // 更新左侧预览
                        const preview = playerLeft.querySelector('.player-preview');
                        const gifPath = project.getGifPath();
                        
                        if (preview) {
                            preview.innerHTML = `<img src="${gifPath}" alt="${project.title}">`;
                        } else {
                            const newPreview = document.createElement('div');
                            newPreview.className = 'player-preview';
                            newPreview.innerHTML = `<img src="${gifPath}" alt="${project.title}">`;
                            playerLeft.appendChild(newPreview);
                            requestAnimationFrame(() => {
                                newPreview.classList.add('show');
                            });
                        }

                        // 更新右侧信息
                        const playerRight = document.querySelector('.player-right');
                        playerRight.innerHTML = `
                            <div class="player-info">
                                <div class="player-title">${project.title}</div>
                                <div class="player-subtitle">${project.subtitle}</div>
                            </div>
                        `;
                    }
                } 
            });

            const endDrag = () => {
                console.log('拖拽结束');
                clearTimeout(longPressTimer);
                if (isDragging) {
                    isDragging = false;
                    draggedPoint = null;
                    point.classList.remove('dragging');
                    playerLeft.classList.remove('drag-over');
                    removeDragIndicator();
                    // 清除所有按钮的三角效果
                    const buttons = document.querySelectorAll('.buttons-section button');
                    buttons.forEach(btn => btn.classList.remove('point-hover'));
                    // 不清除 currentActivePoint，保持其引用和背景色
                }
            };

            // 添加点击处理
            point.addEventListener('touchend', (e) => {
                const endTime = Date.now();
                const touchDuration = endTime - dragStartTime;
                
                // 如果是短触摸（点击），且没有拖拽
                if (touchDuration < LONG_PRESS_DURATION && !isDragging) {
                    const projectTitle = point.querySelector('.point-label').textContent;
                    const project = projects.find(p => p.title === projectTitle);
                    if (project && project.ispage) {
                        window.location.href = `projects/${project.name}/${project.name}.html`;
                    }
                }
                
                endDrag();
            });
        });
    }
