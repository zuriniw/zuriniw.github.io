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