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
        let currentActivePoint = null;  // 添加当前激活点的引用

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
                e.preventDefault();  // 防止触发其他事件
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                dragStartTime = Date.now();
                
                // 设置长按定时器
                longPressTimer = setTimeout(() => {
                    console.log('长按触发');
                    isDragging = true;
                    draggedPoint = point;
                    point.classList.add('dragging');
                    
                    // 创建拖拽指示器
                    createDragIndicator(e.touches[0].clientX, e.touches[0].clientY);
                    
                    // 触发震动反馈
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
                        // 如果有之前激活的点，恢复其颜色
                        if (currentActivePoint && currentActivePoint !== point.querySelector('.project-point')) {
                            currentActivePoint.style.border = '';
                        }

                        // 检查当前点是否在视图中可见
                        const projectPoint = point.querySelector('.project-point');
                        const rect = projectPoint.getBoundingClientRect();
                        const isVisible = (
                            rect.top >= 0 &&
                            rect.left >= 0 &&
                            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
                        );

                        if (isVisible) {
                            // 更新当前激活点的引用并设置颜色
                            currentActivePoint = projectPoint;
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

                    // 清除当前激活点的引用和颜色
    
                }
            };

            point.addEventListener('touchend', endDrag);
            point.addEventListener('touchcancel', endDrag);
        });
    }
