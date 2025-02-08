function createProjectPoints() {
    const container = document.querySelector('.coordinate-container');
    if (!container) return;
    
    projects.forEach(project => {
        if (!project.situate) return;
        
        const pointWrapper = document.createElement('div');
        pointWrapper.className = 'point-wrapper';
        
        let pressTimer;
        let isLongPress = false;
        let touchStartTime = 0;

        // 触摸开始事件
        pointWrapper.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartTime = Date.now();
            
            pressTimer = setTimeout(() => {
                isLongPress = true;
                const pressX = e.touches[0].clientX;
                const pressY = e.touches[0].clientY;
                
                // 创建预览
                const preview = document.createElement('div');
                preview.className = 'point-preview';
                preview.innerHTML = `
                    <img src="${project.getGifPath()}" alt="${project.title}">
                    <div class="preview-title">${project.subtitle}</div>
                `;
                
                // 设置预览位置
                const previewHeight = 160;
                const previewWidth = 214;
                const offset = 20;

                // 根据 project.situate.x 决定预览框的水平位置
                if (project.situate.x < 0) {
                    preview.style.left = `${pressX + offset}px`;  // 点在左侧，预览显示在右边
                } else {
                    preview.style.left = `${pressX - previewWidth - offset}px`;  // 点在右侧，预览显示在左边
                }

                // 预览框始终显示在点的上方
                preview.style.top = `${pressY - previewHeight - offset}px`;
                
                document.body.appendChild(preview);
                requestAnimationFrame(() => {
                    preview.classList.add('show');
                });
                pointWrapper.preview = preview;

                // 添加点的模糊效果
                const point = pointWrapper.querySelector('.project-point');
                point.style.transition = 'all 0.2s ease';
                point.style.transform = 'scale(2)';
                point.style.filter = 'blur(4px)';
                point.style.boxShadow = '0 0 20px 8px rgba(0, 0, 0, 0.2)';

                // 触发震动反馈
                if (window.navigator && window.navigator.vibrate) {
                    window.navigator.vibrate(20);
                }
            }, 200);
        }, { passive: false });

        // 触摸结束事件
        pointWrapper.addEventListener('touchend', () => {
            clearTimeout(pressTimer);
            if (isLongPress) {
                clearLongPressEffects(pointWrapper);
                isLongPress = false;
            }
        });

        // 触摸取消事件
        pointWrapper.addEventListener('touchcancel', () => {
            clearTimeout(pressTimer);
            if (isLongPress) {
                clearLongPressEffects(pointWrapper);
                isLongPress = false;
            }
        });

        // 触摸移动事件
        pointWrapper.addEventListener('touchmove', () => {
            clearTimeout(pressTimer);
            if (isLongPress) {
                clearLongPressEffects(pointWrapper);
                isLongPress = false;
            }
        });
    });
}

// 清除长按效果的辅助函数
function clearLongPressEffects(wrapper) {
    // 移除预览
    const preview = document.querySelector('.point-preview');
    if (preview) {
        preview.classList.add('hide');  // 添加 hide 类以触发淡出动画
        setTimeout(() => preview.remove(), 100);  // 等待动画完成后移除
    }
    
    // 恢复点的原始样式
    const point = wrapper.querySelector('.project-point');
    if (point) {
        point.style.transition = 'all 0.2s ease';  // 添加过渡效果
        point.style.transform = '';
        point.style.filter = '';
        point.style.boxShadow = '';
    }

    // 移除所有存储的引用
    if (wrapper.longPressEffects) {
        wrapper.longPressEffects = null;
    }
    if (wrapper.preview) {
        wrapper.preview = null;
    }
}

// 移动端长按处理
export function initMobilePressPoint() {
    // 只在移动端执行
    if (window.innerWidth > 768) return;

    const points = document.querySelectorAll('.point-wrapper');
    
    points.forEach(point => {
        let pressTimer;
        let isPressing = false;
        let isLongPress = false;

        // 触摸开始
        point.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isPressing = true;
            isLongPress = false;
            
            // 添加短按光标效果
            const cursor = document.createElement('div');
            cursor.className = 'touch-cursor';
            cursor.style.left = `${e.touches[0].clientX - 10}px`;
            cursor.style.top = `${e.touches[0].clientY - 10}px`;
            document.body.appendChild(cursor);
            point.cursor = cursor;
            
            pressTimer = setTimeout(() => {
                if (isPressing) {
                    point.classList.add('press-active');
                    isLongPress = true;
                    // 触发震动反馈
                    if (window.navigator && window.navigator.vibrate) {
                        window.navigator.vibrate(20);
                    }
                    // 长按时移除光标
                    if (point.cursor) {
                        point.cursor.remove();
                        point.cursor = null;
                    }
                }
            }, 200);
        });

        // 触摸结束
        point.addEventListener('touchend', (e) => {
            clearTimeout(pressTimer);
            // 移除光标
            if (point.cursor) {
                point.cursor.remove();
                point.cursor = null;
            }
            if (isPressing) {
                point.classList.remove('press-active');
                point.classList.add('press-feedback');
                setTimeout(() => {
                    point.classList.remove('press-feedback');
                }, 200);
                
                // 如果不是长按，且点有 data-href 属性，则跳转
                if (!isLongPress && point.dataset.href) {
                    window.location.href = point.dataset.href;
                }
            }
            isPressing = false;
        });

        // 触摸取消
        point.addEventListener('touchcancel', () => {
            clearTimeout(pressTimer);
            point.classList.remove('press-active');
            isPressing = false;
            // 移除光标
            if (point.cursor) {
                point.cursor.remove();
                point.cursor = null;
            }
        });

        // 触摸移动
        point.addEventListener('touchmove', (e) => {
            if (isPressing) {
                // 更新光标位置
                if (point.cursor) {
                    point.cursor.style.left = `${e.touches[0].clientX - 10}px`;
                    point.cursor.style.top = `${e.touches[0].clientY - 10}px`;
                }
                const touch = e.touches[0];
                const pointRect = point.getBoundingClientRect();
                const isOutside = 
                    touch.clientX < pointRect.left - 10 ||
                    touch.clientX > pointRect.right + 10 ||
                    touch.clientY < pointRect.top - 10 ||
                    touch.clientY > pointRect.bottom + 10;

                if (isOutside) {
                    clearTimeout(pressTimer);
                    point.classList.remove('press-active');
                    isPressing = false;
                    // 移除光标
                    if (point.cursor) {
                        point.cursor.remove();
                        point.cursor = null;
                    }
                }
            }
        });
    });
}