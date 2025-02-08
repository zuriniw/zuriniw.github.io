import { projects } from '../projects/project_info.js';

export function initMobilePlayer() {
    if (window.matchMedia('(hover: hover)').matches) return;

    const playerLeft = document.querySelector('.player-left');
    const points = document.querySelectorAll('.point-wrapper');
    console.log('初始化移动播放器，找到点数量:', points.length);
    let draggedPoint = null;
    let dragStartTime = 0;
    const LONG_PRESS_DURATION = 200;  // 长按触发时间
    let dragIndicator = null;  // 添加拖拽指示器变量

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
            if (!isDragging) {
                // 如果移动距离过大，取消长按
                const moveX = e.touches[0].clientX - startX;
                const moveY = e.touches[0].clientY - startY;
                if (Math.abs(moveX) > 10 || Math.abs(moveY) > 10) {
                    clearTimeout(longPressTimer);
                }
                return;
            }

            // 更新拖拽指示器位置
            updateDragIndicator(e.touches[0].clientX, e.touches[0].clientY);

            const touch = e.touches[0];
            const playerRect = playerLeft.getBoundingClientRect();

            // 检查是否在 player-left 区域内
            if (touch.clientX >= playerRect.left && 
                touch.clientX <= playerRect.right && 
                touch.clientY >= playerRect.top && 
                touch.clientY <= playerRect.bottom) {
                
                console.log('进入播放器区域');
                playerLeft.classList.add('drag-over');
                
                const projectTitle = point.querySelector('.point-label').textContent;
                console.log('项目标题:', projectTitle);
                
                const project = projects.find(p => p.title === projectTitle);
                console.log('找到项目:', project);
                
                if (project) {
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
                
                // 移除拖拽指示器
                removeDragIndicator();
            }
        };

        point.addEventListener('touchend', endDrag);
        point.addEventListener('touchcancel', endDrag);
    });
}
